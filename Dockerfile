# Single app: backend + built frontend (Railway serves both from one URL)
FROM node:22-alpine

WORKDIR /app

# Root + backend
COPY package.json package-lock.json ./
COPY backend ./backend/
RUN npm ci --omit=dev

# Frontend: build React so backend can serve it in production
COPY frontend ./frontend/
RUN cd frontend && npm ci && CI=true npm run build

# Start backend (serves API + static frontend from /app/frontend/build)
CMD ["node", "backend/server.js"]
