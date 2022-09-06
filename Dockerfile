FROM node:18-alpine AS build
LABEL maintainer="will.price94@gmail.com"
LABEL version="0.0.1"
RUN apk --no-cache add --virtual .builds-deps build-base python3
# Prevent npm from spamming
ENV NPM_CONFIG_LOGLEVEL=warn NODE_ENV=production
RUN npm config set progress=false
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine
ENV NPM_CONFIG_LOGLEVEL=warn NODE_ENV=production
WORKDIR /app
COPY --from=build node_modules node_modules
COPY . .
RUN npm install
RUN REACT_APP_SERVER_CONFIG='{"socketserver": true}' npm run build
VOLUME /app/db
EXPOSE 3000
ENV VIMFLOWY_PASSWORD=
ENTRYPOINT npm run startprod -- \
    --host 0.0.0.0 \
    --port 3000 \
    --staticDir /app/build \
    --db sqlite \
    --dbfolder /app/db \
    --password $VIMFLOWY_PASSWORD
