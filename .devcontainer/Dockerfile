FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-16

# Update package cache
RUN apt-get update

# Needed for some reason? See: https://code.visualstudio.com/docs/remote/create-dev-container
ENV DEBIAN_FRONTEND noninteractive

# Fix permission issues with NPM globals
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# Tell puppeteer to not download chromium, since it's being installed below
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install all the things needed for puppeteer
RUN apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*