FROM node:17-alpine3.14

# Get code
RUN apk update
RUN apk add git
RUN git clone --branch dev https://github.com/urbanlab/Outil_selection_essences.git /app
RUN cd /app && npm install
RUN mkdir "app/assets/images"

# Add secret files
COPY keys.json /app/keys.json
COPY image-updater-keys.json /app/image-updater-keys.json

# Launch app
EXPOSE 4070
WORKDIR /app
RUN cd /app
CMD ["node", "index.js"]
