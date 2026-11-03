// Versions of the legal texts a new account accepts at sign-up. Bump the date when the
// Terms, DPA or Privacy Policy change, so each account shows which version it agreed to.
export const TERMS_VERSION = '2026-11-01'
export const PRIVACY_VERSION = '2026-11-01'

export const TERMS_ERROR = 'Please accept the Terms of Service and the Data Processing Agreement to create an account.'

// Official subscription prices, billed in euros, excluding 21% Dutch VAT (BTW).
// Used by the plan cards (components/pricing-plans.tsx) and the pre-contract information
// (components/subscription-terms.tsx). Yearly = 10 months (2 months free).
// Check with a boekhouder whether KOR applies (then no VAT is added).
export const VAT_RATE = 0.21
export const PLAN_PRICES_EUR = {
  solo: { monthly: 14.95, yearly: 149 },   // 1 person
  salon: { monthly: 34.95, yearly: 349 },  // 2–5 people, fixed price
  pro: { monthly: 59.95, yearly: 599 },    // unlimited, price on request
} as const
export const TRIAL_DAYS = 14             // free trial, no card
export const FOUNDER_DISCOUNT = 40       // % off for life
export const FOUNDER_SPOTS = 20          // first shops that join
export const SMS_PACK = { count: 100, price: 12 } // add-on, coming soon
