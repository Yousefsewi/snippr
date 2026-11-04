'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useStored, useClientValue, writeStored } from './use-stored'

export interface Currency { code: string; symbol: string; label: string; locale: string }

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',   label: 'US Dollar',          locale: 'en-US' },
  { code: 'EUR', symbol: '€',   label: 'Euro',               locale: 'de-DE' },
  { code: 'GBP', symbol: '£',   label: 'British Pound',      locale: 'en-GB' },
  { code: 'TRY', symbol: '₺',   label: 'Turkish Lira',       locale: 'tr-TR' },
  { code: 'JPY', symbol: '¥',   label: 'Japanese Yen',       locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥',   label: 'Chinese Yuan',       locale: 'zh-CN' },
  { code: 'INR', symbol: '₹',   label: 'Indian Rupee',       locale: 'en-IN' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham',         locale: 'ar-AE' },
  { code: 'SAR', symbol: '﷼',   label: 'Saudi Riyal',        locale: 'ar-SA' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar',    locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$',  label: 'Australian Dollar',  locale: 'en-AU' },
  { code: 'BRL', symbol: 'R$',  label: 'Brazilian Real',     locale: 'pt-BR' },
  { code: 'RUB', symbol: '₽',   label: 'Russian Ruble',      locale: 'ru-RU' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc',        locale: 'de-CH' },
  { code: 'KRW', symbol: '₩',   label: 'South Korean Won',   locale: 'ko-KR' },
  { code: 'MXN', symbol: 'MX$', label: 'Mexican Peso',       locale: 'es-MX' },
  { code: 'ZAR', symbol: 'R',   label: 'South African Rand', locale: 'en-ZA' },
  { code: 'EGP', symbol: 'E£',  label: 'Egyptian Pound',     locale: 'ar-EG' },
]

// Approximate FX rates (units of currency per 1 USD) — for displaying plan prices
// in the user's currency. Not live rates; good enough for static pricing display.
export const USD_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, TRY: 32, JPY: 150, CNY: 7.2, INR: 83,
  AED: 3.67, SAR: 3.75, CAD: 1.36, AUD: 1.52, BRL: 5.0, RUB: 92, CHF: 0.88,
  KRW: 1330, MXN: 17, ZAR: 18.5, EGP: 48,
}

// Convert a USD amount to the given currency, rounded to a clean whole unit
export function convertFromUSD(usd: number, code: string): number {
  const rate = USD_RATES[code] ?? 1
  return Math.round(usd * rate)
}

// Map a country/region code to its currency (for sensible auto-default)
const regionToCurrency: Record<string, string> = {
  US: 'USD', GB: 'GBP', TR: 'TRY', JP: 'JPY', CN: 'CNY', IN: 'INR', AE: 'AED',
  SA: 'SAR', CA: 'CAD', AU: 'AUD', BR: 'BRL', RU: 'RUB', CH: 'CHF', KR: 'KRW',
  MX: 'MXN', ZA: 'ZAR', EG: 'EGP',
  DE: 'EUR', FR: 'EUR', NL: 'EUR', ES: 'EUR', IT: 'EUR', IE: 'EUR', PT: 'EUR', AT: 'EUR', BE: 'EUR',
}

// Snippr serves shops in the Netherlands, so euros are the default for everyone.
// The browser's region is NOT used (an en-US or tr-TR browser in Assen still pays in €).
// Kept for reference / a future non-NL launch.
export function currencyForRegion(region: string): string | undefined { return regionToCurrency[region.toUpperCase()] }
export const DEFAULT_CURRENCY = 'EUR'
export function detectCurrency(): string {
  return DEFAULT_CURRENCY
}

// Format an amount in the given currency (correct symbol, decimals, placement)
export function formatMoney(amount: number, code: string): string {
  const c = CURRENCIES.find(x => x.code === code)
  const noDecimals = code === 'JPY' || code === 'KRW'
  try {
    return new Intl.NumberFormat(c?.locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: noDecimals ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${c?.symbol ?? ''}${amount}`
  }
}

// v2: everyone was reset to euros once (old saved values were mostly a wrong $ guess)
const KEY = 'snippr-currency-v2'

export function getSavedCurrency(): string {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  return localStorage.getItem(KEY) || detectCurrency()
}

export function setSavedCurrency(code: string) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, code)
}

interface CurrencyCtxValue { currency: string; setCurrency: (c: string) => void; format: (n: number) => string }
const CurrencyCtx = createContext<CurrencyCtxValue>({ currency: DEFAULT_CURRENCY, setCurrency: () => {}, format: (n) => String(n) })

// Saved currency (or a guess from the browser) without needing the provider.
// Used on public pages like the footer picker and the pricing page.
export function useCurrencyChoice(): [string, (c: string) => void] {
  const saved = useStored(KEY)
  const detected = useClientValue(detectCurrency, DEFAULT_CURRENCY)
  return [saved || detected, (c: string) => writeStored(KEY, c)]
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useCurrencyChoice()

  return (
    <CurrencyCtx.Provider value={{ currency, setCurrency, format: (n) => formatMoney(n, currency) }}>
      {children}
    </CurrencyCtx.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyCtx)
