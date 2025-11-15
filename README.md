# 🚀 ReactServerApp - Cloud Storage Management System

Modern, güvenli ve kullanıcı dostu bir bulut depolama yönetim sistemi. React frontend ve ASP.NET Core backend ile geliştirilmiştir.

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-CC2927?style=for-the-badge&logo=microsoft-sql-server)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

## ✨ Özellikler

### 👥 Kullanıcı Yönetimi
- ✅ Kullanıcı kayıt sistemi (2 GB ücretsiz depolama)
- ✅ Güvenli giriş/çıkış sistemi
- ✅ Profil düzenleme ve şifre değiştirme
- ✅ Session yönetimi (30 gün)
- ✅ Soft delete (yumuşak silme) özelliği

### 🔐 Rol Tabanlı Yetkilendirme
- **Super Admin**: Tüm yetkilere sahip, admin kullanıcılarını yönetebilir
- **Admin**: Kullanıcı yönetimi, disk yönetimi
- **User**: Kendi dosyalarını yönetebilir

### 📁 Dosya Yönetimi
- ✅ Drag & drop dosya yükleme
- ✅ 5GB'a kadar dosya yükleme desteği
- ✅ Dosya indirme ve silme
- ✅ Dosya önizleme (resim ve PDF)
- ✅ Kullanıcı bazında dosya organizasyonu
- ✅ Gerçek zamanlı depolama kullanımı takibi

### 💾 Disk Yönetimi (Admin/Superadmin)
- ✅ Tüm diskleri görüntüleme (isim, boyut, boş alan)
- ✅ Disk bazında kullanıcı kullanım analizi
- ✅ Kullanıcı dosyalarını görüntüleme
- ✅ Admin için sansürlü dosya adları
- ✅ Superadmin için tam erişim ve dosya indirme

### 🛡️ Güvenlik
- ✅ BCrypt ile şifre hash'leme
- ✅ SQL Injection koruması (Entity Framework Core)
- ✅ XSS koruması
- ✅ CORS yapılandırması
- ✅ Güvenli dosya yolu oluşturma

## 🛠️ Teknolojiler

### Backend
- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core 8.0** - ORM
- **SQL Server** - Veritabanı
- **BCrypt.Net-Next** - Şifre hash'leme
- **Swagger/OpenAPI** - API dokümantasyonu

### Frontend
- **React 18+** - UI framework
- **Vite** - Build tool ve dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **Fetch API** - HTTP istekleri

## 📦 Kurulum

### Gereksinimler
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/sql-server/sql-server-downloads) veya SQL Server LocalDB
- [Visual Studio 2022](https://visualstudio.microsoft.com/) veya [VS Code](https://code.visualstudio.com/)

### Backend Kurulumu

1. **Projeyi klonlayın**
```bash
git clone https://github.com/kullaniciadi/ReactServerApp.git
cd ReactServerApp
```

2. **Backend dizinine gidin**
```bash
cd ReactServerApp.Server
```

3. **Connection string'i yapılandırın**
`appsettings.json` dosyasını açın ve SQL Server connection string'inizi güncelleyin:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=YOUR_SERVER;Initial Catalog=ReactServerAppDb;Integrated Security=True;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;"
  }
}
```

4. **NuGet paketlerini geri yükleyin**
```bash
dotnet restore
```

5. **Veritabanını oluşturun**
```bash
dotnet ef database update
```

Veya uygulamayı çalıştırdığınızda otomatik olarak oluşturulacaktır.

6. **Backend'i çalıştırın**
```bash
dotnet run
```

Backend `https://localhost:7247` adresinde çalışacaktır.

### Frontend Kurulumu

1. **Frontend dizinine gidin**
```bash
cd reactserverapp.client
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini yapılandırın** (opsiyonel)
`.env` dosyası oluşturun:

```env
VITE_API_BASE_URL=https://localhost:7247
```

4. **Frontend'i çalıştırın**
```bash
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır.

## 🚀 Kullanım

### İlk Giriş

Uygulama ilk çalıştırıldığında otomatik olarak aşağıdaki kullanıcılar oluşturulur:

#### Super Admin
- **E-posta**: `superadmin@sistem.com`
- **Şifre**: `superadmin123`
- **Rol**: Super Admin
- **Depolama**: 1000 GB

#### Admin
- **E-posta**: `admin@sistem.com`
- **Şifre**: `adminpassword`
- **Rol**: Admin
- **Depolama**: 500 GB

### Yeni Kullanıcı Kaydı

1. Giriş ekranında "Hesabınız yok mu? Kayıt olun" butonuna tıklayın
2. İsim, e-posta ve şifre bilgilerinizi girin
3. Yeni kullanıcılar otomatik olarak **2 GB** depolama kotası ile başlar

