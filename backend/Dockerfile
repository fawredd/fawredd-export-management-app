FROM node:20-alpine

WORKDIR /usr/src/app

# Install OpenSSL and compatibility libs for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

# 1. Copia todo el código, incluyendo el schema.prisma
COPY . .

# 2. Genera el cliente de Prisma
# (Esto requiere que schema.prisma ya esté copiado)
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "dev"]