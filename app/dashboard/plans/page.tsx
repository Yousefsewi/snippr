'use client'

import { useState } from 'react'
import { useCurrency, convertFromUSD, CURRENCIES } from '@/lib/currency'

const text = 'text-[#37352f]'
const muted = 'text-[#9b9a97]'
const border = 'border-[#e9e9e7]'

type Plan = {
  name: string
  // base prices in USD — converted to the user's currency at render time
  price: { monthly: number; yearly: number }
  tagline: string
  features: string[]
  current?: boolean
  highlight?: boolean
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    tagline: 'For getting started',
    features: ['Your own booking page & link', 'Live calendar', 'Booking confirmation emails', 'New-booking notifications', 'Email support'],
    current: true,
  },
  {
    name: 'Pro',
    price: { monthly: 6, yearly: 60 },
    tagline: 'For growing barbers',
    features: ['Unlimited bookings', 'SMS reminders', 'Analytics & revenue', 'Custom branding', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Business',
    price: { monthly: 15, yearly: 150 },
    tagline: 'For shops & teams',
    features: ['Everything in Pro', 'Multiple staff members', 'Team calendar', 'Advanced reports', 'Dedicated manager'],
  },
]

export default function PlansPage() {
  const [yearly, setYearly] = useState(false)
  const { format, currency } = useCurrency()
  const currencyLabel = CURRENCIES.find(c => c.code === currency)?.label ?? currency

  return (
    <div className="flex flex-col gap-8" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div>
        <h1 className={`text-[28px] font-bold tracking-tight ${text}`}>Plans &amp; Billing</h1>
        <p className={`mt-1.5 text-sm ${muted}`}>Choose the plan that fits your business</p>
      </div>

      {/* Paid plans don't exist yet — say so instead of showing buttons that do nothing */}
      <div className="rounded-xl border border-[#d3e5ef] bg-[#eef6fb] px-4 py-3 text-sm text-[#183347]">
        <strong>Everything is free right now.</strong> Pro and Business are coming soon — you&apos;ll keep all your data when they launch.
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3">
        <span className={`text-sm ${!yearly ? text : muted}`}>Monthly</span>
        <button
          onClick={() => setYearly(!yearly)}
          style={{
            width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
            background: yearly ? '#37352f' : '#e3e2e0', position: 'relative', flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <span style={{ position: 'absolute', top: 3, left: yearly ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
        </button>
        <span className={`text-sm ${yearly ? text : muted}`}>
          Yearly <span className="text-[#1c3829] bg-[#dbeddb] rounded px-1.5 py-0.5 text-xs font-medium ml-1">2 months free</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-xl border bg-white p-6 ${p.highlight ? 'border-[#37352f] shadow-lg' : border}`}
          >
            {p.highlight && (
              <span className="absolute -top-2.5 left-6 rounded-full bg-[#37352f] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Most popular
              </span>
            )}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <p className={`text-base font-semibold ${text}`}>{p.name}</p>
                {p.current && (
                  <span className="rounded-full bg-[#fbfbfa] px-2 py-0.5 text-[10px] font-medium text-[#37352f]">Current</span>
                )}
              </div>
              <p className={`text-xs ${muted}`}>{p.tagline}</p>
            </div>

            <div className="mb-5">
              <span className={`text-3xl font-bold ${text}`}>{format(convertFromUSD(yearly ? p.price.yearly : p.price.monthly, currency))}</span>
              <span className={`text-sm ${muted}`}>/{yearly ? 'yr' : 'mo'}</span>
            </div>

            <ul className="mb-6 flex flex-col gap-2.5">
              {p.features.map((f) => (
                <li key={f} className={`flex items-start gap-2 text-sm ${text}`}>
                  <span className="mt-0.5 text-[#1c3829]">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              disabled
              className={`mt-auto w-full rounded-md py-2.5 text-sm font-medium transition ${
                p.current
                  ? 'cursor-default border border-[#e9e9e7] bg-[#f7f7f5] text-[#9b9a97]'
                  : 'cursor-not-allowed border border-dashed border-[#d3d3d1] bg-white text-[#9b9a97]'
              }`}
            >
              {p.current ? 'Current plan' : 'Coming soon'}
            </button>
          </div>
        ))}
      </div>

      <p className={`text-center text-xs ${muted}`}>
        Planned prices shown in {currencyLabel}. Paid plans are not available yet.
      </p>
    </div>
  )
}
