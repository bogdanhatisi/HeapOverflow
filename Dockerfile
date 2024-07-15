FROM node:lts
RUN apt-get update
RUN apt-get install -y openssl postgresql-client

WORKDIR /usr/src/app

ENV PORT 3000

COPY ["package.json", "package-lock.json", "./"]
COPY .env ./.env
COPY prisma ./prisma/

RUN npm install --production --silent && mv node_modules ../

RUN npm i -g prisma

COPY . .

RUN npx prisma generate --schema ./prisma/schema.prisma

EXPOSE 3000

CMD [ "sh", "-c", "npx prisma migrate deploy && npm start" ]
