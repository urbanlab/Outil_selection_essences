# TABLE OF CONTENT

- [Presentation](#presentation)
- [Deployment](#deployment)
  * [Automatic deployment notes](#automatic-deployment-notes)
  * [Manual deployment](#manual-deployment)
    + [File examples](#file-examples)
      - [keys.json](#keysjson)
      - [images-updater-keys.json](#images-updater-keysjson)

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

You can use the `Dockerfile` at project's root but
you need your own `.json` files.

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