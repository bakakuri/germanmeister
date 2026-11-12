// ყველა პარამეტრი ერთ ადგილას.
export const CONFIG = {
  // ტესტ-რეჟიმი: პროგრესი მხოლოდ მეხსიერებაშია და გვერდის განახლებაზე განულდება.
  // შენახვის ჩასართავად შეცვალე true-ზე (მუშაობს js/storage.js).
  USE_STORAGE: false,
  STORAGE_KEY: 'deutsch-weg-v1',

  // გაზარდე, როცა data/ ფაილებს ცვლი — ბრაუზერი ახალ ვერსიას აიღებს.
  DATA_VERSION: '1',

  // დეველოპერის პანელი (გადახტომა დღეზე, განულება და ა.შ.)
  DEV_PANEL: true,

  SPEECH_LANG: 'de-DE',
  PAGE_SIZE: 50,
  PREFETCH_NEXT_DAY: true,
  PRACTICE_ROUNDS: 10,
};
