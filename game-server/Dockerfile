FROM debian:trixie
WORKDIR /app
COPY package*.json ./
#install node
RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y nodejs npm net-tools curl iputils-ping libnss3-tools openssl

#install mkcert
RUN curl -L -o /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64 && \
    chmod +x /usr/local/bin/mkcert

RUN npm install
COPY . .
#generate ssl certificates
RUN cd ssl/ && bash ./mkcert.sh
EXPOSE 8443
CMD [ "node", "server.js" ]
