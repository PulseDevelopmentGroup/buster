## Base Image
FROM node:lts-alpine AS base

# Set workdir and copy package.json
WORKDIR /app
COPY package.json .

# Install dependencies
RUN apk --no-cache add git

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python pkgconfig \
  pixman-dev cairo-dev pango-dev giflib-dev jpeg-dev && \
  npm install --quiet node-gyp -g &&\
  npm install --quiet && \
  apk del native-deps

# Copy source files
COPY . .
RUN npm run build

## Release Image
FROM node:lts-alpine AS release

# Set workdir and copy build output
WORKDIR /app
COPY --from=base /app/dist .

CMD ["node", "bot.js"]