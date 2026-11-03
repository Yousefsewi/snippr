// Versions of the legal texts a new account accepts at sign-up. Bump the date when the
// Terms, DPA or Privacy Policy change, so each account shows which version it agreed to.
export const TERMS_VERSION = '2026-11-01'
export const PRIVACY_VERSION = '2026-11-01'

export const TERMS_ERROR = 'Please accept the Terms of Service and the Data Processing Agreement to create an account.'

// Official subscription prices, billed in euros, excluding 21% Dutch VAT (BTW).
// Shown in the pre-contract information (components/subscription-terms.tsx). Keep them in
// step with the plan cards in components/pricing-plans.tsx.
export const VAT_RATE = 0.21
export const PLAN_PRICES_EUR = {
  pro: { monthly: 6, yearly: 60 },
  business: { monthly: 15, yearly: 150 },
} as const
