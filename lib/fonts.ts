// All website fonts, served from our own files (app/fonts/*.woff2) instead of Google Fonts.
// Google's font servers sometimes don't answer during a Vercel build, which made deploys fail
// ("next/font/google ... Module not found"). With local files the build never needs them.
//
// Each file is one variable font covering Latin + Latin Extended (Turkish, Dutch, German…),
// downloaded once from Google Fonts. All are open-source (SIL Open Font License).
import localFont from 'next/font/local'

export const geistSans = localFont({ src: '../app/fonts/geist.woff2', weight: '100 900', variable: '--font-geist-sans', display: 'swap' })
export const geistMono = localFont({ src: '../app/fonts/geist-mono.woff2', weight: '100 900', variable: '--font-geist-mono', display: 'swap' })
export const notoSerif = localFont({ src: '../app/fonts/noto-serif.woff2', weight: '100 900', variable: '--font-noto-serif', display: 'swap' })
export const inter = localFont({ src: '../app/fonts/inter.woff2', weight: '600 900', display: 'swap' })
export const playfair = localFont({ src: '../app/fonts/playfair-display.woff2', weight: '500 700', display: 'swap' })
export const outfit = localFont({ src: '../app/fonts/outfit.woff2', weight: '400 700', display: 'swap' })
export const nunito = localFont({ src: '../app/fonts/nunito.woff2', weight: '600 900', display: 'swap' })
