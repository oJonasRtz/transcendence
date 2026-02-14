# auth-service dockerfile
FROM debian:trixie
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs
RUN apt-get update -y && apt-get upgrade -y && apt-get install net-tools curl iputils-ping -y
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

EXPOSE 3003
# ENTRYPOINT ["/entrypoint.sh"]
CMD [ "node", "server.js" ]
