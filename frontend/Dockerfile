FROM node:24.20.0-alpine3.24 AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM node:24.20.0-alpine3.24 AS builder

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24.20.0-alpine3.24 AS production-dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev

FROM node:24.20.0-alpine3.24 AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY package.json package-lock.json next.config.js ./

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000').then((response)=>{if(!response.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["npm", "run", "start"]
