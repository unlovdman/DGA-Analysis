# 📖 Panduan Penggunaan Aplikasi DGA Web

## 🚀 Cara Menjalankan Aplikasi

### 1. Development Mode
```bash
pnpm run dev
```
Aplikasi akan berjalan di: **http://localhost:3000**

### 2. Build Production
```bash
pnpm run build
pnpm run preview
```

## 🎯 Fitur Utama Aplikasi

### 1. **Dashboard** 
- Overview statistik DGA
- Trend analysis 
- Quick actions

### 2. **Manual Analysis (Fitur Utama)** ⭐ **BARU!**
- Input data gas secara manual untuk akurasi 100%
- Pilih fault type berdasarkan analisis expert
- Upload gambar opsional untuk referensi
- Multi-triangle analysis (Triangle 1, 4, 5)
- Rekomendasi detail berdasarkan fault terpilih

### 3. **Upload**
- Drag & drop interface
- Preview gambar
- Screenshot support dengan Ctrl+V

## 🔬 Cara Menggunakan Manual DGA Analysis ⭐ **UPDATED!**

### Langkah 1: Pilih Triangle Method
1. Klik menu **"Analysis"** di header
2. Pilih triangle method yang sesuai:
   - **Triangle 1**: CH4, C2H4, C2H2 → Faults: PD, D1, D2, T1, T2, T3, DT
   - **Triangle 4**: H2, CH4, C2H6 → Faults: S, PD, ND, DT, C, D2
   - **Triangle 5**: CH4, C2H4, C2H6 → Faults: O, S, ND, C, T2, T3

### Langkah 2: Input Data Manual
**Untuk setiap triangle:**
1. **Upload gambar (opsional)** - untuk referensi visual atau dokumentasi
2. **Input gas concentrations** secara manual dalam satuan ppm:
   - Triangle 1: CH4, C2H4, C2H2
   - Triangle 4: H2, CH4, C2H6
   - Triangle 5: CH4, C2H4, C2H6
3. **Pilih fault type** dari dropdown sesuai hasil analisis Anda

### Langkah 3: Multi-Triangle Analysis
- Tambahkan **multiple triangles** sesuai kebutuhan
- Setiap triangle dianalisis **independent**
- Hasil **digabungkan** untuk rekomendasi komprehensif
- **Remove triangle** yang tidak diperlukan

### Langkah 4: Review Hasil & Rekomendasi
- **Overall severity** berdasarkan semua fault yang dipilih
- **Rekomendasi utama** dengan prioritas (LOW/MEDIUM/HIGH/CRITICAL)
- **Detail action items** berdasarkan file rekomendasi standar
- **Timeline pemeliharaan** yang spesifik 