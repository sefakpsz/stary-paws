import type {
  AdoptionPet,
  HelpLocation,
  Language,
  LostPetNotice,
} from "../types/pet";

export interface AppData {
  lostPetNotices: LostPetNotice[];
  helpLocations: HelpLocation[];
  adoptionPets: AdoptionPet[];
}

// Post content (name, description, contact, etc.) is authored once by
// whoever created the post, in whichever language they wrote it in. It must
// not change when a *viewer* switches the app's display language - that
// would mean a different person's real post retranslating itself under
// them. Only the location fields below are allowed to vary by language,
// since place names sometimes have a different canonical spelling per
// locale (e.g. "İstanbul" vs "Istanbul").

type LostPetNoticeContent = Omit<LostPetNotice, "area" | "lastSeen">;
type HelpLocationContent = Omit<HelpLocation, "area">;
type AdoptionPetContent = Omit<AdoptionPet, "area">;

const lostPetNoticeContent: LostPetNoticeContent[] = [
  {
    id: "lost-1",
    name: "Misket",
    kind: "cat",
    description:
      "Sakin turuncu tekir, ince yeşil tasma takıyor. Genelde ismine tepki verir.",
    contact: "+90 555 000 00 01",
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "lost-2",
    name: "Kömür",
    kind: "dog",
    description:
      "Küçük siyah melez köpek. Çok sevecen ama trafikte tedirgin olabilir.",
    contact: "+90 555 000 00 02",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "lost-3",
    name: "Luna",
    kind: "cat",
    description:
      "Gri-beyaz dişi kedi, bir gözü mavi. Ürkektir ve park halindeki arabaların altına saklanabilir.",
    contact: "+90 555 000 00 03",
    imageUrl:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "lost-4",
    name: "Biscuit",
    kind: "dog",
    description:
      "Friendly golden retriever mix, wearing a red bandana. Loves people and may approach strangers for treats.",
    contact: "+1 415 555 0142",
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
];

const lostPetNoticeLocation: Record<
  Language,
  Record<string, { area: string; lastSeen: string }>
> = {
  tr: {
    "lost-1": { area: "Kadıköy, İstanbul", lastSeen: "Moda Parkı, çay bahçesi yakını" },
    "lost-2": { area: "Beşiktaş, İstanbul", lastSeen: "Abbasağa Parkı girişi" },
    "lost-3": { area: "Cihangir, İstanbul", lastSeen: "Sıraselviler Caddesi, çiçekçi yanı" },
    "lost-4": {
      area: "Union Square, San Francisco",
      lastSeen: "Union Square Parkı, Powell Street tramvay dönüş noktası yakını",
    },
  },
  en: {
    "lost-1": { area: "Kadıköy, Istanbul", lastSeen: "Moda Park, near the tea garden" },
    "lost-2": { area: "Beşiktaş, Istanbul", lastSeen: "Abbasaga Park entrance" },
    "lost-3": { area: "Cihangir, Istanbul", lastSeen: "Siraselviler Street, beside the florist" },
    "lost-4": {
      area: "Union Square, San Francisco",
      lastSeen: "Union Square Park, near the Powell Street cable car turnaround",
    },
  },
};

const helpLocationContent: HelpLocationContent[] = [
  {
    id: "help-1",
    title: "Yavrularıyla anne kedi mama bekliyor",
    kind: "cat",
    urgency: "medium",
    description:
      "Anne kedi ve dört yavru küçük ahşap bankın altında kalıyor. Kuru mamaya ihtiyaç var.",
    imageUrl:
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "help-2",
    title: "Otobüs durağı yakınında yaralı köpek görüldü",
    kind: "dog",
    urgency: "high",
    description:
      "Orta boy bir köpek durak yakınında topallıyor. Gönüllü veya veteriner desteği gerekiyor.",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "help-3",
    title: "Boş arsada kalan yavru köpekler",
    kind: "dog",
    urgency: "high",
    description:
      "Boş arsanın içinde üç yavru köpek görüldü. Su, mama ve kurtarma koordinasyonu gerekiyor.",
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
];

const helpLocationLocation: Record<Language, Record<string, { area: string }>> = {
  tr: {
    "help-1": { area: "İstanbul, Üsküdar, Validebağ Korusu" },
    "help-2": { area: "İstanbul, Şişli, Mecidiyeköy" },
    "help-3": { area: "Union Square, San Francisco" },
  },
  en: {
    "help-1": { area: "İstanbul, Üsküdar, Validebağ Grove" },
    "help-2": { area: "İstanbul, Şişli, Mecidiyeköy" },
    "help-3": { area: "Union Square, San Francisco" },
  },
};

const adoptionPetContent: AdoptionPetContent[] = [
  {
    id: "adopt-1",
    name: "Pamuk",
    kind: "cat",
    age: "8 aylık",
    personality: ["uysal", "oyuncu", "kucak sever"],
    description:
      "Pamuk yoğun bir caddeden kurtarıldı ve sakin bir kalıcı yuva için hazır.",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "adopt-2",
    name: "Tarçın",
    kind: "dog",
    age: "2 yaşında",
    personality: ["sadık", "zeki", "yürüyüş arkadaşı"],
    description:
      "Tarçın insanları çok sever; günlük yürüyüşleri olan sabırlı bir aileyle mutlu olur.",
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "adopt-3",
    name: "Zeytin",
    kind: "cat",
    age: "1 yaşında",
    personality: ["meraklı", "sessiz", "pencere sever"],
    description:
      "Zeytin aşıları yapılmış, kum eğitimli ve huzurlu bir ev arıyor.",
    imageUrl:
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=900&q=80",
  },
];

const adoptionPetLocation: Record<Language, Record<string, { area: string }>> = {
  tr: {
    "adopt-1": { area: "Ataşehir, İstanbul" },
    "adopt-2": { area: "Bakırköy, İstanbul" },
    "adopt-3": { area: "Bostancı, İstanbul" },
  },
  en: {
    "adopt-1": { area: "Ataşehir, Istanbul" },
    "adopt-2": { area: "Bakırköy, Istanbul" },
    "adopt-3": { area: "Bostancı, Istanbul" },
  },
};

export function getMockAppData(language: Language): AppData {
  return {
    lostPetNotices: lostPetNoticeContent.map((post) => ({
      ...post,
      ...lostPetNoticeLocation[language][post.id],
    })),
    helpLocations: helpLocationContent.map((post) => ({
      ...post,
      ...helpLocationLocation[language][post.id],
    })),
    adoptionPets: adoptionPetContent.map((post) => ({
      ...post,
      ...adoptionPetLocation[language][post.id],
    })),
  };
}
