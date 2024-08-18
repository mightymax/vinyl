FROM node:lts
WORKDIR /app
COPY app.js cache.js package.json package-lock.json /app/
COPY bin /app/bin
RUN npm install
ENTRYPOINT [ "node", "bin/www" ]