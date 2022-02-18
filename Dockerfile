FROM node:17-alpine3.14

# Get code
RUN apk update
RUN apk add git
RUN git clone https://github.com/urbanlab/Outil_selection_essences.git /app
RUN cd /app && npm install

# Add secret files
COPY keys.json /app/keys.json
COPY image-updater-keys.json /app/image-updater-keys.json

# Launch app
EXPOSE 4080
WORKDIR /app
CMD ["node", "index.js"]

