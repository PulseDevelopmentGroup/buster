## Base Image
FROM node:lts-alpine AS base

# Install dependencies
RUN apk --no-cache add git

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python \
  pkgconfig pixman-dev cairo-dev pango-dev giflib-dev jpeg-dev

## Build Image
FROM base AS build

# Set workdir and copy package.json
WORKDIR /app
COPY package.json .

RUN npm install --quiet node-gyp -g && npm install --quiet

# Copy source files
COPY . .
RUN npm run build

## Release Image
FROM node:lts-alpine AS release

# Set workdir and copy build output
WORKDIR /app

# Get code
COPY --from=build /app/dist .

# Get modules
COPY --from=build /app/node_modules ./node_modules

CMD ["node", "bot.js"]
