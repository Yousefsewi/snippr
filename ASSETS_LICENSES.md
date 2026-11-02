# Assets & licenses

Every image, video, font and icon set used on snipprcalendar.com, where it comes from and
under which license. Keep this list up to date when adding assets.

Status: ✅ OK for commercial use · ❓ source unknown — confirm or replace before launch

## Images & video (`public/`, `app/`)

| File | Used on | Source | License | Status |
|---|---|---|---|---|
| `public/logo.svg`, `public/logo-white.svg` | Site logo, footer wordmark | Made for Snippr | Own work | ✅ |
| `app/icon.svg`, `app/icon.png`, `app/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png` | Browser tab / app icons | Generated from the Snippr logo | Own work | ✅ |
| `public/demo/barber-avatar.webp` | Homepage feature section, sample barber photo | Unsplash, photo `1553521041-d168abd31de3` | Unsplash License (free commercial use, no attribution required) | ✅ |
| `public/demo/barbershop-cover.webp` | Homepage feature section, sample shop cover | Unsplash, photo `1585747860715-2ba37e788b70` | Unsplash License (free commercial use, no attribution required) | ✅ |
| `public/themes/forest.jpg` | Dashboard "Forest" theme | Unsplash, photo `1470071459604-3b5ec3a7fe05` | Unsplash License (free commercial use, no attribution required) | ✅ |
| `public/hero-clouds.webp` | Homepage hero picture | Supplied by the owner (halftone cloud artwork) | — | ❓ confirm origin (own / AI-generated / licensed) |
| `public/auth-fog.jpg` | Login & sign-up background | Unknown | — | ❓ confirm or replace |
| `public/hero-video.mp4` | Homepage background video — **currently switched off** (`SHOW_HERO_VIDEO`) | Unknown | — | ❓ confirm or delete before switching it on |
| `public/file.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` | Not used (Next.js starter files) | Next.js template | MIT | ✅ (can be deleted) |

Barbers upload their own photos (profile, cover, link images); they keep the rights and
confirm they may use them (Terms of Service → "Content and rights").

## Fonts (all self-hosted via `next/font`, no requests to Google)

| Font | License | Status |
|---|---|---|
| Geist, Geist Mono | SIL Open Font License 1.1 | ✅ |
| Inter | SIL Open Font License 1.1 | ✅ |
| Noto Serif | SIL Open Font License 1.1 | ✅ |
| Outfit | SIL Open Font License 1.1 | ✅ |
| Playfair Display | SIL Open Font License 1.1 | ✅ |

## Icons

| Set | Package | License | Status |
|---|---|---|---|
| Lucide | `lucide-react` | ISC | ✅ |
| Material Design Icons | `react-icons/md` | Apache 2.0 | ✅ |
| Font Awesome Free (brand icons: Instagram, TikTok, WhatsApp, Facebook, YouTube, X) | `react-icons/fa6` | Icons CC BY 4.0 (attribution kept in the package) | ✅ — brand logos are trademarks of their owners, used only to label links |

## Code libraries

All npm dependencies are open source (MIT, ISC, Apache 2.0 or BSD). Full list: `package.json`.
