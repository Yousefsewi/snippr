import type { Metadata } from 'next'
import ManageAppointment from './manage'

// The client's own appointment page, opened from the link in their booking emails.
export const metadata: Metadata = {
  title: 'Your appointment · Snippr',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function AppointmentPage() {
  return <ManageAppointment />
}
