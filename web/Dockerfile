# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.10.0
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

RUN npm install -g pnpm@9.5.0

RUN pnpm install --prod false 

FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl
RUN npm install -g pnpm@9.5.0
# Copy built application

COPY --from=build /app /app
# Setup sqlite3 on a separate volume

RUN mkdir -p /data
VOLUME /data
EXPOSE 3000
CMD pnpm --prefix web serve

