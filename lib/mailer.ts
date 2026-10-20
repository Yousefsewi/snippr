import nodemailer from 'nodemailer'

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
export const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

const transport = mailerReady
  ? nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } })
  : null

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export async function sendMail(to: string, subject: string, html: string) {
  if (!transport) throw new Error('Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing).')
  await transport.sendMail({ from: `"Snippr" <${user}>`, to, subject, html })
}

// Simple branded layout with one big button
export function buttonEmail(heading: string, text: string, buttonLabel: string, url: string, footnote: string) {
  return `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1d1d1f;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 24px;">✦ Snippr</p>
      <h2 style="font-size: 22px; margin: 0 0 8px;">${esc(heading)}</h2>
      <p style="color: #555; line-height: 1.5; margin: 0 0 24px;">${esc(text)}</p>
      <a href="${esc(url)}" style="display: inline-block; background: #1d1d1f; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 22px; border-radius: 12px;">${esc(buttonLabel)}</a>
      <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 28px 0 0;">${esc(footnote)}</p>
    </div>
  `
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
