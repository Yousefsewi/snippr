import HomePage from '@/components/home-page'
import { homeMetadata } from '@/lib/home-meta'

export const metadata = homeMetadata('en')

export default function Page() {
  return <HomePage />
}
