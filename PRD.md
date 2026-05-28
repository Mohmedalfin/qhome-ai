# PRD Context: Upload RAB dan Match RAB

## Tujuan

Dokumen ini menjelaskan alur eksekusi untuk proses upload RAB, ekstraksi, matching ke katalog QHome, dan penyimpanan konteks hasil analisis di frontend.

Fokus utama dokumen ini adalah alur:

1. User upload file RAB.
2. Backend mengekstrak isi dokumen.
3. Frontend mengirim item hasil ekstraksi ke endpoint match.
4. Hasil ekstraksi dan hasil matching disimpan sebagai konteks aktif.
5. Hasil matching ditampilkan di panel kanan.
6. Konteks aktif siap dipakai oleh WebSocket chat di tahap berikutnya.

---

## Prinsip Utama

Konteks analisis tidak diambil langsung dari UI panel kanan.

Sebaliknya:

1. `upload-rab` menghasilkan data ekstraksi.
2. `match-rab` menghasilkan data pencocokan.
3. Frontend menyimpan keduanya ke satu objek konteks aktif.
4. Panel kanan hanya menjadi representasi visual dari konteks aktif tersebut.

Dengan cara ini:

- hasil analisis tetap bisa dibaca ulang
- chat WebSocket nanti tinggal mengambil konteks aktif
- UI tidak menjadi sumber kebenaran utama

---

## Endpoint Yang Dipakai

### 1. Upload RAB

Endpoint:

`POST /api/v1/b2b/upload-rab`

Fungsi:

Membaca file RAB dan mengembalikan hasil ekstraksi serta audit AI.

Contoh response:

```json
{
  "status": "success",
  "message": "Dokumen RAB berhasil diekstrak dan diaudit oleh AI",
  "data": {
    "project_name": "Tidak Diketahui",
    "contractor_name": "Tidak Diketahui",
    "items": [
      {
        "item_name": "Bata Merah",
        "quantity": 70,
        "unit": "Buah",
        "price_per_unit": 1000,
        "total_price": 70000,
        "is_suspicious": false
      }
    ],
    "total_budget": 204850,
    "fraud_analysis_summary": "Peringatan: Ditemukan 3 item yang terindikasi Mark-up harga..."
  }
}
```

### 2. Match RAB

Endpoint:

`POST /api/v1/b2b/match-rab`

Fungsi:

Mencocokkan item hasil ekstraksi dengan katalog QHome.

Payload:

```json
{
  "items": [
    {
      "item_name": "string",
      "quantity": 0
    }
  ]
}
```

Catatan:

Payload `match-rab` hanya membutuhkan:

- `item_name`
- `quantity`

Field lain dari hasil ekstraksi tidak wajib dikirim ke endpoint ini.

---

## Alur Eksekusi Frontend

### Step 1. Upload File

User mengupload file PDF, Excel, atau gambar RAB.

Frontend mengirim file ke:

`POST /api/v1/b2b/upload-rab`

### Step 2. Simpan Hasil Ekstraksi

Frontend menerima response lalu menyimpan data ke konteks aktif.

Data yang disimpan dari ekstraksi:

- `project_name`
- `contractor_name`
- `items`
- `total_budget`
- `fraud_analysis_summary`

### Step 3. Kirim Items Ke Match

Frontend mengambil `data.items` dari response upload lalu memetakan ke payload match:

```json
{
  "item_name": item.item_name,
  "quantity": item.quantity
}
```

Lalu mengirim ke:

`POST /api/v1/b2b/match-rab`

### Step 4. Simpan Hasil Matching

Frontend menerima response matching lalu menyimpan:

- `summary`
- `found_items`
- `not_found_items`

ke konteks aktif yang sama.

### Step 5. Tampilkan Panel Kanan

Frontend menampilkan hasil matching di panel kanan sebagai tampilan utama.

Panel kanan tetap dapat menampilkan hasil ekstraksi sebagai informasi pendukung, tetapi data utama yang terlihat user adalah hasil matching.

---

## Skema Konteks Aktif

Frontend menyimpan satu objek konteks aktif untuk satu file RAB yang sedang diproses.

Nama konsep:

`active_analysis_context`

Contoh struktur:

```json
{
  "analysis_id": "anl_001",
  "file_name": "RAB Renovasi Ruko.xlsx",
  "extraction": {
    "project_name": "Tidak Diketahui",
    "contractor_name": "Tidak Diketahui",
    "items": [],
    "total_budget": 204850,
    "fraud_analysis_summary": "Peringatan: Ditemukan 3 item yang terindikasi Mark-up harga..."
  },
  "matching": {
    "summary": {
      "total_rab_items": 8,
      "total_found": 5,
      "total_not_found": 3,
      "estimated_total_qhome_price": 3850000
    },
    "found_items": [],
    "not_found_items": []
  },
  "last_updated_at": "2026-05-28T10:21:00Z"
}
```

