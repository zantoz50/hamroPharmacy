# Use official Node.js 18 image
FROM node:18-bullseye-slim

# Install tesseract for OCR
RUN apt-get update && apt-get install -y tesseract-ocr libtesseract-dev libleptonica-dev pkg-config --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/index.js"]
