FROM node:22-alpine

WORKDIR /app

# Sadece paket listelerini kopyalayıp Docker içinde önbelleğe (cache) alıyoruz
COPY package.json package-lock.json* ./

# Paketleri kuruyoruz (efter package-lock yoksa bile hata vermemesi için * koyduk)
RUN npm install

# Kalan tüm dosyaları içeri aktarıyoruz
COPY . .

# Vite'ın dışarıya yayın yapmasını sağlıyoruz
EXPOSE 5173

# Projeyi canlı yenileme (hot-reload) moduyla başlatıyoruz
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]