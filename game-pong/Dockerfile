# -- build stage --
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g javascript-obfuscator

COPY . .
#generate dist/
RUN npm run build
RUN javascript-obfuscator /app/dist \
	--output /app/dist \
	--compact true \
	--dead-code-injection true \
	--string-array true \
	--string-array-encoding base64

# -- production stage --
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3005
CMD ["nginx", "-g", "daemon off;"]

# FROM node:20

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# # Porta padrão do Vite
# EXPOSE 5173

# # Roda o Vite em modo desenvolvimento
# CMD ["npm", "run", "dev"]
