FROM debian:trixie
WORKDIR /app
COPY package*.json ./
#install node
RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y nodejs npm net-tools curl iputils-ping libnss3-tools openssl
RUN npm install
COPY . .
EXPOSE 3004
CMD ["node", "server.js"]