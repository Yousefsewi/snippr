// Catches common misspellings of big email providers ("gamil.com" → "gmail.com"),
// so a typo doesn't create an unreachable account or block a login.
const FIXES: Record<string, string> = {
  'gamil.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.con': 'gmail.com', 'gmai.com': 'gmail.com',
  'gnail.com': 'gmail.com', 'gmail.om': 'gmail.com', 'gmailcom': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmil.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'hotamil.com': 'hotmail.com', 'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com', 'outllok.com': 'outlook.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co': 'yahoo.com',
  'iclod.com': 'icloud.com', 'icloud.co': 'icloud.com', 'icoud.com': 'icloud.com',
}

/** Returns the corrected address if the domain looks like a typo, otherwise null. */
export function suggestEmail(email: string): string | null {
  const clean = email.trim().toLowerCase()
  const at = clean.lastIndexOf('@')
  if (at < 1) return null
  const fix = FIXES[clean.slice(at + 1)]
  return fix ? `${clean.slice(0, at)}@${fix}` : null
}
