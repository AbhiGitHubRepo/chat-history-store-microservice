FROM node:20.19.0-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev --no-audit --no-fund --ignore-scripts

COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:20.19.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY .env ./.env
EXPOSE 4000
CMD ["node", "dist/main.js"]
