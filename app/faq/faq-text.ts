// Questions and answers on the FAQ page, per site language (used by page.tsx and layout.tsx).
import type { SiteLng } from '@/lib/site-lang'
import { TRIAL_DAYS } from '@/lib/legal'

type QA = { question: string; answer: string }
export const FAQ_TEXT: Record<SiteLng, { title: string; sub: string; still: string; reply: string; start: string; contact: string; faqs: QA[] }> = {
  en: {
    title: 'Frequently Asked Questions', sub: 'Everything you need to know about Snippr barber booking.',
    still: 'Still have questions?', reply: 'Email us — we usually reply within a day.', start: 'Get started', contact: 'Contact support',
    faqs: [
      { question: 'How do I create a booking link?', answer: 'Sign up for a Snippr account, add your services and availability, and you\'ll get a unique booking link. Share it on Instagram or WhatsApp, or print its QR code for your shop.' },
      { question: 'Is there a setup fee?', answer: `No setup fees. Every plan is free to try for ${TRIAL_DAYS} days, no credit card required, and nothing is charged when the trial ends.` },
      { question: 'How do customers book appointments?', answer: 'Customers simply visit your booking link, select a service and time that works for them, and confirm. If they leave their email they get a confirmation right away and an automatic reminder before the appointment.' },
      { question: 'Can I manage multiple barbers?', answer: 'Not yet — today each account is one barber with one calendar. Team calendars are on our roadmap.' },
      { question: 'What payment methods do you accept?', answer: 'Currently, payments are handled directly between you and your customers. Snippr is a booking tool, not a payment processor.' },
      { question: 'Do you have a mobile app?', answer: 'Not yet in the app stores. Snippr works fully in your phone\'s browser today — you can add it to your home screen. Native iOS and Android apps are in the works.' },
      { question: 'Do customers get a confirmation?', answer: 'Yes — if a customer leaves their email, they get a confirmation with the date, time and price right after booking, and you get a notification. They also get an automatic reminder before the appointment.' },
      { question: 'Can I set my opening hours?', answer: 'Yes — set your hours for each day of the week and switch off the days you are closed. Customers can only book when you are open.' },
    ],
  },
  nl: {
    title: 'Veelgestelde vragen', sub: 'Alles wat je moet weten over boeken bij de kapper met Snippr.',
    still: 'Nog vragen?', reply: 'Mail ons, we antwoorden meestal binnen een dag.', start: 'Beginnen', contact: 'Contact opnemen',
    faqs: [
      { question: 'Hoe maak ik een boekingslink?', answer: 'Maak een Snippr-account aan, voeg je behandelingen en beschikbaarheid toe en je krijgt je eigen boekingslink. Deel hem op Instagram of WhatsApp, of print de QR-code voor je zaak.' },
      { question: 'Zijn er opstartkosten?', answer: `Geen opstartkosten. Elk abonnement kun je ${TRIAL_DAYS} dagen gratis proberen, zonder creditcard, en er wordt niets afgeschreven als de proef afloopt.` },
      { question: 'Hoe boeken klanten een afspraak?', answer: 'Klanten openen je boekingslink, kiezen een behandeling en een tijd die hen uitkomt en bevestigen. Laten ze hun e-mail achter, dan krijgen ze meteen een bevestiging en een automatische herinnering vóór de afspraak.' },
      { question: 'Kan ik meerdere kappers beheren?', answer: 'Nog niet. Nu is elk account één kapper met één agenda. Teamagenda’s staan op onze planning.' },
      { question: 'Welke betaalmethoden accepteren jullie?', answer: 'Betalingen gaan nu rechtstreeks tussen jou en je klanten. Snippr is een boekingstool, geen betaalprovider.' },
      { question: 'Hebben jullie een app?', answer: 'Nog niet in de app stores. Snippr werkt nu volledig in de browser van je telefoon en je kunt hem op je beginscherm zetten. Apps voor iOS en Android komen eraan.' },
      { question: 'Krijgen klanten een bevestiging?', answer: 'Ja. Laat een klant zijn e-mail achter, dan krijgt hij direct na het boeken een bevestiging met datum, tijd en prijs, en jij krijgt een melding. Ook krijgt hij een automatische herinnering vóór de afspraak.' },
      { question: 'Kan ik mijn openingstijden instellen?', answer: 'Ja. Stel je tijden per weekdag in en zet de dagen uit waarop je dicht bent. Klanten kunnen alleen boeken als je open bent.' },
    ],
  },
  de: {
    title: 'Häufige Fragen', sub: 'Alles, was du über Barbier-Buchungen mit Snippr wissen musst.',
    still: 'Noch Fragen?', reply: 'Schreib uns, wir antworten meist innerhalb eines Tages.', start: 'Loslegen', contact: 'Support kontaktieren',
    faqs: [
      { question: 'Wie erstelle ich einen Buchungslink?', answer: 'Erstelle ein Snippr-Konto, trag deine Leistungen und Verfügbarkeit ein und du bekommst deinen eigenen Buchungslink. Teile ihn auf Instagram oder WhatsApp oder druck den QR-Code für deinen Laden aus.' },
      { question: 'Gibt es eine Einrichtungsgebühr?', answer: `Keine Einrichtungsgebühr. Jeden Tarif kannst du ${TRIAL_DAYS} Tage kostenlos testen, ohne Kreditkarte, und nach dem Test wird nichts abgebucht.` },
      { question: 'Wie buchen Kunden Termine?', answer: 'Kunden öffnen deinen Buchungslink, wählen eine Leistung und eine passende Zeit und bestätigen. Geben sie ihre E-Mail an, bekommen sie sofort eine Bestätigung und vor dem Termin eine automatische Erinnerung.' },
      { question: 'Kann ich mehrere Barbiere verwalten?', answer: 'Noch nicht. Derzeit ist jedes Konto ein Barbier mit einem Kalender. Team-Kalender sind geplant.' },
      { question: 'Welche Zahlungsarten akzeptiert ihr?', answer: 'Zahlungen laufen derzeit direkt zwischen dir und deinen Kunden. Snippr ist ein Buchungswerkzeug, kein Zahlungsanbieter.' },
      { question: 'Gibt es eine App?', answer: 'Noch nicht in den App Stores. Snippr funktioniert schon voll im Browser deines Handys und du kannst es auf den Startbildschirm legen. Apps für iOS und Android sind in Arbeit.' },
      { question: 'Bekommen Kunden eine Bestätigung?', answer: 'Ja. Gibt ein Kunde seine E-Mail an, bekommt er direkt nach der Buchung eine Bestätigung mit Datum, Uhrzeit und Preis, und du bekommst eine Benachrichtigung. Vor dem Termin kommt außerdem eine automatische Erinnerung.' },
      { question: 'Kann ich meine Öffnungszeiten festlegen?', answer: 'Ja. Leg deine Zeiten für jeden Wochentag fest und schalte die Tage ab, an denen du geschlossen hast. Kunden können nur buchen, wenn du geöffnet hast.' },
    ],
  },
  tr: {
    title: 'Sık sorulan sorular', sub: 'Snippr ile berber randevusu hakkında bilmen gereken her şey.',
    still: 'Başka sorun mu var?', reply: 'Bize yaz, genelde bir gün içinde cevap veririz.', start: 'Başla', contact: 'Destekle iletişime geç',
    faqs: [
      { question: 'Randevu linkimi nasıl oluştururum?', answer: 'Snippr hesabı aç, hizmetlerini ve müsait saatlerini ekle; kendine özel bir randevu linkin olur. Instagram ya da WhatsApp’ta paylaş veya dükkânın için QR kodunu yazdır.' },
      { question: 'Kurulum ücreti var mı?', answer: `Kurulum ücreti yok. Bütün planları ${TRIAL_DAYS} gün ücretsiz deneyebilirsin, kredi kartı gerekmez ve deneme bitince ücret alınmaz.` },
      { question: 'Müşteriler nasıl randevu alır?', answer: 'Müşteri randevu linkini açar, bir hizmet ve uygun bir saat seçer ve onaylar. E-postasını bırakırsa hemen onay alır, randevudan önce de otomatik hatırlatma gelir.' },
      { question: 'Birden fazla berberi yönetebilir miyim?', answer: 'Henüz değil. Şu an her hesap tek berber ve tek takvim. Ekip takvimi yol haritamızda.' },
      { question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', answer: 'Şu an ödemeler doğrudan seninle müşterin arasında yapılır. Snippr bir randevu aracıdır, ödeme sağlayıcısı değildir.' },
      { question: 'Mobil uygulamanız var mı?', answer: 'Uygulama mağazalarında henüz yok. Snippr bugün telefonunun tarayıcısında tam çalışıyor ve ana ekranına ekleyebilirsin. iOS ve Android uygulamaları hazırlanıyor.' },
      { question: 'Müşteriye onay gider mi?', answer: 'Evet. Müşteri e-postasını bırakırsa randevudan hemen sonra tarih, saat ve fiyatla bir onay alır, sana da bildirim gelir. Randevudan önce otomatik hatırlatma da alır.' },
      { question: 'Çalışma saatlerimi ayarlayabilir miyim?', answer: 'Evet. Haftanın her günü için saatlerini ayarla, kapalı olduğun günleri kapat. Müşteriler sadece açık olduğun saatlerde randevu alabilir.' },
    ],
  },
  ar: {
    title: 'الأسئلة الشائعة', sub: 'كل ما تحتاج معرفته عن حجز الحلاق مع Snippr.',
    still: 'هل لديك أسئلة أخرى؟', reply: 'راسلنا، وعادةً نرد خلال يوم.', start: 'ابدأ الآن', contact: 'تواصل مع الدعم',
    faqs: [
      { question: 'كيف أنشئ رابط الحجز؟', answer: 'أنشئ حساب Snippr وأضف خدماتك وأوقاتك المتاحة، وستحصل على رابط حجز خاص بك. شاركه على إنستغرام أو واتساب، أو اطبع رمز QR لمحلك.' },
      { question: 'هل توجد رسوم إعداد؟', answer: `لا رسوم إعداد. يمكنك تجربة كل الخطط مجانًا لمدة ${TRIAL_DAYS} يومًا بدون بطاقة ائتمان، ولا يُخصم شيء عند انتهاء التجربة.` },
      { question: 'كيف يحجز العملاء المواعيد؟', answer: 'يفتح العميل رابط الحجز ويختار خدمة ووقتًا مناسبًا ويؤكد. إذا ترك بريده يحصل على تأكيد فورًا وتذكير تلقائي قبل الموعد.' },
      { question: 'هل يمكنني إدارة أكثر من حلاق؟', answer: 'ليس بعد. حاليًا كل حساب لحلاق واحد بتقويم واحد. تقويمات الفريق ضمن خططنا.' },
      { question: 'ما طرق الدفع المقبولة؟', answer: 'حاليًا يتم الدفع مباشرة بينك وبين عملائك. Snippr أداة حجز وليس مزود دفع.' },
      { question: 'هل لديكم تطبيق للجوال؟', answer: 'ليس في متاجر التطبيقات بعد. يعمل Snippr بالكامل في متصفح هاتفك ويمكنك إضافته إلى الشاشة الرئيسية. تطبيقات iOS وأندرويد قيد التطوير.' },
      { question: 'هل يحصل العملاء على تأكيد؟', answer: 'نعم. إذا ترك العميل بريده يحصل بعد الحجز مباشرة على تأكيد بالتاريخ والوقت والسعر، ويصلك إشعار. كما يحصل على تذكير تلقائي قبل الموعد.' },
      { question: 'هل يمكنني ضبط ساعات العمل؟', answer: 'نعم. اضبط ساعاتك لكل يوم من أيام الأسبوع وأغلق الأيام التي لا تعمل فيها. لا يمكن للعملاء الحجز إلا عندما تكون مفتوحًا.' },
    ],
  },
}
