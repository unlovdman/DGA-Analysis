import type { FaultRecommendationConfig, FaultType } from '../types';

export const FAULT_RECOMMENDATIONS: Record<FaultType, FaultRecommendationConfig> = {
  // Triangle 1 Faults
  'PD': {
    description: 'Partial Discharge',
    actions: [
      'Lakukan pengukuran PD secara periodik (6 – 12 Bulan) menggunakan peralatan standar PD detector',
      'Prioritaskan metode pengukuran yang non-invasif dan mudah, seperti metode Ultrasonik atau TEV (Transient Earth Voltage)',
      'Lakukan pengecekan pada kondisi rongga gas dan isolasi padat secara visual untuk memastikan tidak ada kerusakan fisik, korosi, atau kebocoran',
      'Perbaikan atau penggantian isolator yang retak atau rusak, karena isolasi yang rusak dapat menjadi titik awal terjadinya partial discharge',
      'Cek tekanan gas isolasi secara rutin untuk memastikan tidak ada penurunan yang signifikan (2 bar)',
      'Pastikan transformator dan ruang isolasi bebas dari kelembaban berlebih (30℃ - 40℃)',
      'Lakukan pemeriksaan suhu operasional transformator (60℃ - 65℃) agar tidak melewati batas aman'
    ]
  },
  
  'D1': {
    description: 'Low Energy Discharge (Arcing Ringan)',
    actions: [
      'Lakukan DGA secara rutin: Monitoring kandungan gas utama seperti metana (CH4), etilena (C2H4) dan asetilena (C2H2)',
      'Pantau parameter lain: Selain DGA, cek juga suhu, kebocoran minyak, kebersihan permukaan trafo, dan kondisi busbar/bushing secara visual',
      'Bersihkan isolator dan bushing: Pastikan tidak ada debu, karbon, atau sisa arcing pada isolasi, bushing, dan terminal trafo',
      'Perbaiki atau ganti bagian yang rusak: Segera lakukan perbaikan pada isolasi yang menunjukkan tanda degradasi atau bekas arcing ringan',
      'Kencangkan sambungan listrik: Pastikan semua terminal, baut, dan sambungan kabel tidak longgar',
      'Optimalkan sistem pentanahan: Pastikan grounding trafo dalam kondisi baik guna menekan potensi loncatan listrik',
      'Pengujian tegangan tembus minyak: Lakukan pengujian breakdown voltage pada minyak trafo secara berkala',
      'Rekondisi minyak bila perlu: Jika setelah filtrasi kualitas minyak masih buruk, lakukan penggantian minyak isolasi'
    ]
  },

  'D2': {
    description: 'High Energy Discharge (Arcing Berat)',
    actions: [
      'Lakukan analisa Dissolved Gas Analysis secara lebih sering (2-4 bulan): Untuk deteksi dini kenaikan tajam gas-gas penanda high-energy discharge, terutama (C2H2)',
      'Pantau hasil DGA: Jika konsentrasi gas D2 meningkat, segera lakukan investigasi mendalam',
      'Gunakan infrared thermography: Deteksi early hotspot akibat arcing',
      'Inspeksi internal trafo: Lakukan shutdown terkontrol dan buka cover utama untuk inspeksi visual bagian dalam',
      'Cek kondisi isolasi dan gulungan: Ganti atau rekondisi isolasi kertas/minyak yang menunjukkan tanda kerusakan ekstrim',
      'Perbaikan terminal dan sambungan: Pastikan tidak ada sambungan longgar atau terbakar akibat arcing berat',
      'Pembersihan komponen: Bersihkan sisa karbon, debris, dan partikel logam yang dihasilkan dari pelepasan arcing',
      'Pengujian tegangan tembus minyak: Lakukan breakdown voltage test sesuai standar IEC 60156-95',
      'Periksa warna minyak: Minyak yang menghitam/gelap menandakan dekomposisi akibat arcing berat dan perlu segera diganti',
      'Periksa efektivitas sistem pendingin: Pastikan radiator, kipas, dan sirkulasi minyak bekerja optimal'
    ]
  },

  'T1': {
    description: 'Thermal Fault < 300°C',
    actions: [
      'Rutin melakukan monitoring analisa gas terlarut Dissolved Gas Analysis yang dianalisis dengan metode Duval Triangle',
      'Pengendalian suhu operasi trafo agar tetap dalam batas normal, termasuk pemeriksaan sistem pendingin (radiator, kipas, sirkulasi minyak)',
      'Pemeriksaan fisik dan pembersihan bagian terminal, bushing, dan sambungan untuk memastikan tidak ada kontak longgar',
      'Pengujian dan perawatan minyak isolasi secara berkala dengan pengujian tegangan tembus minyak dan filtrasi minyak',
      'Memastikan sistem grounding dan proteksi berfungsi dengan baik untuk menghindari gangguan listrik sekunder',
      'Melakukan evaluasi beban trafo dan operasional, hindari operasi berlebih yang dapat meningkatkan suhu kerja trafo',
      'Tingkatkan frekuensi pengujian dan lakukan pemantauan tren agar gangguan tidak berkembang menjadi fault medium',
      'Implementasi jadwal preventive maintenance terprogram meliputi DGA, pemeriksaan visual, pengujian isolasi, dan perawatan sistem pendingin'
    ]
  },

  'T2': {
    description: 'Thermal Fault 300-700°C',
    actions: [
      'Rutin melakukan monitoring dan analisa gas terlarut minyak trafo secara berkala dengan metode Duval Triangle',
      'Evaluasi dan optimasi sistem pendinginan trafo, seperti radiator, kipas angin, dan sirkulasi minyak isolasi',
      'Pengujian kualitas minyak isolasi secara berkala, termasuk uji tegangan tembus (breakdown voltage) dan filtrasi atau penggantian minyak',
      'Inspeksi fisik berkala pada terminal, busbar, dan sambungan kelistrikan untuk mendeteksi kontak longgar, kotoran, atau oksidasi',
      'Pengencangan sambungan mekanis dan elektris secara rutin untuk mencegah hotspot akibat kontak buruk',
      'Evaluasi dan pengaturan beban trafo agar tidak melebihi kapasitas desain',
      'Perbaikan atau penggantian komponen isolasi yang terindikasi rusak akibat pemanasan',
      'Memastikan grounding dan sistem proteksi trafo berfungsi optimal',
      'Tingkatkan frekuensi pengujian dan inspeksi bila trennya menunjukkan kenaikan gas thermal T2'
    ]
  },

  'T3': {
    description: 'Thermal Fault > 700°C',
    actions: [
      'Lakukan inspeksi internal trafo secara menyeluruh dalam waktu dekat setelah indikasi high thermal fault terdeteksi',
      'Lakukan shutdown terkontrol sesegera mungkin untuk menghindari kerusakan yang lebih parah',
      'Ganti atau rekondisi isolasi internal trafo yang sudah mengalami degradasi berat akibat overheating',
      'Pemeriksaan dan penggantian minyak isolasi dilakukan secara menyeluruh, karena minyak bisa mengalami degradasi serius',
      'Periksa sistem pendingin dan pastikan berfungsi optimal',
      'Perbaikan sambungan listrik dan terminal yang mengalami kerusakan atau hotspot akibat panas berlebih',
      'Pantau frekuensi dan kualitas pengujian DGA secara lebih intensif ke depan',
      'Pastikan proteksi trafo (relay, Buchholz relay, proteksi tekanan) bekerja optimal',
      'Evaluasi beban operasi trafo dan perencanaan penggantian atau upgrade jika diperlukan',
      'Dokumentasikan secara lengkap seluruh tindakan pemeliharaan, hasil inspeksi, dan kondisi DGA'
    ]
  },

  'DT': {
    description: 'Discharge With Thermal Component',
    actions: [
      'Telusuri riwayat beban, suhu minyak, dan suhu belitan untuk memastikan apakah terjadi overload atau suhu yang melebihi batas',
      'Periksa apakah terdapat lonjakan beban mendadak atau suhu yang abnormal dalam beberapa periode terakhir',
      'Lakukan inspeksi fisik menyeluruh pada trafo, terutama pada bagian isolasi padat dan minyak',
      'Uji kualitas minyak secara komprehensif (tan delta, kandungan air, keasaman dan kontaminan lainnya)',
      'Perbaikan atau penggantian isolasi pada area yang dicurigai mengalami discharge dengan kerusakan termal',
      'Penggantian atau pengolahan minyak (degassing, filtering, atau penggantian) untuk menghilangkan kontaminan',
      'Optimasi pendinginan dengan memperbaiki sistem pendingin atau menambah pendingin tambahan',
      'Mengurangi beban operasi jika memungkinkan untuk menghindari peningkatan panas berlebih',
      'Tingkatkan frekuensi monitoring DGA menjadi setiap 2-4 bulan untuk memantau perkembangan gas'
    ]
  },

  // Triangle 4 Faults
  'S': {
    description: 'Stray Gassing',
    actions: [
      'Telusuri riwayat beban trafo, suhu minyak, dan suhu belitan — stray gassing sering muncul akibat fluktuasi suhu atau beban tinggi non-kronis',
      'Evaluasi apakah terdapat overload ringan atau pencapaian suhu hotspot yang tinggi yang tidak berdampak langsung',
      'Periksa kondisi fisik trafo: apakah ada tanda-tanda degradasi termal ringan, kotoran, atau seal bocor',
      'Lakukan uji kualitas minyak (tan delta, water content) untuk mengetahui apakah minyak mulai menua atau teroksidasi',
      'Degassing minyak bila level gas mendekati batas operasional',
      'Filtering minyak untuk memperlambat penuaan dan menurunkan potensi pelepasan gas',
      'Pendinginan tambahan jika suhu operasional terlalu tinggi secara lokal',
      'Lakukan monitoring DGA secara berkala (3-6 bulan) untuk memastikan pola gas tetap stabil'
    ]
  },

  'C': {
    description: 'Corona',
    actions: [
      'Monitoring rutin Dissolved Gas Analysis menggunakan metode Duval Triangle untuk mendeteksi gas yang khas pada corona',
      'Pemeriksaan visual dan pembersihan berkala pada permukaan isolator, bushing, sambungan terminal',
      'Pengecekan dan pengencangan sambungan listrik agar tidak terjadi kontak longgar',
      'Peningkatan kualitas minyak isolasi melalui pengujian breakdown voltage dan filtrasi rutin (3-6 bulan)',
      'Pengawasan lingkungan sekitar trafo agar terhindar dari sumber polutan atau kelembaban tinggi',
      'Pelaksanaan pemeliharaan preventif terjadwal dengan interval monitoring (3-6 bulan)',
      'Monitoring lebih sering jika hasil analisa Duval Triangle menunjukkan tren kenaikan partial discharge'
    ]
  },

  'ND': {
    description: 'Normal Degradation',
    actions: [
      'Resampling secara berkala untuk monitoring perkembangan gas yang terlarut dalam minyak trafo',
      'CO (Karbon Dioksida) LOW: resampling berkala dalam rentang waktu 4-8 bulan',
      'CO (Karbon Dioksida) MEDIUM: resampling berkala dalam rentang waktu 2-4 bulan',
      'CO (Karbon Dioksida) HIGH: resampling berkala dalam rentang waktu 2-4 bulan',
      'Monitoring rutin kondisi umum transformator',
      'Pemeliharaan preventif sesuai jadwal normal'
    ]
  },

  // Triangle 5 Faults
  'O': {
    description: 'Overheating < 200°C',
    actions: [
      'Monitoring suhu operasional transformator secara kontinyu',
      'Periksa sistem pendinginan dan ventilasi',
      'Evaluasi beban operasional dan distribusi panas',
      'Pemeriksaan sambungan dan kontak listrik',
      'Monitoring DGA secara berkala untuk deteksi dini peningkatan suhu'
    ]
  },

  'NORMAL': {
    description: 'Kondisi Normal',
    actions: [
      'Resampling secara berkala untuk monitoring perkembangan gas yang terlarut dalam minyak trafo',
      'Monitoring DGA rutin sesuai jadwal standar',
      'Pemeliharaan preventif berkala sesuai prosedur',
      'Dokumentasi kondisi normal untuk trend analysis'
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