### Dosya Yükleme

1. Dashboard'a gidin
2. Dosyaları sürükleyip bırakın veya "Dosya Seç" butonuna tıklayın
3. Maksimum dosya boyutu: **5 GB**
4. Toplam depolama kotanızı aşmayın

### Disk Yönetimi (Admin/Superadmin)

1. Sol menüden "Disk Yönetimi"ne gidin
2. Disk seçin
3. Kullanıcıların disk kullanımlarını görüntüleyin
4. Kullanıcıları genişleterek dosyalarını görüntüleyin
5. Superadmin olarak dosyaları indirebilirsiniz

## 📚 API Dokümantasyonu

Backend çalışırken Swagger UI'ya erişebilirsiniz:

```
https://localhost:7247/swagger
```

### Ana Endpoint'ler

#### Kullanıcı API (`/api/user`)
- `POST /api/user/login` - Kullanıcı girişi
- `POST /api/user/register` - Kullanıcı kaydı
- `GET /api/user` - Tüm kullanıcıları listele (Admin)
- `GET /api/user/{userId}` - Kullanıcı bilgilerini getir
- `PUT /api/user/{userId}` - Kullanıcı güncelle
- `DELETE /api/user/{userId}` - Kullanıcı sil (soft delete)

#### Dosya API (`/api/file`)
- `POST /api/file/upload?userId={userId}` - Dosya yükle
- `GET /api/file/list?userId={userId}` - Dosya listesi
- `GET /api/file/download/{fileName}?userId={userId}` - Dosya indir
- `DELETE /api/file/delete/{fileName}?userId={userId}` - Dosya sil

#### Disk API (`/api/disk`)
- `GET /api/disk/info?currentUserId={userId}` - Disk bilgileri (Admin/Superadmin)
- `GET /api/disk/usage/{driveName}?currentUserId={userId}` - Disk kullanımı
- `GET /api/disk/files/{driveName}/{userId}?currentUserId={userId}` - Kullanıcı dosyaları
- `GET /api/disk/download/{driveName}/{userId}/{fileName}?currentUserId={userId}` - Dosya indir (Superadmin)

## 📸 Ekran Görüntüleri

### Giriş Ekranı
![Login Screen](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Disk Yönetimi
![Disk Management](screenshots/disk-management.png)

### Yönetici Paneli
![Admin Panel](screenshots/admin-panel.png)

> **Not**: Ekran görüntüleri eklenecektir.

## 🔧 Yapılandırma

### Backend Yapılandırması

`appsettings.json` dosyasında aşağıdaki ayarları yapabilirsiniz:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_CONNECTION_STRING"
  },
  "Kestrel": {
    "Limits": {
      "MaxRequestBodySize": 5368709120  // 5GB (bytes)
    }
  }
}
```

### Frontend Yapılandırması

`vite.config.js` dosyasında proxy ayarlarını yapabilirsiniz:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://localhost:7247',
      changeOrigin: true,
      secure: false
    }
  }
}
```

## 🗂️ Proje Yapısı

```
ReactServerApp/
├── ReactServerApp.Server/          # ASP.NET Core Backend
│   ├── Controllers/                # API Controllers
│   │   ├── UserController.cs
│   │   ├── FileController.cs
│   │   └── DiskController.cs
│   ├── Models/                     # Entity Models
│   │   └── User.cs
│   ├── Data/                       # DbContext
│   │   └── ApplicationDbContext.cs
│   ├── Services/                    # Business Logic
│   │   └── PasswordHasher.cs
│   ├── Migrations/                 # EF Core Migrations
│   └── appsettings.json
│
└── reactserverapp.client/          # React Frontend
    ├── src/
    │   ├── components/             # React Components
    │   ├── views/                 # Page Views
    │   ├── services/              # API Services
    │   ├── constants/             # Constants
    │   └── App.jsx                # Main App Component
    └── package.json
```

## 🐛 Bilinen Sorunlar

- [ ] Çoklu disk desteği henüz tam olarak test edilmedi
- [ ] Büyük dosya yüklemelerinde progress bar yok

## 🚧 Gelecek Özellikler

- [ ] Dosya paylaşımı (link ile)
- [ ] Dosya versiyonlama
- [ ] Dosya arama ve filtreleme
- [ ] Email bildirimleri
- [ ] 2FA (İki faktörlü kimlik doğrulama)
- [ ] API rate limiting
- [ ] Dosya yükleme progress bar'ı
- [ ] Çoklu dil desteği

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 👨‍💻 Geliştirici

Bu proje açık kaynak olarak geliştirilmiştir.

## 🙏 Teşekkürler

- [React](https://reactjs.org/)
- [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

