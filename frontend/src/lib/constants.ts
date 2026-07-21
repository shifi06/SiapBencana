// Data provinsi -> kota, dipindah dari KOTA_DATA di index.html (legacy)
// Dipertahankan apa adanya agar seluruh dropdown provinsi/kota tetap konsisten dengan versi lama.

export const KEAHLIAN_OPTIONS: { value: string; label: string }[] = [
  { value: "Medis", label: "🏥 Medis (dokter, perawat, bidan, paramedis)" },
  { value: "Logistik", label: "🚛 Logistik (pengemudi, distribusi bantuan)" },
  { value: "Teknik", label: "🔧 Teknik (listrik, bangunan, mekanik)" },
  { value: "Komunikasi", label: "📻 Komunikasi (operator radio, IT, media)" },
  { value: "Psikologi", label: "🧠 Psikologi (konselor trauma, pendamping jiwa)" },
  { value: "Lainnya", label: "🤝 Lainnya (masak, SAR, dll)" },
];

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "Siap", label: "✅ Siap dipanggil kapanpun" },
  { value: "Terbatas", label: "⏰ Terbatas (perlu konfirmasi)" },
  { value: "TidakAktif", label: "❌ Sementara tidak aktif" },
];

export const SKILL_EMOJI: Record<string, string> = {
  Medis: "🏥",
  Logistik: "🚛",
  Teknik: "🔧",
  Komunikasi: "📻",
  Psikologi: "🧠",
  Lainnya: "🤝",
};

export const STATUS_LABEL: Record<string, string> = {
  Siap: "Siap",
  Terbatas: "Terbatas",
  TidakAktif: "Tidak Aktif",
};

