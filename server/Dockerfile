# FILLER

FROM --platform=arm64 node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:prod"]
EXPOSE 3000

