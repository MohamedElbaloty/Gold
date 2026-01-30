# Backend API — /app has repo root; start backend directly so /app/server.js is not required
FROM node:22-alpine

WORKDIR /app

# Copy root package files (dependencies live here)
COPY package.json package-lock.json ./

# Copy backend (API) only; frontend is separate
COPY backend ./backend/

# Install production dependencies (from repo root)
RUN npm ci --omit=dev

# Start backend directly — works even when root server.js is missing
CMD ["node", "backend/server.js"]
