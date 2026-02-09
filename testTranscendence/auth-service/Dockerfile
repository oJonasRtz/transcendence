# auth-service dockerfile
FROM debian:trixie
WORKDIR /app
COPY package*.json ./
RUN apt-get update -y && apt-get upgrade -y && apt-get install nodejs npm net-tools curl iputils-ping -y
#install mkcert
# RUN curl -L -o /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64 && \
#     chmod +x /usr/local/bin/mkcert
RUN npm install
COPY . .
#generate ssl certificates
# RUN cd ssl/ && bash ./mkcert.sh
EXPOSE 3001
CMD [ "node", "server.js" ]
