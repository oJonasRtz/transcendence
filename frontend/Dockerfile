FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

# Copy package files and any files needed for install scripts
COPY package.json pnpm-lock.yaml ./

# Make installs more resilient to transient registry/network issues
RUN pnpm config set fetch-retries 5 \
  && pnpm config set fetch-retry-mintimeout 20000 \
  && pnpm config set fetch-retry-maxtimeout 120000 \
  && pnpm config set network-timeout 300000

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Copy and set entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Build the Next.js application
RUN pnpm exec next build

EXPOSE 3000

# Use entrypoint to load secrets
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
# Run Next.js on 3000 so nginx can proxy to the frontend container
CMD ["pnpm", "exec", "next", "start", "-p", "3000"]
