# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Produção
FROM nginx:stable-alpine
# Copia o build do Vite para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Expõe a porta 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]