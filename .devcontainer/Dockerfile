FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-16

# Update package cache
RUN apt-get update

# Install GraphicsMagick
RUN apt-get install -y graphicsmagick

# Needed for some reason? See: https://code.visualstudio.com/docs/remote/create-dev-container
ENV DEBIAN_FRONTEND noninteractive

# Fix permission issues with NPM globals
# TODO: This may be unnecessary
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# Tell puppeteer to not download chromium, since it's being installed below
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install all the things needed for puppeteer
RUN  apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    # packages for sharp
    build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    --no-install-recommends

RUN corepack enable && corepack prepare pnpm@7.13.2 --activate 

USER node # non-root user that comes with `node` images.

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium
