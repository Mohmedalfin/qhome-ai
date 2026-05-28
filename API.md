# PRD Simple: Alur Endpoint QHome AI Assistant

## Tujuan

Dokumen ini menjelaskan alur endpoint QHome AI Assistant secara sederhana agar frontend dan AI agent memahami proses utama sistem.

Sistem ini digunakan untuk membantu user menganalisis file RAB. File RAB akan dibaca terlebih dahulu oleh sistem, lalu hasil ekstraksinya dicocokkan dengan katalog produk QHome. Hasil akhirnya adalah daftar barang yang tersedia, barang yang tidak tersedia, harga produk QHome, quantity, subtotal, dan estimasi total biaya.

---

## Alur Utama

Alur utama sistem adalah:

Login
↓
User upload file RAB
↓
Backend mengekstrak isi file RAB
↓
Backend menghasilkan daftar item RAB dalam bentuk JSON
↓
Frontend mengambil data items dari hasil ekstraksi
↓
Frontend mengirim items ke endpoint match RAB
↓
Backend mencocokkan items dengan katalog QHome
↓
Backend mengembalikan hasil barang tersedia dan tidak tersedia
↓
Frontend menampilkan hasil ke UI chat

Intinya, file RAB tidak langsung dicocokkan ke katalog QHome. File RAB harus diekstrak dulu menjadi daftar item. Setelah daftar item didapat, barulah item tersebut dikirim ke endpoint matching untuk dicek apakah tersedia di katalog QHome atau tidak.

---

## 1. Register User

Endpoint:

POST /api/v1/auth/register

Fungsi:

Mendaftarkan user baru atau admin

Payload:

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "Nama User",
  "company_name": "Nama Perusahaan",
  "role": ""
}

Hasil response:

{
  "status": "success",
  "message": "User berhasil dibuat",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Nama User",
    "company_name": "Nama Perusahaan",
    "role": "",
    "is_active": true
  }
}

Catatan frontend:

Setelah register berhasil, user diarahkan ke halaman login. Endpoint register tidak digunakan untuk menyimpan token.

---

## 2. Login User

Endpoint:

POST /api/v1/auth/login

Fungsi:

Login user dan mendapatkan JWT token.

Content-Type:

application/x-www-form-urlencoded

Payload:

username=user@example.com
password=password123

Hasil response:

{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "role": "B2B"
}

Catatan frontend:

Setelah login berhasil, frontend menyimpan access_token dan role.

access_token digunakan untuk mengakses endpoint yang membutuhkan authentication.

role digunakan untuk menentukan halaman user.

Contoh:

Jika role B2B, user masuk ke halaman QHome AI Assistant.

Jika role ADMIN, user masuk ke dashboard admin.

Jika role B2C, user masuk ke dashboard customer.

Header untuk endpoint protected:

Authorization: Bearer <access_token>

---

## 3. Upload RAB

Endpoint:

POST /api/v1/b2b/upload-rab

Fungsi:

Mengupload file RAB, lalu backend membaca dan mengekstrak isi file tersebut menjadi data JSON.

File yang dikirim bisa berupa:

PDF
Excel
Gambar atau foto RAB

Content-Type:

multipart/form-data

Header:

Authorization: Bearer <access_token>

Payload:

file: RAB.pdf / RAB.xlsx / gambar RAB

Hasil response:

{
  "status": "success",
  "message": "Dokumen RAB berhasil diekstrak dan diaudit oleh AI",
  "data": {
    "project_name": "Renovasi Ruko Sentral",
    "contractor_name": "PT Contoh Kontraktor",
    "items": [
      {
        "item_name": "Batako Ukuran 40x20x10",
        "quantity": 70,
        "unit": "buah",
        "price_per_unit": 3500,
        "total_price": 245000,
        "is_suspicious": false
      }
    ],
    "total_budget": 245000,
    "fraud_analysis_summary": "Tidak ditemukan indikasi mark-up harga."
  }
}

Data penting dari endpoint ini:

data.items

Karena data.items akan dipakai untuk endpoint berikutnya, yaitu match RAB.

Penjelasan:

Endpoint upload-rab hanya bertugas membaca isi file RAB. Endpoint ini belum bertugas menentukan apakah barang tersedia di QHome atau tidak.

Output utama dari upload-rab adalah daftar item hasil ekstraksi.

Contoh hasil item:

{
  "item_name": "Batako Ukuran 40x20x10",
  "quantity": 70,
  "unit": "buah",
  "price_per_unit": 3500,
  "total_price": 245000,
  "is_suspicious": false
}

---

## 4. Match RAB ke Katalog QHome

Endpoint:

POST /api/v1/b2b/match-rab

Fungsi:

Mencocokkan item hasil ekstraksi RAB dengan katalog produk QHome.

Content-Type:

application/json

Header:

Authorization: Bearer <access_token>

Payload:

{
  "items": [
    {
      "item_name": "Batako Ukuran 40x20x10",
      "quantity": 70
    }
  ]
}

Payload endpoint match-rab berasal dari hasil upload-rab.

Alurnya:

