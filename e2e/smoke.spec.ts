import { test, expect, type Page } from '@playwright/test'

// The cookie banner already answered and a site language chosen, like a returning visitor.
async function prepare(page: Page, lang?: string) {
  await page.addInitScript(l => {
    try {
      localStorage.setItem('snippr-cookie-consent', JSON.stringify({ v: 1, necessary: true, analytics: false, marketing: false, at: new Date().toISOString() }))
      if (l) localStorage.setItem('snippr-lang', l)
    } catch { /* storage blocked */ }
  }, lang)
}

const noSideScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)

test.describe('homepage in every language', () => {
  const HOMES = [
    { path: '/', h1: /NEVER MISS/, lang: 'en' },
    { path: '/nl', h1: /MIS GEEN/, lang: 'nl' },
    { path: '/de', h1: /VERPASSE/, lang: 'de' },
    { path: '/tr', h1: /TELEFON/, lang: 'tr' },
    { path: '/ar', h1: /تفوّت/, lang: 'ar' },
  ]
  for (const h of HOMES) {
    test(`${h.path} shows its own language`, async ({ page }) => {
      await prepare(page, h.path === '/' ? 'en' : undefined)
      await page.goto(h.path)
      await expect(page.locator('h1').first()).toHaveText(h.h1)
      await expect(page.locator(`main[lang="${h.lang}"]`)).toHaveCount(1)
      await expect(page.locator('link[rel="alternate"][hreflang="nl"]')).toHaveCount(1)
      await noSideScroll(page)
    })
  }

  test('switching language on /ar opens the English homepage', async ({ page }) => {
    await prepare(page)
    await page.goto('/ar')
    await page.getByRole('button', { name: /العربية/ }).last().click()
    await page.getByRole('menuitemradio', { name: /English/ }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('h1').first()).toHaveText(/NEVER MISS/)
  })
})

test('demo shop: a client can pick a service, a day and a time', async ({ page }) => {
  await prepare(page, 'en')
  await page.goto('/b/demo')
  await expect(page.getByText('Golden Scissors').first()).toBeVisible()
  await page.getByRole('button', { name: /^Service/ }).click()
  await page.getByRole('button', { name: /Knippen\s+30 min/ }).click()
  // today is picked automatically; if no time is left today, pick the next days one by one
  const freeTime = page.locator('button:enabled', { hasText: /^\d{2}:\d{2}$/ }).first()
  const days = page.getByRole('button', { name: /^(mon|tue|wed|thu|fri|sat|sun)\s*\d/i })
  if (!(await freeTime.waitFor({ timeout: 4000 }).then(() => true, () => false))) {
    // the day list opens by itself after a service; open it only when it is closed
    if (!(await days.first().isVisible().catch(() => false))) await page.getByRole('button', { name: /^Date/ }).click()
    for (let i = 0; i < 8 && !(await freeTime.isVisible().catch(() => false)); i++) {
      await days.nth(i).click()
      await page.waitForTimeout(400)
    }
  }
  await freeTime.click()
  await expect(page.getByRole('button', { name: /^Book/ })).toBeVisible()
  await noSideScroll(page)
})

test('pricing shows the three plans', async ({ page }) => {
  await prepare(page, 'en')
  await page.goto('/pricing')
  for (const price of ['14,95', '34,95', '59,95']) await expect(page.getByText(price).first()).toBeVisible()
  await noSideScroll(page)
})

test('sign-up and login pages have their forms', async ({ page }) => {
  await prepare(page, 'en')
  await page.goto('/register')
  await expect(page.locator('input[type="email"]').first()).toBeVisible()
  await page.goto('/login')
  await expect(page.locator('input[type="password"]').first()).toBeVisible()
})

test('FAQ answers are in the page and open on tap', async ({ page }) => {
  await prepare(page, 'en')
  await page.goto('/faq')
  await page.getByRole('button', { name: /Is there a setup fee/ }).click()
  await expect(page.getByText(/No setup fees/)).toBeVisible()
})
