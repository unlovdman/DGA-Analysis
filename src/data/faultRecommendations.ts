import type { FaultRecommendationConfig, FaultType } from '../types';

export const FAULT_RECOMMENDATIONS: Record<string, FaultRecommendationConfig> = {
  'PD': {
    description: 'Partial Discharge',
    rekomendasi: [
      'Prioritaskan metode pengukuran yang non-invasif dan mudah, seperti metode Ultrasonik atau TEV (Transient Earth Voltage).',
      'Perbaikan atau penggantian isolator yang retak atau rusak.',
      'Cek tekanan gas isolasi secara rutin untuk memastikan tidak ada penurunan yang signifikan.',
      'Pastikan transformator dan ruang isolasi bebas dari kelembaban berlebih (30℃ - 40℃).'
    ],
    preventif: [
      'Lakukan pengukuran PD secara periodik (6–12 Bulan) menggunakan peralatan standar PD detector.',
      'Lakukan pengecekan pada kondisi rongga gas dan isolasi padat secara visual untuk memastikan tidak ada kerusakan fisik, korosi, atau kebocoran.',
      'Lakukan pemeriksaan suhu operasional transformator (60℃ - 65℃) agar tidak melewati batas aman.'
    ],
    note: 'Jika tekanan gas menurun, lakukan pengisian ulang gas isolasi Nitrogen sesuai prosedur (2,5 bar).'
  },

  'D1': {
    description: 'Low Energy Discharge (Arcing Ringan)',
    rekomendasi: [
      'Lakukan Dissolved Gas Analysis (DGA) secara rutin untuk memantau kandungan gas utama seperti metana (CH4), etilena (C2H4), dan asetilena (C2H2).',
      'Pantau parameter lain seperti suhu, kebocoran minyak, kebersihan permukaan trafo, serta kondisi busbar dan bushing secara visual.',
      'Bersihkan isolator dan bushing dari debu, karbon, atau sisa arcing pada isolasi dan terminal trafo.',
      'Perbaiki atau ganti bagian isolasi yang menunjukkan tanda degradasi atau bekas arcing ringan.',
      'Kencangkan sambungan listrik untuk memastikan tidak ada terminal, baut, atau sambungan kabel yang longgar.',
      'Optimalkan sistem pentanahan untuk menekan potensi loncatan listrik.',
      'Lakukan pengujian tegangan tembus minyak secara berkala.',
      'Rekondisi atau ganti minyak jika setelah filtrasi kualitas minyak masih buruk.'
    ],
    preventif: [
      'Jadwalkan pemeliharaan berkala termasuk pengujian breakdown voltage dan analisis tren gas hasil DGA.',
      'Gunakan metode infrared thermography untuk deteksi awal hotspot kecil.',
      'Pantau laju peningkatan asetilena (C2H2) untuk mendeteksi dini kemungkinan arcing berulang.',
      'Evaluasi sistem pendingin dan ventilasi untuk memastikan suhu operasi tetap stabil.'
    ]
  },

  'D2': {
    description: 'High Energy Discharge (Arcing Berat)',
    rekomendasi: [
      'Lakukan analisis DGA lebih sering (2–4 bulan) untuk mendeteksi kenaikan tajam gas penanda high-energy discharge, terutama C2H2.',
      'Pantau hasil DGA secara berkala dan lakukan investigasi mendalam jika konsentrasi gas meningkat signifikan.',
      'Gunakan infrared thermography untuk mendeteksi hotspot akibat arcing berat.',
      'Lakukan inspeksi internal transformator dengan shutdown terkontrol untuk memastikan tidak ada kerusakan fatal.',
      'Ganti atau rekondisi isolasi kertas/minyak yang menunjukkan kerusakan ekstrem.',
      'Pastikan sambungan listrik dan terminal tidak longgar atau terbakar akibat arcing berat.',
      'Bersihkan sisa karbon dan partikel logam hasil pelepasan arcing.',
      'Periksa warna minyak; minyak gelap menandakan dekomposisi akibat arcing berat dan perlu segera diganti.',
      'Pastikan sistem pendingin (radiator, kipas, sirkulasi minyak) bekerja optimal.'
    ],
    preventif: [
      'Tingkatkan frekuensi DGA untuk memantau tren gas C2H2.',
      'Gunakan proteksi suhu otomatis atau alarm dini untuk mencegah overheating lokal.',
      'Lakukan pemeriksaan tekanan minyak dan pendinginan setiap bulan untuk menjaga kestabilan termal.'
    ]
  },

  'T1': {
    description: 'Thermal Fault < 300°C',
    rekomendasi: [
      'Lakukan monitoring rutin terhadap hasil DGA dengan analisis Duval Triangle.',
      'Pastikan suhu operasi transformator tetap dalam batas normal dengan memeriksa sistem pendingin (radiator, kipas, dan sirkulasi minyak).',
      'Periksa dan bersihkan terminal, bushing, dan sambungan untuk menghindari kontak longgar.',
      'Uji dan rawat minyak isolasi secara berkala melalui pengujian breakdown voltage dan filtrasi minyak.',
      'Pastikan sistem grounding dan proteksi berfungsi dengan baik.',
      'Evaluasi beban operasi trafo agar tidak melebihi kapasitas nominal.'
    ],
    preventif: [
      'Lakukan pemantauan tren gas thermal untuk mencegah peningkatan menuju kategori fault lebih tinggi.',
      'Implementasikan jadwal preventive maintenance terprogram meliputi DGA, pemeriksaan visual, pengujian isolasi, dan perawatan sistem pendingin.'
    ]
  },

  'T2': {
    description: 'Thermal Fault 300–700°C',
    rekomendasi: [
      'Lakukan monitoring dan analisis DGA berkala untuk mendeteksi gas hasil degradasi termal.',
      'Evaluasi sistem pendinginan (radiator, kipas, sirkulasi minyak) dan lakukan perawatan jika performanya menurun.',
      'Periksa terminal dan sambungan kelistrikan untuk mendeteksi kontak longgar, kotoran, atau oksidasi.',
      'Ganti komponen isolasi yang menunjukkan degradasi akibat panas tinggi.',
      'Lakukan evaluasi dan pengaturan ulang beban transformator untuk mencegah overload.',
      'Pastikan grounding dan proteksi sistem bekerja optimal.'
    ],
    preventif: [
      'Tingkatkan frekuensi pengujian kualitas minyak isolasi (uji BDV, tan delta, kadar air).',
      'Lakukan inspeksi visual tiap 3–6 bulan terhadap terminal, konektor, dan area berpotensi hotspot.'
    ]
  },

  'T3': {
    description: 'Thermal Fault > 700°C',
    rekomendasi: [
      'Lakukan inspeksi internal secara menyeluruh segera setelah indikasi fault terdeteksi.',
      'Segera lakukan shutdown terkontrol untuk mencegah kerusakan lebih parah.',
      'Ganti atau rekondisi isolasi internal yang mengalami degradasi berat.',
      'Lakukan penggantian total minyak isolasi karena kemungkinan besar telah terdegradasi.',
      'Periksa sambungan listrik dan terminal dari indikasi kerusakan akibat panas tinggi.',
      'Pastikan sistem proteksi (relay, Buchholz relay, tekanan) berfungsi baik.'
    ],
    preventif: [
      'Pantau tren gas hasil DGA dengan interval lebih pendek (2–3 bulan).',
      'Catat dan dokumentasikan seluruh tindakan pemeliharaan dan hasil pengujian secara konsisten.'
    ]
  },

  'DT': {
    description: 'Discharge With Thermal Component',
    rekomendasi: [
      'Telusuri riwayat beban, suhu minyak, dan suhu belitan untuk memastikan adanya korelasi dengan indikasi fault.',
      'Periksa adanya lonjakan beban atau suhu abnormal dalam beberapa periode terakhir.',
      'Lakukan inspeksi menyeluruh pada isolasi padat dan minyak trafo.',
      'Uji kualitas minyak (tan delta, kadar air, keasaman, dan kontaminan).',
      'Perbaiki atau ganti isolasi pada area yang mengalami discharge dengan kerusakan termal.',
      'Optimalkan sistem pendinginan dengan perbaikan atau penambahan unit pendingin.'
    ],
    preventif: [
      'Tingkatkan frekuensi monitoring DGA menjadi setiap 2–4 bulan.',
      'Kurangi beban operasi untuk mencegah peningkatan suhu lebih lanjut.',
      'Lakukan penggantian atau pemrosesan minyak (degassing atau filtrasi) untuk menghilangkan kontaminan.'
    ]
  },

  'S': {
    description: 'Stray Gassing',
    rekomendasi: [
      'Telusuri riwayat beban trafo dan suhu minyak untuk memastikan penyebab fluktuasi gas.',
      'Periksa kondisi fisik trafo terhadap degradasi termal ringan, kotoran, atau kebocoran seal.',
      'Lakukan uji kualitas minyak untuk menentukan tingkat penuaan atau oksidasi minyak.',
      'Degassing minyak bila level gas mendekati batas operasional.',
      'Lakukan filtering minyak untuk memperlambat penuaan dan menurunkan potensi pelepasan gas.'
    ],
    preventif: [
      'Lakukan DGA setiap 3–6 bulan untuk memastikan kestabilan pola gas.',
      'Tambahkan pendinginan jika suhu operasional terlalu tinggi secara lokal.'
    ]
  },

  'C': {
    description: 'Corona',
    rekomendasi: [
      'Lakukan monitoring rutin DGA dengan analisis Duval Triangle untuk mendeteksi gas khas corona.',
      'Lakukan pembersihan visual pada permukaan isolator, bushing, dan sambungan terminal.',
      'Periksa dan kencangkan sambungan listrik untuk menghindari kontak longgar.',
      'Uji kualitas minyak isolasi (breakdown voltage dan filtrasi) secara berkala.',
      'Pastikan area sekitar transformator bersih dan bebas kelembaban tinggi.'
    ],
    preventif: [
      'Lakukan pemeliharaan preventif terjadwal setiap 3–6 bulan.',
      'Lakukan monitoring tambahan jika hasil DGA menunjukkan tren kenaikan partial discharge.'
    ]
  },

  'ND': {
    description: 'Normal Degradation',
    rekomendasi: [
      'Lakukan resampling secara berkala untuk memantau perkembangan gas dalam minyak trafo.',
      'Pantau kondisi umum transformator secara rutin.',
      'Pastikan sistem pendingin dan proteksi tetap berfungsi normal.'
    ],
    preventif: [
      'Lakukan pemeliharaan preventif sesuai jadwal standar.',
      'Gunakan tren hasil DGA untuk memastikan degradasi masih dalam batas normal.'
    ]
  },

  'O': {
    description: 'Overheating < 200°C',
    rekomendasi: [
      'Monitoring suhu operasional transformator secara berkelanjutan.',
      'Periksa sistem pendinginan dan ventilasi untuk memastikan tidak ada hambatan aliran udara.',
      'Evaluasi distribusi panas dan keseimbangan beban transformator.',
      'Periksa sambungan listrik dari indikasi pemanasan lokal.'
    ],
    preventif: [
      'Lakukan DGA secara berkala untuk mendeteksi gas akibat overheating.',
      'Pastikan sistem ventilasi dan pendinginan bebas debu dan berfungsi optimal.'
    ]
  },

  'NORMAL': {
    description: 'Kondisi Normal',
    rekomendasi: [
      'Lakukan resampling DGA secara berkala untuk pemantauan tren gas.',
      'Lakukan monitoring DGA sesuai jadwal standar.',
      'Pastikan dokumentasi kondisi normal dilakukan untuk analisis tren jangka panjang.'
    ],
    preventif: [
      'Lakukan pemeliharaan preventif rutin sesuai prosedur standar operasional.'
    ]
  }
};

