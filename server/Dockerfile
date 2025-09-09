# Use official Node.js image
FROM node:18

WORKDIR /app

COPY code/backend-fastify/package*.json ./
RUN npm install

COPY code/backend-fastify ./

EXPOSE 3000
CMD ["npm", "run", "dev"]
# Runs Fastify backend on port 3000

