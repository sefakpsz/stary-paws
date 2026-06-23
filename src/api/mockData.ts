import type { AdoptionPet, HelpLocation, Language, LostPetNotice } from '../types/pet';

export interface AppData {
  lostPetNotices: LostPetNotice[];
  helpLocations: HelpLocation[];
  adoptionPets: AdoptionPet[];
}

export const mockDataByLanguage: Record<Language, AppData> = {
  tr: {
    lostPetNotices: [
      {
        id: 'lost-1',
        name: 'Misket',
        kind: 'cat',
        area: 'Kadıköy, İstanbul',
        lastSeen: 'Moda Parkı, çay bahçesi yakını',
        description: 'Sakin turuncu tekir, ince yeşil tasma takıyor. Genelde ismine tepki verir.',
        contact: '+90 555 000 00 01',
        imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'lost-2',
        name: 'Kömür',
        kind: 'dog',
        area: 'Beşiktaş, İstanbul',
        lastSeen: 'Abbasağa Parkı girişi',
        description: 'Küçük siyah melez köpek. Çok sevecen ama trafikte tedirgin olabilir.',
        contact: '+90 555 000 00 02',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'lost-3',
        name: 'Luna',
        kind: 'cat',
        area: 'Cihangir, İstanbul',
        lastSeen: 'Sıraselviler Caddesi, çiçekçi yanı',
        description: 'Gri-beyaz dişi kedi, bir gözü mavi. Ürkektir ve park halindeki arabaların altına saklanabilir.',
        contact: '+90 555 000 00 03',
        imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80',
      },
    ],
    helpLocations: [
      {
        id: 'help-1',
        title: 'Yavrularıyla anne kedi mama bekliyor',
        kind: 'cat',
        area: 'İstanbul, Üsküdar, Validebağ Korusu',
        urgency: 'medium',
        description: 'Anne kedi ve dört yavru küçük ahşap bankın altında kalıyor. Kuru mamaya ihtiyaç var.',
        imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'help-2',
        title: 'Otobüs durağı yakınında yaralı köpek görüldü',
        kind: 'dog',
        area: 'İstanbul, Şişli, Mecidiyeköy',
        urgency: 'high',
        description: 'Orta boy bir köpek durak yakınında topallıyor. Gönüllü veya veteriner desteği gerekiyor.',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'help-3',
        title: 'Boş arsada kalan yavru köpekler',
        kind: 'dog',
        area: 'İstanbul, Kartal, sahil yolu şantiyesi',
        urgency: 'high',
        description: 'Boş arsanın içinde üç yavru köpek görüldü. Su, mama ve kurtarma koordinasyonu gerekiyor.',
        imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      },
    ],
    adoptionPets: [
      {
        id: 'adopt-1',
        name: 'Pamuk',
        kind: 'cat',
        age: '8 aylık',
        area: 'Ataşehir, İstanbul',
        personality: ['uysal', 'oyuncu', 'kucak sever'],
        description: 'Pamuk yoğun bir caddeden kurtarıldı ve sakin bir kalıcı yuva için hazır.',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'adopt-2',
        name: 'Tarçın',
        kind: 'dog',
        age: '2 yaşında',
        area: 'Bakırköy, İstanbul',
        personality: ['sadık', 'zeki', 'yürüyüş arkadaşı'],
        description: 'Tarçın insanları çok sever; günlük yürüyüşleri olan sabırlı bir aileyle mutlu olur.',
        imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'adopt-3',
        name: 'Zeytin',
        kind: 'cat',
        age: '1 yaşında',
        area: 'Bostancı, İstanbul',
        personality: ['meraklı', 'sessiz', 'pencere sever'],
        description: 'Zeytin aşıları yapılmış, kum eğitimli ve huzurlu bir ev arıyor.',
        imageUrl: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  en: {
    lostPetNotices: [
      {
        id: 'lost-1',
        name: 'Misket',
        kind: 'cat',
        area: 'Kadıköy, Istanbul',
        lastSeen: 'Moda Park, near the tea garden',
        description: 'Calm orange tabby, wearing a tiny green collar. Usually responds to her name.',
        contact: '+90 555 000 00 01',
        imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'lost-2',
        name: 'Kömür',
        kind: 'dog',
        area: 'Beşiktaş, Istanbul',
        lastSeen: 'Abbasaga Park entrance',
        description: 'Small black mixed breed dog, very friendly but nervous around traffic.',
        contact: '+90 555 000 00 02',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'lost-3',
        name: 'Luna',
        kind: 'cat',
        area: 'Cihangir, Istanbul',
        lastSeen: 'Siraselviler Street, beside the florist',
        description: 'Grey-white female cat with one blue eye. She is timid and may hide under parked cars.',
        contact: '+90 555 000 00 03',
        imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80',
      },
    ],
    helpLocations: [
      {
        id: 'help-1',
        title: 'Mother cat with kittens needs food',
        kind: 'cat',
        area: 'İstanbul, Üsküdar, Validebağ Grove',
        urgency: 'medium',
        description: 'A mother cat and four kittens are staying under a small wooden bench. Dry food is needed.',
        imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'help-2',
        title: 'Injured dog seen near bus stop',
        kind: 'dog',
        area: 'İstanbul, Şişli, Mecidiyeköy',
        urgency: 'high',
        description: 'Medium-sized dog limping near the bus stop. A volunteer or vet support is needed.',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'help-3',
        title: 'Puppies staying in empty lot',
        kind: 'dog',
        area: 'İstanbul, Kartal, coastal road construction area',
        urgency: 'high',
        description: 'Three puppies were seen inside an empty lot. They need water, food, and rescue coordination.',
        imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      },
    ],
    adoptionPets: [
      {
        id: 'adopt-1',
        name: 'Pamuk',
        kind: 'cat',
        age: '8 months',
        area: 'Ataşehir, Istanbul',
        personality: ['gentle', 'playful', 'lap lover'],
        description: 'Pamuk was rescued from a busy street and is ready for a calm forever home.',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'adopt-2',
        name: 'Tarçın',
        kind: 'dog',
        age: '2 years',
        area: 'Bakırköy, Istanbul',
        personality: ['loyal', 'smart', 'walk buddy'],
        description: 'Tarçın loves people and would be happiest with daily walks and a patient family.',
        imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'adopt-3',
        name: 'Zeytin',
        kind: 'cat',
        age: '1 year',
        area: 'Bostancı, Istanbul',
        personality: ['curious', 'quiet', 'window watcher'],
        description: 'Zeytin is vaccinated, litter-trained, and looking for a peaceful indoor home.',
        imageUrl: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
};

export function getMockAppData(language: Language): AppData {
  const userContent = mockDataByLanguage.tr;
  const structuredContent = mockDataByLanguage[language];

  return {
    lostPetNotices: userContent.lostPetNotices.map((item, index) => ({
      ...item,
      area: structuredContent.lostPetNotices[index]?.area ?? item.area,
    })),
    helpLocations: userContent.helpLocations.map((item, index) => ({
      ...item,
      area: structuredContent.helpLocations[index]?.area ?? item.area,
    })),
    adoptionPets: userContent.adoptionPets.map((item, index) => ({
      ...item,
      area: structuredContent.adoptionPets[index]?.area ?? item.area,
    })),
  };
}
