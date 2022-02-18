FROM node:17-alpine3.14

# Get code
RUN apk update
RUN apk add git
RUN git clone --branch dev https://github.com/urbanlab/Outil_selection_essences.git /app
RUN cd /app && npm install

# Add secret files
COPY keys.json /app/keys.json
COPY image-updater-keys.json /app/image-updater-keys.json

# Launch app
EXPOSE 4080
WORKDIR /app
CMD ["node", "index.js"]

#COPY package.json /app/package.json
#RUN cd /app && npm install
#WORKDIR /app
#EXPOSE 4088
#CMD ["node", "index.js"]

# git clone
# mettre en place les deux fichiers .json avec secrets
# créer un dossier /assets/images
# npm install
# node indes.js
# http://127.0.0.1:4080/secure/data/refresh?password=baptiste
# http://127.0.0.1:4080/secure/images/refresh?password=baptiste