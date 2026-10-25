// "Leaked password" check, like Supabase's paid-plan feature, using the free
// HaveIBeenPwned range API. Only the first 5 characters of the password's SHA-1 hash
// leave the device (k-anonymity) — never the password itself.
// Works in the browser and on the server. If the service can't be reached, it lets the
// password through rather than blocking sign-up.

export async function isPwnedPassword(password: string): Promise<boolean> {
  try {
    const bytes = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password))
    const hash = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    const prefix = hash.slice(0, 5), suffix = hash.slice(5)
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { 'Add-Padding': 'true' }, signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return false
    const text = await res.text()
    // each line is "SUFFIX:COUNT"; padding lines have a count of 0
    return text.split('\n').some(line => {
      const [s, count] = line.trim().split(':')
      return s === suffix && Number(count) > 0
    })
  } catch {
    return false
  }
}

export const PWNED_MESSAGE = {
  en: 'This password has appeared in a data leak, so it isn’t safe. Please choose a different one.',
  tr: 'Bu şifre daha önce bir veri sızıntısında ortaya çıkmış, güvenli değil. Lütfen başka bir şifre seç.',
}
