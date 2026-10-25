// "Closed time" and "time off" are stored as appointments whose customer name starts with this mark.
// That way the public booking page treats them as busy (get_busy_slots) without any database change.
export const BLOCK_MARK = '⛔'

export const isBlock = (a: { customer_name?: string | null }) => (a.customer_name ?? '').startsWith(BLOCK_MARK)

export const blockName = (reason: string) => `${BLOCK_MARK} ${reason.trim()}`.slice(0, 100)

export const blockReason = (a: { customer_name?: string | null }) => (a.customer_name ?? '').replace(BLOCK_MARK, '').trim()
