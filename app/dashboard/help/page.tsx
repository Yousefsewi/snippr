'use client'

import { useState } from 'react'
import { SUPPORT_EMAIL } from '@/lib/site'

const text = 'text-[#37352f]'
const muted = 'text-[#9b9a97]'
const border = 'border-[#e9e9e7]'

const steps = [
  { n: 1, title: 'Set up your profile', desc: 'Add your name, photo, address and working hours in the Profile page.' },
  { n: 2, title: 'Add your services', desc: 'Create the services you offer with durations and prices in Services.' },
  { n: 3, title: 'Share your booking link', desc: 'Copy your link or QR code from Overview and share it with customers.' },
  { n: 4, title: 'Manage appointments', desc: 'Confirm, complete or cancel bookings from Overview and Calendar.' },
]

const faqs = [
  { q: 'How do customers book an appointment?', a: 'They open your public booking link, pick a service, choose an available time slot and confirm. The booking appears instantly in your Overview and Calendar.' },
  { q: 'Can I change my working hours?', a: 'Yes. Go to Profile → Working hours, toggle the days you work and set start/end times. Customers can only book within those hours.' },
  { q: 'How do I edit or delete a service?', a: 'Open the Services page, then use the Edit or Delete button next to any service.' },
  { q: 'What does the QR code do?', a: 'The QR code on the Overview page links to your booking page. Print it or show it so customers can scan and book directly.' },
  { q: 'How do reminders work?', a: 'When enabled in Settings, customers get an automatic reminder before their appointment time.' },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-8" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div>
        <h1 className={`text-[28px] font-bold tracking-tight ${text}`}>Help &amp; Instructions</h1>
        <p className={`mt-1.5 text-sm ${muted}`}>Everything you need to get started and make the most of Snippr</p>
      </div>

      {/* Getting started steps */}
      <section>
        <p className={`mb-3 px-1 text-xs font-medium ${muted}`}>Getting started</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className={`rounded-lg border ${border} bg-[#ffffff] p-4`}>
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#37352f] text-xs font-semibold text-[#ffffff]">{n}</div>
              <p className={`text-sm font-medium ${text}`}>{title}</p>
              <p className={`mt-1 text-xs leading-relaxed ${muted}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <p className={`mb-3 px-1 text-xs font-medium ${muted}`}>Frequently asked questions</p>
        <div className={`overflow-hidden rounded-lg border ${border} bg-[#ffffff] divide-y divide-[#e9e9e7]`}>
          {faqs.map((f, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-[#f7f7f5]"
              >
                <span className={`text-sm font-medium ${text}`}>{f.q}</span>
                <span className={`ml-3 text-xs ${muted} transition-transform ${open === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {open === i && (
                <div className={`px-4 pb-4 text-sm leading-relaxed ${muted}`}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <p className={`mb-3 px-1 text-xs font-medium ${muted}`}>Still need help?</p>
        <div className={`flex items-center justify-between rounded-lg border ${border} bg-[#ffffff] p-4`}>
          <div>
            <p className={`text-sm font-medium ${text}`}>Contact support</p>
            <p className={`text-xs ${muted}`}>We usually reply within a few hours</p>
          </div>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="rounded-md bg-[#37352f] px-4 py-2 text-sm font-medium text-[#ffffff] transition hover:opacity-90"
          >
            Email us
          </a>
        </div>
      </section>
    </div>
  )
}