export const KOTA_DATA: Record<string, string[]> = 
{
  "Jabodetabek":["Jakarta Pusat","Jakarta Selatan","Jakarta Barat","Jakarta Timur","Jakarta Utara","Bogor","Depok","Tangerang","Tangerang Selatan","Bekasi","Kabupaten Bogor","Kabupaten Tangerang","Kabupaten Bekasi","Serpong","Pamulang","Ciputat","Cileungsi","Ciawi","Lembang","Gunung Putri","Cibinong","Bojonggede","Parung"],
  "Banten":["Cilegon","Serang","Tangerang","Tangerang Selatan","Kabupaten Lebak","Kabupaten Pandeglang","Kabupaten Tangerang","Kabupaten Serang","Serpong","Pamulang","Ciputat"],
  "DKI Jakarta":["Jakarta Barat","Jakarta Pusat","Jakarta Selatan","Jakarta Timur","Jakarta Utara","Kepulauan Seribu"],
  "Jawa Barat":["Bandung","Bekasi","Bogor","Cimahi","Cirebon","Depok","Sukabumi","Tasikmalaya","Kabupaten Bandung","Bandung Barat","Kabupaten Bekasi","Kabupaten Bogor","Ciamis","Cianjur","Kabupaten Cirebon","Garut","Indramayu","Karawang","Kuningan","Majalengka","Pangandaran","Purwakarta","Subang","Kabupaten Sukabumi","Sumedang","Kabupaten Tasikmalaya","Ciawi","Cileungsi","Lembang","Padalarang","Serpong"],
  "Jawa Tengah":["Magelang","Pekalongan","Salatiga","Semarang","Surakarta","Tegal","Banjarnegara","Banyumas","Batang","Blora","Boyolali","Brebes","Cilacap","Demak","Grobogan","Jepara","Karanganyar","Kebumen","Kendal","Klaten","Kudus","Kabupaten Magelang","Pati","Pemalang","Purbalingga","Purworejo","Rembang","Kabupaten Semarang","Sragen","Sukoharjo","Temanggung","Wonogiri","Wonosobo"],
  "Jawa Timur":["Batu","Blitar","Kediri","Madiun","Malang","Mojokerto","Pasuruan","Probolinggo","Surabaya","Bangkalan","Banyuwangi","Bojonegoro","Bondowoso","Gresik","Jember","Jombang","Lamongan","Lumajang","Nganjuk","Ngawi","Pacitan","Pamekasan","Ponorogo","Sampang","Sidoarjo","Situbondo","Sumenep","Trenggalek","Tuban","Tulungagung"],
  "DI Yogyakarta":["Yogyakarta","Bantul","Gunungkidul","Kulon Progo","Sleman"],
  "Aceh":["Banda Aceh","Langsa","Lhokseumawe","Sabang","Subulussalam","Aceh Besar","Aceh Utara"],
  "Bali":["Denpasar","Badung","Bangli","Buleleng","Gianyar","Jembrana","Karangasem","Klungkung","Tabanan"],
  "Bengkulu":["Bengkulu","Bengkulu Selatan","Bengkulu Utara","Rejang Lebong"],
  "Gorontalo":["Gorontalo","Boalemo","Bone Bolango"],
  "Jambi":["Jambi","Sungai Penuh","Batanghari","Bungo","Kerinci","Merangin","Muaro Jambi","Sarolangun","Tebo"],
  "Kalimantan Barat":["Pontianak","Singkawang","Bengkayang","Kapuas Hulu","Ketapang","Kubu Raya","Landak","Sambas","Sanggau","Sintang"],
  "Kalimantan Selatan":["Banjarbaru","Banjarmasin","Banjar","Barito Kuala","Hulu Sungai Selatan","Kotabaru","Tabalong","Tanah Bumbu"],
  "Kalimantan Tengah":["Palangka Raya","Barito Selatan","Barito Utara","Kotawaringin Barat","Kotawaringin Timur","Kapuas"],
  "Kalimantan Timur":["Balikpapan","Bontang","Samarinda","Berau","Kutai Kartanegara","Kutai Timur","Paser"],
  "Kalimantan Utara":["Tarakan","Bulungan","Malinau","Nunukan"],
  "Kepulauan Bangka Belitung":["Pangkal Pinang","Bangka","Bangka Barat","Bangka Selatan","Bangka Tengah","Belitung"],
  "Kepulauan Riau":["Batam","Tanjung Pinang","Bintan","Karimun","Natuna"],
  "Lampung":["Bandar Lampung","Metro","Lampung Barat","Lampung Selatan","Lampung Tengah","Lampung Timur","Lampung Utara"],
  "Maluku":["Ambon","Tual","Buru","Maluku Tengah","Maluku Tenggara","Seram Bagian Barat","Seram Bagian Timur"],
  "Maluku Utara":["Ternate","Tidore Kepulauan","Halmahera Barat","Halmahera Selatan","Halmahera Utara"],
  "Nusa Tenggara Barat":["Bima","Mataram","Dompu","Lombok Barat","Lombok Tengah","Lombok Timur","Lombok Utara","Sumbawa"],
  "Nusa Tenggara Timur":["Kupang","Alor","Ende","Flores Timur","Manggarai","Manggarai Barat","Nagekeo","Ngada","Sikka","Sumba Timur"],
  "Papua":["Jayapura","Keerom","Sarmi","Waropen"],
  "Papua Barat":["Manokwari","Fakfak","Kaimana","Raja Ampat","Sorong"],
  "Riau":["Dumai","Pekanbaru","Bengkalis","Kampar","Pelalawan","Rokan Hilir","Rokan Hulu","Siak"],
  "Sulawesi Barat":["Majene","Mamasa","Mamuju","Polewali Mandar"],
  "Sulawesi Selatan":["Makassar","Palopo","Parepare","Bantaeng","Barru","Bone","Bulukumba","Enrekang","Gowa","Maros","Pinrang","Sinjai","Soppeng","Takalar","Wajo"],
  "Sulawesi Tengah":["Palu","Banggai","Buol","Donggala","Morowali","Poso","Toli-Toli"],
  "Sulawesi Tenggara":["Bau-Bau","Kendari","Bombana","Buton","Kolaka","Konawe","Muna","Wakatobi"],
  "Sulawesi Utara":["Bitung","Kotamobagu","Manado","Tomohon","Bolaang Mongondow","Kepulauan Sangihe","Kepulauan Talaud","Minahasa"],
  "Sumatera Barat":["Bukittinggi","Padang","Padang Panjang","Pariaman","Payakumbuh","Sawahlunto","Solok","Agam","Dharmasraya","Lima Puluh Kota","Pasaman","Pesisir Selatan","Tanah Datar"],
  "Sumatera Selatan":["Lubuklinggau","Pagar Alam","Palembang","Prabumulih","Banyuasin","Lahat","Muara Enim","Musi Banyuasin","Ogan Ilir","Ogan Komering Ilir","Ogan Komering Ulu"],
  "Sumatera Utara":["Binjai","Gunungsitoli","Medan","Padangsidimpuan","Pematangsiantar","Sibolga","Tanjungbalai","Tebing Tinggi","Asahan","Deli Serdang","Karo","Langkat","Nias","Nias Selatan","Simalungun","Tapanuli Selatan","Tapanuli Tengah","Tapanuli Utara","Toba"],
};

export const PROVINSI_LIST = Object.keys(KOTA_DATA).sort();
