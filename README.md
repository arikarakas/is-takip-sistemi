# Sungurlar İş Takip Sistemi

Proje takip ve yönetim uygulaması. FastAPI backend, React + Vite frontend ve PostgreSQL ile Docker üzerinde çalışır.

## Gereksinimler

- [Docker](https://www.docker.com/) ve Docker Compose
- (İsteğe bağlı) Yerel geliştirme için Python 3.11+ ve Node.js 22+

## Hızlı başlangıç (Docker)

```bash
# 1. Ortam dosyasını oluştur
cp .env.example .env
# .env içindeki şifre ve JWT secret değerlerini güncelle

# 2. Servisleri başlat
docker compose up --build -d

# 3. Veritabanı migration'larını çalıştır
docker compose exec backend alembic upgrade head
```

Uygulama adresleri:

| Servis   | Adres                          |
|----------|--------------------------------|
| Frontend | http://localhost:3000          |
| Backend  | http://localhost:8000          |
| API docs | http://localhost:8000/api/v1/docs |

## Ortam değişkenleri

Tüm değişkenler kök dizindeki `.env` dosyasından okunur. Şablon için `.env.example` dosyasına bakın.

| Değişken | Açıklama |
|----------|----------|
| `POSTGRES_*` | PostgreSQL bağlantı bilgileri (`DATABASE_URL` bunlardan otomatik üretilir) |
| `JWT_SECRET_KEY` | JWT imzalama anahtarı (en az 32 karakter) |
| `BACKEND_PORT` | API portu (varsayılan: 8000) |

## Proje yapısı

```
├── backend/          # FastAPI API, Alembic migration'lar
├── frontend/         # React + Vite arayüz
├── nginx/            # Reverse proxy yapılandırması (ileride)
├── docker-compose.yml
└── .env.example
```

## Yerel geliştirme (Docker olmadan)

**Backend:**

```bash
cd backend
python -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt
# .env dosyası kök dizinde olmalı
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Migration'lar

```bash
# Yeni migration oluştur
docker compose exec backend alembic revision --autogenerate -m "açıklama"

# Uygula
docker compose exec backend alembic upgrade head
```
