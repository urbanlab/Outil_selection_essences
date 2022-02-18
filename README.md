# TABLE OF CONTENT

- [Presentation](#presentation)
- [Deployment](#deployment)
  * [Automatic deployment notes](#automatic-deployment-notes)
  * [Manual deployment](#manual-deployment)
    + [File examples](#file-examples)
      - [keys.json](#keysjson)
      - [images-updater-keys.json](#images-updater-keysjson)
- [Publication()]

## Presentation

todo

## Deployment

### Automatic deployment notes

Can't make automatic deployments now (i.e. from
`github` to `hub.docker`)
I'll get back to it asap.

### Manual deployment

Technically, you only need 3 files :
- `Dockerfile`
- `keys.json`
- `image-updater-keys.json`

#### Dockerfile

Here is an example of a quick and dirty (and working)
Dockerfile for you to use. Remember that you have to
place the `Dockerfile`, the two `.json` files and the
source code in the same folder.

```dockerfile
FROM node:17-alpine3.14

WORKDIR /app

COPY . /app
RUN npm install
EXPOSE 80
CMD ["node", "index.js"]
```

#### File examples

##### keys.json

Note for ERASME team, check bitwarden for this
complete file.

```json
{
    "type": "service_account",
    "project_id": "outil-selection-essence",
    "private_key_id": "",
    "private_key": "",
    "client_email": "",
    "client_id": "",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": ""
}
```

##### images-updater-keys.json

Note for ERASME team, check bitwarden for this 
complete file.

```json
{
  "type": "service_account",
  "project_id": "outil-selection-essence",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": ""
}
```

## Publication

If we want to publish this on `hub.docker`, we can either
use github actions or do it manually.

Github actions still need to be made so, we'll cover
the manual way.

```shell
# Log to docker account
docker login -u erasme -p PASSWORD

# Build your image
docker build . --no-cache -t erasme/essences

# Run and test it
docker run --name essences -p 80:80 erasme/essences

# Tag it
docker tag erasme/essences erasme/essences:latest

# Push it to hub.docker
docker push erasme/essences

# You can test if it works by pulling directly from hub.docker
# But first clear the cached data !
docker image rm erasme/essences:latest
# And pull it directly from hub.docker
docker run --name essences -p 80:80 erasme/essences
```