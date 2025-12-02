FROM debian:trixie
WORKDIR /app
COPY package*.json ./
#install node
RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y nodejs npm net-tools curl iputils-ping libnss3-tools openssl

RUN npm install
COPY . .

#compile ts to js
RUN npm run build
EXPOSE 3006
CMD [ "node", "dist/server.js" ]
