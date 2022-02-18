FROM node:17-alpine3.14
COPY package.json /app/package.json
RUN cd /app && npm install
WORKDIR /app
EXPOSE 80
CMD ["node", "index.js"]