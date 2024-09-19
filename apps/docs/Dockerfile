# Base image olarak Node.js 16 kullanın
FROM node:18

# Uygulama için çalışma dizini oluşturun
WORKDIR /usr/src/app

# package.json ve package-lock.json dosyalarını kopyalayın
COPY package*.json ./

# Bağımlılıkları kurun
RUN npm install

# Uygulamanın tüm dosyalarını kopyalayın
COPY . .

# Docusaurus uygulamasını üretim için optimize edin (build aşaması)
RUN npm run build

# Uygulamanın dinleyeceği portu açın
EXPOSE 3012

# Docusaurus uygulamasını başlatın
CMD ["npm", "run", "serve"]