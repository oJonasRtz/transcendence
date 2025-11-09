# sqlite-db dockerfile
FROM debian:trixie
WORKDIR /app
COPY package*.json ./
RUN apt-get update -y && apt-get upgrade -y && apt-get install nodejs npm net-tools curl iputils-ping -y
RUN npm install
COPY . .
EXPOSE 3002
CMD [ "node", "server.js" ]