export const FAULT_COLORS = {
  // Triangle 1
  PD: '#3B82F6',    // Blue
  D1: '#F59E0B',    // Orange
  D2: '#EF4444',    // Red
  T1: '#10B981',    // Green
  T2: '#F59E0B',    // Orange
  T3: '#DC2626',    // Dark Red
  DT: '#8B5CF6',    // Purple
  
  // Triangle 4
  S: '#06B6D4',     // Cyan
  C: '#84CC16',     // Lime
  ND: '#6B7280',    // Gray
  
  // Triangle 5
  O: '#F97316',     // Orange
  
  // Normal
  NORMAL: '#10B981', // Green
};

export const FAULT_SEVERITY = {
  // Triangle 1
  PD: 'medium',
  D1: 'high',
  D2: 'critical',
  T1: 'medium',
  T2: 'high',
  T3: 'critical',
  DT: 'high',
  
  // Triangle 4
  S: 'low',
  C: 'medium',
  ND: 'low',
  
  // Triangle 5
  O: 'medium',
  
  // Normal
  NORMAL: 'low',
};

// Priority mapping for maintenance actions
export const FAULT_PRIORITY: Record<FaultType, 'low' | 'medium' | 'high' | 'urgent'> = {
  'NORMAL': 'low',
  'S': 'low',
  'ND': 'medium',
  'T1': 'medium',
  'PD': 'medium',
  'O': 'medium',
  'C': 'high',
  'D1': 'high',
  'T2': 'high',
  'DT': 'urgent',
  'D2': 'urgent',
  'T3': 'urgent'
}; 