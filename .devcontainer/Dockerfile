FROM mcr.microsoft.com/devcontainers/typescript-node:22

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install --no-install-recommends -y -q \
    chromium \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    # graphicsmagick \
    # chromium \
    # fonts-ipafont-gothic \
    # fonts-wqy-zenhei \
    # fonts-thai-tlwg \
    # fonts-kacst \
    # fonts-freefont-ttf \
    # libxss1 \
    && apt-get autoremove \
    && apt-get clean \
    && rm -rf /var/lib/{apt,dpkg,cache,log}/

USER node

RUN curl -fsSL https://bun.com/install | bash