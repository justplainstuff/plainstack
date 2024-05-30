# syntax = docker/dockerfile:1
# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.2.0
FROM node:${NODE_VERSION}-slim as base
LABEL fly_launch_runtime="Node.js"
# Node.js app lives here
WORKDIR /app
# Set production environment
ENV NODE_ENV="production"
# Throw-away build stage to reduce size of final image
FROM base as build
# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 sqlite3
# Install node modules
COPY --link . .
RUN npm install -g pnpm@8.9.1
RUN pnpm install    
# Final stage for app image
FROM base
RUN npm install -g pnpm@8.9.1
# Install Adminer and PHP
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y php php-sqlite3 wget ca-certificates sed
RUN mkdir -p /var/www/adminer && wget "https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1.php" -O /var/www/adminer/index.php
# Fix Adminer login
RUN sed -i 's/login($_e,$F){if($F=="")return/login($_e,$F){if($F=="password exists")return/g' /var/www/adminer/index.php
# Copy built application
COPY --from=build /app /app
# Setup sqlite3 on a separate volume
RUN mkdir -p /data
VOLUME /data
# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
EXPOSE 1234
# Start Adminer in the background and run the existing command
CMD (php -S [::]:1234 -t /var/www/adminer &) && pnpm --prefix web start

