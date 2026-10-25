'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useStored, writeStored } from './use-stored'

export type Lang = 'en' | 'tr' | 'ar' | 'nl' | 'de'

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe',     flag: '🇹🇷' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
]

interface T {
  // sidebar / chrome
  overview: string; calendar: string; waitlist: string; sales: string; appointmentsNav: string; addons: string; services: string; profile: string
  plansBilling: string; settings: string; help: string; signOut: string; signingOut: string; workspace: string
  notifications: string; noNotifications: string; markAllRead: string
  today: string; viewCalendar: string; upcoming: string
  freePlanTitle: string; freePlanSub: string; upgradePlan: string
  getApp: string; iosAndroid: string
  // overview
  greetMorning: string; greetAfternoon: string; greetEvening: string
  upcomingWord: string; apptWord: string; apptWordPlural: string
  quickAccess: string; atAGlance: string; yourBookingLink: string; allAppointments: string
  schedule: string; manageOfferings: string; yourDetails: string; customerJourneys: string
  totalAppointments: string; uniqueCustomers: string; revenue: string; allTime: string; confirmedCompleted: string
  shareLink: string; copyLink: string; copied: string; openLink: string; downloadSvg: string
  colCustomer: string; colService: string; colDate: string; colStatus: string
  noAppointments: string; totalWord: string
  confirm: string; markComplete: string; cancel: string
  st_pending: string; st_confirmed: string; st_cancelled: string; st_completed: string
  // settings
  setTitle: string; setSub: string; account: string; email: string; workspaceField: string; language: string; timezone: string; currency: string
  notifSection: string; emailNotif: string; emailNotifSub: string; smsNotif: string; smsNotifSub: string
  reminders: string; remindersSub: string; publicProfile: string; publicProfileSub: string
  dangerZone: string; deleteAccount: string; deleteAccountSub: string; deleteBtn: string
}

