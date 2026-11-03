import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { saveOptout, validToken } from '@/lib/optout'
import { rateLimited, clientIp } from '@/lib/mailer'

// Unsubscribe from thank-you, tip and reminder emails.
// POST with ?e=&t= : used by the /unsubscribe page and by mail apps' one-click
// "Unsubscribe" button (List-Unsubscribe-Post, RFC 8058). GET only shows the page, so link
// scanners that open every link never unsubscribe anyone by accident.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  if (!supabaseServiceKey) return NextResponse.json({ error: 'server not configured' }, { status: 500 })
  if (rateLimited(`unsub:${clientIp(req.headers)}`, 30, 60 * 60 * 1000)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })
  const email = req.nextUrl.searchParams.get('e') ?? ''
  const token = req.nextUrl.searchParams.get('t') ?? ''
  if (!email || !validToken(email, token)) return NextResponse.json({ error: 'invalid link' }, { status: 400 })
  const error = await saveOptout(createClient(supabaseUrl, supabaseServiceKey), email, req.headers.get('content-type')?.includes('form') ? 'one-click' : 'page')
  if (error) { console.error('unsubscribe:', error.message); return NextResponse.json({ error: 'could not save' }, { status: 500 }) }
  return NextResponse.json({ ok: true })
}

export function GET(req: NextRequest) {
  const url = new URL('/unsubscribe', req.nextUrl.origin)
  url.search = req.nextUrl.search
  return NextResponse.redirect(url)
}
