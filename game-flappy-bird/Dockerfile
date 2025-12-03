# -- Build stage --
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
#generate dist/ 
RUN npm run build 

# -- Production stage --
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3006
CMD ["nginx", "-g", "daemon off;"]