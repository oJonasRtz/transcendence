FROM debian:trixie
WORKDIR /app
COPY package*.json ./
#install node
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs
RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y net-tools iputils-ping libnss3-tools openssl
RUN npm install
COPY . .
EXPOSE 3004 3010
CMD ["node", "server.js"]
