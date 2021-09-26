## Base Image
FROM node:current-alpine AS base

# Install dependencies
RUN apk --no-cache add git g++ gcc libgcc libstdc++ linux-headers make python \
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
FROM node:current-alpine AS release

# Install Graphicsmagick
RUN apk --no-cache add graphicsmagick

# Set workdir and copy build output
WORKDIR /app

# Get code
COPY --from=build /app/dist .

# Get modules
COPY --from=build /app/node_modules ./node_modules

# Set version
ARG VERSION=0.0.0
ENV VERSION ${VERSION}

CMD ["node", "index.js"]