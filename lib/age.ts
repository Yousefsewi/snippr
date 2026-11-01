// Sign-up age rule: only people aged 18 or older may create an account.
export const MIN_AGE = 18

// Age in whole years for a birth date like "2001-04-23"; null when the date is invalid.
export function ageFrom(birthDate: string, today = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(birthDate ?? ''))
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const born = new Date(Date.UTC(y, mo - 1, d))
  if (born.getUTCFullYear() !== y || born.getUTCMonth() !== mo - 1 || born.getUTCDate() !== d) return null
  let age = today.getUTCFullYear() - y
  const beforeBirthday = today.getUTCMonth() < mo - 1 || (today.getUTCMonth() === mo - 1 && today.getUTCDate() < d)
  if (beforeBirthday) age--
  return age >= 0 && age <= 120 ? age : null
}

export const AGE_ERRORS = {
  invalid: 'Please enter a valid date of birth.',
  tooYoung: `You must be at least ${MIN_AGE} years old to create a Snippr account.`,
}
