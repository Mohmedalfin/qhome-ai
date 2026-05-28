Tolong perbaiki posisi tombol untuk menampilkan panel hasil analisis RAB.

Saat ini flow-nya adalah:
- User berada di tampilan AI Agent/chat.
- User mengunggah file PDF RAB melalui area chat.
- Setelah PDF berhasil diproses, panel kanan "Hasil Analisis RAB" akan muncul atau bisa dibuka oleh user.
- Namun saat ini tombol untuk membuka/menutup panel hasil masih berada di bagian atas layout.
- Tombol tersebut seharusnya berada di area chat, karena aksi upload PDF dan hasil analisis berasal dari interaksi user di chat.

Requirement perbaikan:
- Pindahkan tombol buka/tutup panel "Hasil Analisis RAB" ke area chat.
- Tombol boleh muncul di dekat message hasil upload PDF, area input chat, atau bagian atas konten chat, selama masih terasa sebagai bagian dari interaksi chat.
- Jangan letakkan tombol utama panel result di top bar global.
- Top bar hanya digunakan untuk elemen umum halaman, bukan kontrol spesifik hasil analisis.
- Ketika user belum mengunggah PDF RAB, tombol result tidak perlu ditampilkan.
- Ketika PDF RAB sudah diproses, tampilkan tombol seperti:
  - "Lihat Hasil Analisis"
  - "Tutup Hasil Analisis"
  - atau icon toggle yang jelas.
- Saat tombol diklik, panel kanan "Hasil Analisis RAB" harus bisa terbuka dan tertutup.
- Pada tampilan mobile/responsive, panel result bisa berubah menjadi drawer/modal/bottom sheet agar tidak merusak layout chat.

Tujuan UX:
Kontrol untuk melihat hasil analisis harus terasa dekat dengan konteks chat/upload PDF, bukan seperti kontrol global halaman. User harus paham bahwa tombol tersebut muncul karena file RAB yang mereka upload sudah dianalisis.