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

# Copy and set entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3005
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
CMD ["node", "server.js"]
