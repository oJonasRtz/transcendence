FROM debian:trixie
WORKDIR /app
COPY package*.json ./
# Install Node.js and other dependencies
RUN apt-get update && apt-get install -y curl \
	&& curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
	&& apt-get install -y nodejs \
	&& apt-get install -y net-tools iputils-ping libnss3-tools openssl

RUN npm install
COPY . .

# Copy and set entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3004 3010
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
CMD ["node", "server.js"]
