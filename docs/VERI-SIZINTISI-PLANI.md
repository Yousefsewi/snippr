# Veri sızıntısı planı (datalek-protocol)

> Snippr — Hollanda. Hukuki dayanak: GDPR/AVG madde 33 (kuruma bildirim), 34 (kişilere haber),
> 33(5) (kayıt defteri) ve 28(3)(f) (berberlere haber, bkz. /dpa). **Taslak — avukata kontrol ettir.**
> Gerçek olayları bu dosyaya **yazma** (depo herkese açık). Olay kaydı: `private/veri-sizintisi-defteri.md`.

## Veri sızıntısı nedir?

Kişisel verinin **yanlışlıkla ya da izinsiz** görülmesi, kopyalanması, değiştirilmesi, kaybolması
veya silinmesi. Örnekler:

- Başkası panele girdi / bir berber başka berberin müşterilerini gördü
- Şifreler, Supabase anahtarı (service role), Gmail şifresi, Vercel hesabı ele geçirildi
- Yanlış kişiye müşteri bilgisi içeren e-posta gitti
- Bir hata yüzünden randevular veya müşteri bilgileri herkese açık oldu
- Veriler silindi ve geri getirilemiyor, ya da site saatlerce erişilemedi
- Bilgisayarın / telefonun (hesaplar açık) kayboldu veya çalındı

Emin değilsen **sızıntı say** ve bu planı uygula.

## Saat 0 — fark ettiğin an

1. **Saati not al.** 72 saat bu andan başlar ("farkına varma" anı).
2. **Kanamayı durdur** (yapabildiklerin):
   - Şüpheli hesap/oturum: Supabase → Authentication → kullanıcıyı engelle / oturumları kapat
   - Anahtar sızdıysa **hemen değiştir**: Supabase service role key, Gmail uygulama şifresi,
     Vercel / GitHub şifreleri. Yeni anahtarı Vercel ortam değişkenlerine koy, yeniden yayınla.
   - Hatalı özellik veri gösteriyorsa: kapat ya da önceki sürüme dön (Vercel → Deployments → Promote)
3. **Kanıtı koru.** Ekran görüntüsü al, Supabase/Vercel kayıtlarını indir. Hiçbir şeyi silme.
4. **Deftere yaz** (`private/veri-sizintisi-defteri.md`) — ne biliyorsan, eksik de olsa.

## İlk 24 saat — ne kadar ciddi?

Şu soruları cevapla ve deftere yaz:

| Soru | Not |
|---|---|
| Hangi veriler? | ad, e-posta, telefon, randevu, doğum tarihi, şifre (hash), ödeme notları… |
| Kaç kişi? | kaç berber, kaç müşteri (yaklaşık bile olsa) |
| Ne oldu? | görüldü / kopyalandı / değişti / silindi / kayboldu |
| Kim erişti? | bilinmiyor / bir berber / dışarıdan biri |
| Veri şifreli miydi? | şifreler hep hash'li; diğer veriler değil |
| Risk | dolandırıcılık, kimlik hırsızlığı, rahatsız edilme, utanç, maddi zarar? |

**AP'ye bildirmen gerekir — DEĞİL** sadece: risk "muhtemelen yok" ise (örn. yanlış giden e-posta
hemen silindi ve içinde hassas bilgi yoktu). Yine de **deftere yaz ve nedenini açıkla.**
Şüphedeysen **bildir** — geç bildirim de bildirmemek de ceza sebebi.

## 72 saat içinde — Autoriteit Persoonsgegevens'e bildir

- Adres: **autoriteitpersoonsgegevens.nl → "Datalek melden"** (meldloket datalekken)
- Formda istenenler: ne oldu, ne zaman fark ettin, hangi veriler, kaç kişi, olası sonuçlar,
  aldığın önlemler, kişilere haber verdin mi, iletişim bilgilerin.
- Her şeyi bilmiyorsan **yine de 72 saat içinde bildir**; eksikleri sonra "aanvulling" ile ekle.
- Gelen **bildirim numarasını** deftere yaz.

## Berberlere haber (Snippr = veri işleyen)

Müşteri verileri berberlerin sorumluluğunda. Sözleşmemiz (/dpa) gereği etkilenen berberlere
**gecikmeden, mümkünse 48 saat içinde** yaz — böylece kendi 72 saatleri içinde bildirebilirler.

> **Konu:** Snippr — hesabınızla ilgili güvenlik olayı
>
> Merhaba [ad],
> [tarih] tarihinde [kısa ne oldu] fark ettik. Etkilenen bilgiler: [liste]. Etkilenen
> müşteri sayısı (tahmini): [sayı]. Şunları yaptık: [önlemler]. Sizin yapmanız gerekenler:
> [şifre değiştirin vb.]. Müşterileriniz için veri sorumlusu siz olduğunuzdan, gerekirse
> Autoriteit Persoonsgegevens'e bildirim yapmanız gerekebilir; bunun için gereken tüm
> bilgileri size veririz. Sorularınız için: [e-posta].
> — Snippr

## Kişilere haber (yüksek risk varsa)

Risk yüksekse (örn. telefon + e-posta + randevu bilgileri dışarı çıktı) etkilenen kişilere
**sade dille** yaz: ne oldu, hangi verileri, olası sonuçlar, ne yaptık, ne yapmaları gerekiyor,
iletişim. Berberin müşterileri için bunu berberle birlikte yap.

## Sonra

- Sebebi düzelt, aynı şeyin tekrar olmaması için ne değişti deftere yaz.
- Gerekirse Gizlilik Politikası / güvenlik önlemlerini güncelle.
- Her olaydan sonra bu planı gözden geçir.

## Önceden hazır olsun (kontrol listesi)

- [ ] AP meldloket'e giriş için gereken bilgiler (şirket adı, KvK — kayıttan sonra)
- [ ] Berberlerin e-posta listesi (Supabase'den alınabiliyor)
- [ ] Anahtarların nasıl değiştirileceği belli (yukarıda)
- [ ] `private/veri-sizintisi-defteri.md` bilgisayarında, depoya yüklenmiyor
- [ ] Yılda bir: planı ve defteri gözden geçir
