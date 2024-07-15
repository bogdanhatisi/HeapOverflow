FROM node:lts
RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /usr/src/app

ENV PORT 3000

COPY ["package.json", "package-lock.json", "./"]
COPY .env ./.env
COPY prisma ./prisma/

RUN npm install --production --silent && mv node_modules ../

RUN npm i -g prisma

COPY . .

RUN npx prisma generate --schema ./prisma/schema.prisma

# Build the project if you have TypeScript or Babel setup
# RUN npm run build

# If your app listens on a port, expose it to the Docker container.
EXPOSE 3000

# Run the command to start your app
CMD [ "npm", "start" ]
