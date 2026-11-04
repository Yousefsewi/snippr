import nodemailer from 'nodemailer'
import { emailLayout } from './email-layout'

// SERVER ONLY — import this from app/api routes, never from a 'use client' file.
// All of Snippr's emails (sign-up confirmation, password reset, booking confirmation)
// go out through one Gmail account via SMTP — free, no domain needed.
// Set in .env.local:
//   GMAIL_USER=you@gmail.com
//   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   (Google Account → Security → App passwords)
//   SITE_URL=http://localhost:3000           (your live URL in production)
const user = process.env.GMAIL_USER
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '')

export const mailerReady = Boolean(user && pass)

// Links in emails always use this fixed address, never the request's Host header,
// so nobody can make a reset email point at their own site.
export { SITE_URL } from './site-url'

const transport = mailerReady
  ? nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } })
  : null

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// Only one plain address like "name@example.com": no display names, comments, brackets,
// commas or spaces. Client-typed addresses must never be able to add extra recipients
// (see nodemailer advisory GHSA-8c8m-p3m8-cjg8).
export const isPlainEmail = (to: unknown): to is string =>
  typeof to === 'string' && to.length <= 254 && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(to)

export async function sendMail(to: string, subject: string, html: string, opts: { replyTo?: string; unsubscribeUrl?: string } = {}) {
  if (!transport) throw new Error('Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing).')
  if (!isPlainEmail(to)) throw new Error('Invalid email address.')
  if (opts.replyTo !== undefined && !isPlainEmail(opts.replyTo)) throw new Error('Invalid reply-to address.')
  // passing address objects skips nodemailer's address parser entirely
  await transport.sendMail({
    from: `"Snippr" <${user}>`, to: { name: '', address: to }, subject, html,
    ...(opts.replyTo ? { replyTo: { name: '', address: opts.replyTo } } : {}),
    // one-click unsubscribe (RFC 8058) for thank-you / tip / reminder emails
    ...(opts.unsubscribeUrl ? { headers: { 'List-Unsubscribe': `<${opts.unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } } : {}),
  })
}

// Snippr's own emails (account confirmation, password reset): the shared design, one big button
export function buttonEmail(heading: string, text: string, buttonLabel: string, url: string, footnote: string) {
  return emailLayout({
    preheader: text, heading, text, button: { label: buttonLabel, url }, note: footnote,
    footer: ['Snippr · online booking for barbers and salons', 'snipprcalendar.com'],
  })
}

// Small in-memory rate limiter (per server instance; resets on restart)
const hits = new Map<string, number[]>()
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs)
  if (recent.length >= max) { hits.set(key, recent); return true }
  recent.push(now)
  hits.set(key, recent)
  return false
}

export const clientIp = (headers: Headers) =>
  headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || 'local'