### Fungsi Field

`analysis_id`

Identitas unik untuk sesi analisis aktif.

`file_name`

Nama file yang diupload user.

`extraction`

Menyimpan hasil dari `upload-rab`.

`matching`

Menyimpan hasil dari `match-rab`.

`last_updated_at`

Waktu terakhir konteks diperbarui.

---

## Skema Payload Matching

Frontend tidak langsung mengirim seluruh response `upload-rab` ke `match-rab`.

Yang dikirim hanya item hasil ekstraksi yang sudah dipetakan:

```json
{
  "items": [
    {
      "item_name": "Bata Merah",
      "quantity": 70
    },
    {
      "item_name": "Semen",
      "quantity": 11.5
    }
  ]
}
```

### Aturan Mapping

1. Ambil `data.items` dari response upload.
2. Untuk setiap item, kirim hanya:
   - `item_name`
   - `quantity`
3. Field seperti `unit`, `price_per_unit`, `total_price`, dan `is_suspicious` tetap disimpan di konteks ekstraksi, tetapi tidak wajib dikirim ke match.

---

## Skema UI Panel Kanan

Hasil di panel kanan dibagi menjadi dua lapisan:

### Lapisan 1. Hasil Matching

Ini adalah tampilan utama yang ditunjukkan ke user.

Isi:

- ringkasan hasil matching
- barang tersedia
- barang tidak tersedia
- estimasi harga QHome

### Lapisan 2. Hasil Ekstraksi

Ini adalah informasi pendukung dari `upload-rab`.

Isi:

- nama proyek
- nama kontraktor
- total budget
- fraud analysis summary
- daftar item hasil ekstraksi

### Tujuan UI

Panel kanan harus membantu user memahami:

1. apa isi dokumen RAB
2. item mana yang berhasil dicocokkan
3. item mana yang tidak ditemukan

---

## Skema Bubble Chat

Saat user upload file RAB, bubble assistant tidak boleh langsung tampil seolah AI sudah memberi jawaban analisis penuh sebelum WebSocket aktif.

Yang dipakai adalah bubble template berbasis status proses.

### Tipe Bubble

#### 1. `upload_received`

Dipakai saat file baru saja diterima.

Contoh isi:

- `File diterima. Saya sedang memproses dokumen RAB.`

Tampilan ini hanya memberi konfirmasi bahwa file sudah masuk.

#### 2. `processing`

Dipakai saat backend sedang mengekstrak dan melakukan matching.

Contoh isi:

- `Dokumen sedang diekstrak dan dicocokkan dengan katalog QHome.`

Bubble ini boleh menampilkan indikator loading atau typing state.

#### 3. `analysis_ready`

Dipakai setelah `upload-rab` dan `match-rab` selesai.

Contoh isi:

- `Analisis selesai. Silakan lihat hasil analisis.`

Pada tipe ini tombol `Lihat Hasil Analisis` boleh muncul.

### Aturan Tampilan Bubble

1. Jika hanya file diterima, jangan tampilkan jawaban AI analitis.
2. Jika proses masih berjalan, tampilkan status proses.
3. Jika matching sudah selesai, baru tampilkan CTA `Lihat Hasil Analisis`.
4. Bubble hasil analisis bukan sumber kebenaran utama. Sumber utamanya tetap konteks aktif dari `upload-rab` dan `match-rab`.

### Tujuan UX

Dengan pola ini:

- user tahu bahwa sistem sedang bekerja
- tidak ada kesan AI menjawab terlalu cepat
- tombol hasil analisis muncul pada momen yang tepat
- alur chat tetap sinkron dengan panel kanan

---

## Skema Konteks Untuk WebSocket

Konteks aktif yang sudah berisi `extraction` dan `matching` akan menjadi dasar untuk komunikasi WebSocket di tahap berikutnya.

Saat user mengirim chat lanjutan, frontend cukup mengirim:

- `analysis_id`
- ringkasan `extraction`
- ringkasan `matching`
- pesan user

Dengan begitu WebSocket tidak perlu menebak konteks dari nol.

Sebelum WebSocket diintegrasikan penuh, bubble template tetap bisa dipakai untuk menampilkan status proses dan memunculkan CTA hasil analisis.

---