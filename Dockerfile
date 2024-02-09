FROM node:17-alpine3.14
COPY . /app
WORKDIR /app
RUN npm install
RUN npm install -g express
CMD ["npm", "start"]