upload-rab menghasilkan data.items
↓
frontend mengambil item_name dan quantity
↓
frontend mengirim data tersebut ke match-rab

Contoh mapping dari hasil upload:

{
  "item_name": item.item_name,
  "quantity": item.quantity
}

Hasil response:

{
  "status": "success",
  "message": "AI berhasil memisahkan barang yang tersedia dan tidak tersedia",
  "data": {
    "summary": {
      "total_rab_items": 1,
      "total_found": 1,
      "total_not_found": 0,
      "estimated_total_qhome_price": 3850000
    },
    "found_items": [
      {
        "rab_item_name": "Batako Ukuran 40x20x10",
        "requested_quantity": 70,
        "best_match_qhome": {
          "id": "1",
          "sku": "00221107",
          "name": "Batako Ukuran 40x20x10",
          "brand": "QHome",
          "price": 55000,
          "similarity_percentage": 92.5
        },
        "other_alternatives": [],
        "subtotal_estimation": 3850000
      }
    ],
    "not_found_items": []
  }
}

Data penting dari response match-rab:

summary
found_items
not_found_items

Penjelasan:

summary digunakan untuk menampilkan ringkasan hasil matching.

found_items adalah daftar barang RAB yang berhasil ditemukan di katalog QHome.

not_found_items adalah daftar barang RAB yang tidak ditemukan di katalog QHome.

best_match_qhome adalah produk QHome yang paling cocok dengan item RAB.

subtotal_estimation adalah estimasi harga berdasarkan quantity RAB dikalikan harga produk QHome.

---

## 5. Status Barang

Status barang di frontend hanya ada dua:

Tersedia
Tidak tersedia

Aturan status:

Jika item masuk ke found_items, maka statusnya adalah Tersedia.

Jika item masuk ke not_found_items, maka statusnya adalah Tidak tersedia.

Tidak ada status alternatif.

## 6. WebSocket Progress

Endpoint:

WS /api/v1/chat/events

Fungsi:

Mengirim progress proses AI dari backend ke frontend secara realtime.

WebSocket tidak digunakan untuk upload file. Upload file tetap menggunakan endpoint REST upload-rab.

Contoh event progress:

{
  "type": "agent_progress",
  "step": "document_extractor",
  "status": "running",
  "message": "Membaca dan mengekstrak item dari file RAB"
}

Contoh event selesai:

{
  "type": "agent_progress",
  "step": "document_extractor",
  "status": "success",
  "message": "File RAB berhasil diekstrak"
}

Step yang bisa ditampilkan di UI:

Document Extractor
Catalog Matching
Pricing Optimizer

Penjelasan step:

Document Extractor digunakan saat backend membaca dan mengekstrak file RAB.

Catalog Matching digunakan saat backend mencocokkan item RAB dengan katalog QHome.

Pricing Optimizer digunakan saat backend menghitung estimasi harga dan subtotal.

Status progress:

idle
running
success
failed

---

## 7. Admin Product

Endpoint:

POST /api/v1/admin/products

Fungsi:

Admin menambahkan produk ke katalog QHome.

Produk yang ditambahkan admin akan menjadi data utama untuk proses matching RAB.

Payload:

{
  "sku": "00221107",
  "name": "Semen Gresik 40 Kg",
  "brand": "Gresik",
  "category": "Semen",
  "price": 55000,
  "stock": 100,
  "unit": "sak",
  "description": "Semen Gresik ukuran 40 Kg",
  "specifications": {
    "weight": "40kg",
    "type": "Portland Cement"
  },
  "tags": ["semen", "bangunan", "material"]
}

Hasil response:

{
  "status": "success",
  "message": "Produk berhasil dibuat",
  "data": {
    "id": 1,
    "sku": "00221107",
    "name": "Semen Gresik 40 Kg",
    "brand": "Gresik",
    "category": "Semen",
    "price": 55000,
    "stock": 100,
    "unit": "sak",
    "description": "Semen Gresik ukuran 40 Kg",
    "specifications": {
      "weight": "40kg",
      "type": "Portland Cement"
    },
    "tags": ["semen", "bangunan", "material"],
    "is_active": true
  }
}

Penjelasan:

Data produk yang dibuat melalui endpoint ini akan digunakan oleh endpoint match-rab untuk mencocokkan item RAB dengan katalog QHome.

---

## 8. Alur Lengkap dari Frontend

Alur frontend dari awal sampai akhir:

1. User login.
2. Frontend mengirim email dan password ke endpoint login.
3. Backend mengembalikan access_token dan role.
4. Frontend menyimpan access_token dan role.
5. User masuk ke halaman QHome AI Assistant.
6. User upload file RAB.
7. Frontend mengirim file ke endpoint upload-rab.
8. Backend mengekstrak file RAB.
9. Backend mengembalikan hasil ekstraksi RAB.
10. Frontend mengambil data.items.
11. Frontend mengirim data.items ke endpoint match-rab.
12. Backend mencocokkan item RAB dengan katalog QHome.
13. Backend mengembalikan found_items dan not_found_items.
14. Frontend menampilkan hasil ke UI.
15. Jika user bertanya lanjutan, frontend mengirim teks ke chat/message.
