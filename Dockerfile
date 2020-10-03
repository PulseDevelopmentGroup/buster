FROM node:lts-alpine

RUN apk add --no-cache git

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "start" ]