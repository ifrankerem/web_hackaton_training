FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

# Use dev server for local development
CMD ["pnpm", "dev"]
