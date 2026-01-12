FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

# Copy package files and any files needed for install scripts
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema for generation
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Run Next.js on 3000 so nginx can proxy to the frontend container
CMD ["pnpm", "exec", "next", "dev", "--turbopack", "-p", "3000"]
