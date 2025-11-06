# auth-service dockerfile
FROM debian:trixie
WORKDIR /app
COPY package*.json ./
RUN apt-get update -y && apt-get upgrade -y && apt-get install nodejs npm -y
RUN npm install
COPY . .
EXPOSE 3001
CMD [ "node", "server.js" ]