const dict: Record<Lang, T> = {
  en: {
    overview: 'Overview', calendar: 'Calendar', waitlist: 'Waitlist', sales: 'Sales', appointmentsNav: 'Appointments', addons: 'Add-ons', services: 'Services', profile: 'Profile',
    plansBilling: 'Plans & Billing', settings: 'Settings', help: 'Help & Instructions', signOut: 'Sign out', signingOut: 'Signing out…', workspace: 'Workspace',
    notifications: 'Notifications', noNotifications: 'No notifications', markAllRead: 'Mark all as read',
    today: 'Today', viewCalendar: 'View calendar →', upcoming: 'Upcoming',
    freePlanTitle: "You're on the Free plan", freePlanSub: 'Everything is free right now. Paid plans with extra features are coming soon.', upgradePlan: 'See plans',
    getApp: 'Get the app', iosAndroid: 'iOS & Android',
    greetMorning: 'Good morning', greetAfternoon: 'Good afternoon', greetEvening: 'Good evening',
    upcomingWord: 'upcoming', apptWord: 'appointment', apptWordPlural: 'appointments',
    quickAccess: 'Quick access', atAGlance: 'At a glance', yourBookingLink: 'Your booking link', allAppointments: 'All appointments',
    schedule: 'Your schedule', manageOfferings: 'Manage offerings', yourDetails: 'Your details', customerJourneys: 'Customer journeys',
    totalAppointments: 'Total appointments', uniqueCustomers: 'Unique customers', revenue: 'Revenue', allTime: 'all time', confirmedCompleted: 'confirmed + completed',
    shareLink: 'Share this link with your customers', copyLink: 'Copy link', copied: '✓ Copied', openLink: 'Open ↗', downloadSvg: 'Download SVG',
    colCustomer: 'Customer', colService: 'Service', colDate: 'Date & time', colStatus: 'Status',
    noAppointments: 'No appointments yet. Share your booking link to get started.', totalWord: 'total',
    confirm: '✓ Confirm', markComplete: 'Mark complete', cancel: '✕ Cancel',
    st_pending: 'Pending', st_confirmed: 'Confirmed', st_cancelled: 'Cancelled', st_completed: 'Completed',
    setTitle: 'Settings', setSub: 'Manage your account, notifications and preferences', account: 'Account', email: 'Email', workspaceField: 'Workspace', language: 'Language', timezone: 'Timezone', currency: 'Currency',
    notifSection: 'Notifications', emailNotif: 'Email notifications', emailNotifSub: 'New bookings and confirmations', smsNotif: 'SMS notifications', smsNotifSub: 'Text alerts for new appointments',
    reminders: 'Appointment reminders', remindersSub: 'Remind customers before their slot', publicProfile: 'Public profile', publicProfileSub: 'Show your booking page publicly',
    dangerZone: 'Danger zone', deleteAccount: 'Delete account', deleteAccountSub: 'Permanently remove your account and all data', deleteBtn: 'Delete',
  },
  tr: {
    overview: 'Genel Bakış', calendar: 'Takvim', waitlist: 'Bekleme listesi', sales: 'Satışlar', appointmentsNav: 'Randevular', addons: 'Eklentiler', services: 'Hizmetler', profile: 'Profil',
    plansBilling: 'Planlar & Ödeme', settings: 'Ayarlar', help: 'Yardım & Talimatlar', signOut: 'Çıkış yap', signingOut: 'Çıkış yapılıyor…', workspace: 'Çalışma alanı',
    notifications: 'Bildirimler', noNotifications: 'Bildirim yok', markAllRead: 'Tümünü okundu işaretle',
    today: 'Bugün', viewCalendar: 'Takvimi gör →', upcoming: 'Yaklaşan',
    freePlanTitle: 'Ücretsiz plandasın', freePlanSub: 'Şu an her şey ücretsiz. Ek özellikli ücretli planlar yakında.', upgradePlan: 'Planları gör',
    getApp: 'Uygulamayı indir', iosAndroid: 'iOS & Android',
    greetMorning: 'Günaydın', greetAfternoon: 'İyi günler', greetEvening: 'İyi akşamlar',
    upcomingWord: 'yaklaşan', apptWord: 'randevu', apptWordPlural: 'randevu',
    quickAccess: 'Hızlı erişim', atAGlance: 'Genel durum', yourBookingLink: 'Randevu linkin', allAppointments: 'Tüm randevular',
    schedule: 'Programın', manageOfferings: 'Hizmetleri yönet', yourDetails: 'Bilgilerin', customerJourneys: 'Müşteri yolculukları',
    totalAppointments: 'Toplam randevu', uniqueCustomers: 'Benzersiz müşteri', revenue: 'Gelir', allTime: 'tüm zamanlar', confirmedCompleted: 'onaylı + tamamlanan',
    shareLink: 'Bu linki müşterilerinle paylaş', copyLink: 'Linki kopyala', copied: '✓ Kopyalandı', openLink: 'Aç ↗', downloadSvg: 'SVG indir',
    colCustomer: 'Müşteri', colService: 'Hizmet', colDate: 'Tarih & saat', colStatus: 'Durum',
    noAppointments: 'Henüz randevu yok. Başlamak için randevu linkini paylaş.', totalWord: 'toplam',
    confirm: '✓ Onayla', markComplete: 'Tamamlandı', cancel: '✕ İptal',
    st_pending: 'Bekliyor', st_confirmed: 'Onaylı', st_cancelled: 'İptal', st_completed: 'Tamamlandı',
    setTitle: 'Ayarlar', setSub: 'Hesabını, bildirimleri ve tercihleri yönet', account: 'Hesap', email: 'E-posta', workspaceField: 'Çalışma alanı', language: 'Dil', timezone: 'Saat dilimi', currency: 'Para birimi',
    notifSection: 'Bildirimler', emailNotif: 'E-posta bildirimleri', emailNotifSub: 'Yeni randevular ve onaylar', smsNotif: 'SMS bildirimleri', smsNotifSub: 'Yeni randevular için SMS uyarısı',
    reminders: 'Randevu hatırlatmaları', remindersSub: 'Müşterilere randevudan önce hatırlat', publicProfile: 'Herkese açık profil', publicProfileSub: 'Randevu sayfanı herkese açık göster',
    dangerZone: 'Tehlikeli bölge', deleteAccount: 'Hesabı sil', deleteAccountSub: 'Hesabını ve tüm verilerini kalıcı olarak sil', deleteBtn: 'Sil',
  },
  ar: {
    overview: 'نظرة عامة', calendar: 'التقويم', waitlist: 'قائمة الانتظار', sales: 'المبيعات', appointmentsNav: 'المواعيد', addons: 'الإضافات', services: 'الخدمات', profile: 'الملف الشخصي',
    plansBilling: 'الخطط والفوترة', settings: 'الإعدادات', help: 'المساعدة والإرشادات', signOut: 'تسجيل الخروج', signingOut: 'جارٍ الخروج…', workspace: 'مساحة العمل',
    notifications: 'الإشعارات', noNotifications: 'لا توجد إشعارات', markAllRead: 'تعليم الكل كمقروء',
    today: 'اليوم', viewCalendar: 'عرض التقويم →', upcoming: 'القادمة',
    freePlanTitle: 'أنت على الخطة المجانية', freePlanSub: 'كل شيء مجاني الآن. الخطط المدفوعة بميزات إضافية قريبًا.', upgradePlan: 'عرض الخطط',
    getApp: 'حمّل التطبيق', iosAndroid: 'iOS و Android',
    greetMorning: 'صباح الخير', greetAfternoon: 'مساء الخير', greetEvening: 'مساء الخير',
    upcomingWord: 'قادم', apptWord: 'موعد', apptWordPlural: 'مواعيد',
    quickAccess: 'وصول سريع', atAGlance: 'لمحة سريعة', yourBookingLink: 'رابط الحجز الخاص بك', allAppointments: 'كل المواعيد',
    schedule: 'جدولك', manageOfferings: 'إدارة الخدمات', yourDetails: 'بياناتك', customerJourneys: 'رحلات العملاء',
    totalAppointments: 'إجمالي المواعيد', uniqueCustomers: 'عملاء فريدون', revenue: 'الإيرادات', allTime: 'كل الأوقات', confirmedCompleted: 'مؤكد + مكتمل',
    shareLink: 'شارك هذا الرابط مع عملائك', copyLink: 'نسخ الرابط', copied: '✓ تم النسخ', openLink: 'فتح ↗', downloadSvg: 'تنزيل SVG',
    colCustomer: 'العميل', colService: 'الخدمة', colDate: 'التاريخ والوقت', colStatus: 'الحالة',
    noAppointments: 'لا مواعيد بعد. شارك رابط الحجز للبدء.', totalWord: 'الإجمالي',
    confirm: '✓ تأكيد', markComplete: 'إكمال', cancel: '✕ إلغاء',
    st_pending: 'قيد الانتظار', st_confirmed: 'مؤكد', st_cancelled: 'ملغى', st_completed: 'مكتمل',
    setTitle: 'الإعدادات', setSub: 'إدارة حسابك وإشعاراتك وتفضيلاتك', account: 'الحساب', email: 'البريد الإلكتروني', workspaceField: 'مساحة العمل', language: 'اللغة', timezone: 'المنطقة الزمنية', currency: 'العملة',
    notifSection: 'الإشعارات', emailNotif: 'إشعارات البريد', emailNotifSub: 'حجوزات وتأكيدات جديدة', smsNotif: 'إشعارات SMS', smsNotifSub: 'تنبيهات نصية للمواعيد الجديدة',
    reminders: 'تذكيرات المواعيد', remindersSub: 'ذكّر العملاء قبل موعدهم', publicProfile: 'ملف عام', publicProfileSub: 'اعرض صفحة الحجز للعامة',
    dangerZone: 'منطقة خطرة', deleteAccount: 'حذف الحساب', deleteAccountSub: 'احذف حسابك وكل البيانات نهائيًا', deleteBtn: 'حذف',
  },
  nl: {
    overview: 'Overzicht', calendar: 'Agenda', waitlist: 'Wachtlijst', sales: 'Verkoop', appointmentsNav: 'Afspraken', addons: 'Add-ons', services: 'Diensten', profile: 'Profiel',
    plansBilling: 'Abonnementen', settings: 'Instellingen', help: 'Help & Uitleg', signOut: 'Uitloggen', signingOut: 'Uitloggen…', workspace: 'Werkruimte',
    notifications: 'Meldingen', noNotifications: 'Geen meldingen', markAllRead: 'Alles als gelezen markeren',
    today: 'Vandaag', viewCalendar: 'Agenda bekijken →', upcoming: 'Aankomend',
    freePlanTitle: 'Je gebruikt het Gratis-abonnement', freePlanSub: 'Alles is nu gratis. Betaalde abonnementen met extra functies komen binnenkort.', upgradePlan: 'Bekijk abonnementen',
    getApp: 'Download de app', iosAndroid: 'iOS & Android',
    greetMorning: 'Goedemorgen', greetAfternoon: 'Goedemiddag', greetEvening: 'Goedenavond',
    upcomingWord: 'aankomende', apptWord: 'afspraak', apptWordPlural: 'afspraken',
    quickAccess: 'Snelle toegang', atAGlance: 'In één oogopslag', yourBookingLink: 'Jouw boekingslink', allAppointments: 'Alle afspraken',
    schedule: 'Jouw planning', manageOfferings: 'Diensten beheren', yourDetails: 'Jouw gegevens', customerJourneys: 'Klantreizen',
    totalAppointments: 'Totaal afspraken', uniqueCustomers: 'Unieke klanten', revenue: 'Omzet', allTime: 'altijd', confirmedCompleted: 'bevestigd + voltooid',
    shareLink: 'Deel deze link met je klanten', copyLink: 'Link kopiëren', copied: '✓ Gekopieerd', openLink: 'Openen ↗', downloadSvg: 'SVG downloaden',
    colCustomer: 'Klant', colService: 'Dienst', colDate: 'Datum & tijd', colStatus: 'Status',
    noAppointments: 'Nog geen afspraken. Deel je boekingslink om te beginnen.', totalWord: 'totaal',
    confirm: '✓ Bevestigen', markComplete: 'Voltooien', cancel: '✕ Annuleren',
    st_pending: 'In afwachting', st_confirmed: 'Bevestigd', st_cancelled: 'Geannuleerd', st_completed: 'Voltooid',
    setTitle: 'Instellingen', setSub: 'Beheer je account, meldingen en voorkeuren', account: 'Account', email: 'E-mail', workspaceField: 'Werkruimte', language: 'Taal', timezone: 'Tijdzone', currency: 'Valuta',
    notifSection: 'Meldingen', emailNotif: 'E-mailmeldingen', emailNotifSub: 'Nieuwe boekingen en bevestigingen', smsNotif: 'SMS-meldingen', smsNotifSub: 'Sms-waarschuwingen voor nieuwe afspraken',
    reminders: 'Afspraakherinneringen', remindersSub: 'Herinner klanten vóór hun afspraak', publicProfile: 'Openbaar profiel', publicProfileSub: 'Toon je boekingspagina openbaar',
    dangerZone: 'Gevarenzone', deleteAccount: 'Account verwijderen', deleteAccountSub: 'Verwijder je account en alle gegevens permanent', deleteBtn: 'Verwijderen',
  },
  de: {
    overview: 'Übersicht', calendar: 'Kalender', waitlist: 'Warteliste', sales: 'Verkäufe', appointmentsNav: 'Termine', addons: 'Add-ons', services: 'Leistungen', profile: 'Profil',
    plansBilling: 'Tarife & Abrechnung', settings: 'Einstellungen', help: 'Hilfe & Anleitung', signOut: 'Abmelden', signingOut: 'Abmelden…', workspace: 'Arbeitsbereich',
    notifications: 'Benachrichtigungen', noNotifications: 'Keine Benachrichtigungen', markAllRead: 'Alle als gelesen markieren',
    today: 'Heute', viewCalendar: 'Kalender ansehen →', upcoming: 'Anstehend',
    freePlanTitle: 'Du nutzt den Free-Tarif', freePlanSub: 'Derzeit ist alles kostenlos. Kostenpflichtige Tarife mit Extras folgen bald.', upgradePlan: 'Tarife ansehen',
    getApp: 'App holen', iosAndroid: 'iOS & Android',
    greetMorning: 'Guten Morgen', greetAfternoon: 'Guten Tag', greetEvening: 'Guten Abend',
    upcomingWord: 'anstehende', apptWord: 'Termin', apptWordPlural: 'Termine',
    quickAccess: 'Schnellzugriff', atAGlance: 'Auf einen Blick', yourBookingLink: 'Dein Buchungslink', allAppointments: 'Alle Termine',
    schedule: 'Dein Zeitplan', manageOfferings: 'Leistungen verwalten', yourDetails: 'Deine Daten', customerJourneys: 'Kundenreisen',
    totalAppointments: 'Termine gesamt', uniqueCustomers: 'Einzelne Kunden', revenue: 'Umsatz', allTime: 'gesamt', confirmedCompleted: 'bestätigt + abgeschlossen',
    shareLink: 'Teile diesen Link mit deinen Kunden', copyLink: 'Link kopieren', copied: '✓ Kopiert', openLink: 'Öffnen ↗', downloadSvg: 'SVG herunterladen',
    colCustomer: 'Kunde', colService: 'Leistung', colDate: 'Datum & Zeit', colStatus: 'Status',
    noAppointments: 'Noch keine Termine. Teile deinen Buchungslink, um zu starten.', totalWord: 'gesamt',
    confirm: '✓ Bestätigen', markComplete: 'Abschließen', cancel: '✕ Stornieren',
    st_pending: 'Ausstehend', st_confirmed: 'Bestätigt', st_cancelled: 'Storniert', st_completed: 'Abgeschlossen',
    setTitle: 'Einstellungen', setSub: 'Verwalte dein Konto, Benachrichtigungen und Einstellungen', account: 'Konto', email: 'E-Mail', workspaceField: 'Arbeitsbereich', language: 'Sprache', timezone: 'Zeitzone', currency: 'Währung',
    notifSection: 'Benachrichtigungen', emailNotif: 'E-Mail-Benachrichtigungen', emailNotifSub: 'Neue Buchungen und Bestätigungen', smsNotif: 'SMS-Benachrichtigungen', smsNotifSub: 'SMS-Hinweise für neue Termine',
    reminders: 'Terminerinnerungen', remindersSub: 'Erinnere Kunden vor ihrem Termin', publicProfile: 'Öffentliches Profil', publicProfileSub: 'Zeige deine Buchungsseite öffentlich',
    dangerZone: 'Gefahrenzone', deleteAccount: 'Konto löschen', deleteAccountSub: 'Konto und alle Daten dauerhaft entfernen', deleteBtn: 'Löschen',
  },
}

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: T; isRTL: boolean }
const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: dict.en, isRTL: false })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const saved = useStored('snippr-lang') as Lang | null
  const lang: Lang = saved && dict[saved] ? saved : 'en'

  const setLang = (l: Lang) => writeStored('snippr-lang', l)

  return (
    <Ctx.Provider value={{ lang, setLang, t: dict[lang], isRTL: lang === 'ar' }}>
      {children}
    </Ctx.Provider>
  )
}

export const useLang = () => useContext(Ctx)
