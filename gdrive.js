/*
    Fonctions de gestion de l'api google drive.
    L'api google drive est utilisée à deux fins : 
        - Mettre à jour la colonne image ID dans le tableau des essences à partir des images sur google drive automatiquement (refreshPictures)
        - Télécharger les images depuis google drive sur notre serveur afin de limiter les requêtes à l'api google (downloadImages)
*/
const {google} = require('googleapis')
const keys = require('./image-updater-keys.json')
const fs = require('fs')
const config = require('./config.json')
const mime = require('./mime_type.json')
const utils = require('./utils')
const async = require('async')
const { doesNotMatch } = require('assert')

// Client de connexion à l'api google, keys est le fichier image-update-keys.json
const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/spreadsheets"]
)

/* -------- getImages ----------
Permet de lister les images contenues sur drive. google Drive ne renvoie pas tous les fichiers d'un seul coup mais seulement par
"page", si toutes les images ne sont pas renvoyées, l'api renvoie un token puis il faut refaire la requête avec le nouveau token
Ce qui renvoie les images de la page suivante
/!\ Cette fonction récupère à chaque fois toutes les images possédées par le client : i.e lorsque l'on télécharge les pictogrammes,
la fonction va aussi itérer sur les images d'arbres et ne renvoyer que celles qui sont dans le dossier des pictogrammes.
Le mieux à faire serait de recréer un utilisateur n'ayant accès qu'aux pictogrammes.
- cl : client google api
- pageToken : token renvoié par l'api (au début il vaut null)
- image_folder : identifiant du dossier d'images
*/
function getImages(cl, pageToken, image_folder){
    const gdapi = google.drive({
        version: 'v3',
        auth: cl
    })
    const opt = {
        fields: 'nextPageToken, files(parents, name, id, mimeType, description)',
        corpora: 'user',
        drive: 'image',
        pageSize: 100,
        pageToken: pageToken
    }
    const listPromise = new Promise((resolve, reject) => {
        gdapi.files.list(opt,(err, result)=>{
            if(err){
                reject(err)
            }
            let images = []
            for(let i=0; i<result.data.files.length; i++){
                if(result.data.files[i].parents && result.data.files[i].parents[0]==image_folder){
                    images.push(result.data.files[i])
                }
            }
            for(let i=0; i<images.length; i++){
                images[i].name = images[i].name.split(".")[0]
            }
            resolve([images, result.data.nextPageToken])
        })
    })
    return listPromise
}

/* ----- updateImages -----
Met à jour la colonne image Id sur le tableau des essences
- cl : client google api effectuant la requête
- values : tableau des id ([[id1], [id2], ...])
*/
function updateImages(cl, values, rangeId){
    const promise = new Promise((resolve, reject)=>{
        const gsapi = google.sheets({
            version: 'v4',
            auth: cl
        })
        const resource = {
            values,
        }

        const range = `${config.data_spreadsheet}!${rangeId}`
        const opt ={
            spreadsheetId: config.gsheet_id,
            valueInputOption: 'RAW',
            range:range,
            resource: resource
        }

        gsapi.spreadsheets.values.update(opt, (err, res)=>{
            if(err){
                reject(err)
            }
            resolve(res)
        })
    })
    return promise
}

/*----- getData -----
récupère les données d'une feuille google sheet
cl : client google api
range : séléction des colonnes sur le tableau (format A1:B8)
*/
function getData(cl, range){
    const gsapi = google.sheets({
        version: 'v4',
        auth: cl
    })

    const opt ={
        spreadsheetId: config.gsheet_id,
        range:range
    }

    const promise = new Promise((resolve, reject) => {
        gsapi.spreadsheets.values.get(opt, (err, result)=>{
            if(err){
                console.log(err)
            }
            resolve(result.data.values)
        })
    })
    return promise
}

/*----- main_refresh -----
    fonction récursive tant que le pageToken n'est pas null permettant ainsi de récupérer les images de toutes les pages et 
    de faire coincider avec les colonnes du tableau des essences
    Algo : 
    - token <- null
    - do : 
        - on récupère les données des images avec le token puis on met à jour le token
        - on réupère les données du tableau des essences (on commence par récupérer juste les noms des colonnes puis tout le tableau)
        - on fait matcher les noms des images avec les colonnes espèces et nom de l'essence (tri + recherche dichotomique) pour pouvoir
        associer l'id d'image à la bonne colonne
        - on met à jour le tableau des essences avec les id images trouvés
    - while token != null
*/
function main_refresh(pageToken, callback){
    return new Promise((resolve, reject)=>{
        getImages(client, pageToken, config.image_folder_id)
        .then((value)=>{
            images = value[0]
            pageToken = value[1]
            getData(client, `'${config.data_spreadsheet}'!${config.data_row_offset}${config.data_column_names_row}:${config.data_column_names_row}`)
            .then((columns)=>{
                const imageColumnIndex = columns[0].indexOf(config.image_column_name)
                const genreColumnIndex = columns[0].indexOf(config.genre_column_name)
                const especeColumnIndex = columns[0].indexOf(config.espece_column_name)

                if(imageColumnIndex==-1){
                    console.log("Colonne Image non trouvée, vérifier la configuration")
                }
                const lastColumn = utils.columnToLetter(columns[0].length)
                getData(client, `${config.data_spreadsheet}!${config.data_column_offset}${config.data_start_row}:${lastColumn}`)
                .then((data)=>{
                    const compfunc = (image,treeColumn)=>{
                        if(image.name==treeColumn.name) return 0
                        else if(image.name<treeColumn.name) return -1
                        else if(image.name>treeColumn.name) return 1
                    }
                    images = images.sort(compfunc)
                    let descr = []
                    for(let i=0; i<data.length; i++){
                        let name = `${data[i][genreColumnIndex].trim()}_${data[i][especeColumnIndex].trim()}`
                        treeIndex = utils.binSearch(images, {name:name}, compfunc)
                        if(treeIndex!=-1){
                            data[i][imageColumnIndex] = images[treeIndex]["id"]
                            descr[i]= images[treeIndex]["description"]
                        }
                    }
                    imageIndexes = []
                    for(let i=0; i<data.length; i++){
                        imageIndexes.push([data[i][imageColumnIndex]])
                    }
                    updateImages(client, imageIndexes, `${utils.columnToLetter(imageColumnIndex+1)}${config.data_start_row}:${utils.columnToLetter(imageColumnIndex+1)}`)
                    .then((res)=>{
                        let attr = JSON.parse(fs.readFileSync('./data/attributions.json'))
                        for(let i=0; i<data.length; i++){
                            if(descr[i]!== undefined) attr[data[i][imageColumnIndex]] = descr[i]
                        }
                        fs.writeFileSync('./data/attributions.json', JSON.stringify(attr))
                        if(pageToken){
                            main_refresh(pageToken, callback)
                        }
                        else{
                            console.log("Mise à jour du fichier google sheet terminée")
                            resolve()
                        }
                    })
                })
                .catch((err)=>{
                    console.log(err)
                })
            })
            .catch((err)=>{
                console.log(err)
            })
        })
    })
    .then((res)=>{
        callback()
    })
}

// ----- refreshPictures -----
// Lance la fonction main_refresh avec le clien
function refreshPictures(callback){
    client.authorize(function(err, token){
        if(err){
            console.log(err)
        }
        else{
            fs.writeFileSync('./data/attributions.json', '{}')
            main_refresh(null, callback)
        }
    })
}

/* ----- main_images -----
    Permet de télécharger une image à partir du fileId
*/
function main_images(cl, fileId, path, name){
    const gdapi = google.drive({
        version: 'v3',
        auth: cl
    })
    return new Promise(resolve=>{
        gdapi.files.get({
            fileId: fileId,
            alt: 'media'
        },
        {responseType: 'stream'})
        .then(res=>{
            const mimeType = res.headers['content-type']
            if(mime[mimeType]){
                let dest = fs.createWriteStream(`${path}/${name}.${mime[mimeType]}`)
                let progress = 0
                res.data
                .on('error', err => {
                    console.error(`Erreur téléchargement image ${name}`);
                })
                .on('end', ()=>{
                    resolve()
                    console.log(`Téléchargée sous ${path}/${name}.${mime[mimeType]}`)
                })
                .pipe(dest);
            }
        })
    })
}

// ----- download_images -----
// Lance le téléchargement d'une image 
function download_images(fileId, path, saveName){
    return new Promise((resolve, reject)=>{
        client.authorize(function(err, token){
            main_images(client, fileId, path, saveName)
            .then(()=>{
                resolve()
            })
        })
    })
}

// ----- main_picto -----
// Permet de synchroniser les pictogrammes en local avec ceux sur le drive
function main_picto(cl, pageToken, existingPicto, callback){
    return new Promise((resolve, reject)=>{
        getImages(cl, pageToken, config.picto_folder_id)
        .then((value)=>{
            const images = value[0]
            const pageToken = value[1]
            let downloadPromise = new Promise((resolve, reject)=>{
                resolve()
            })
            const compfunc = (a,b)=>{
                if(a==b.split('.')[0]) return 0
                else if(a<b.split('.')[0]) return -1
                else if(a>b.split('.')[0]) return 1
            }
            for(let i=0; i< images.length; i++){
                const pictoIndex = utils.binSearch(existingPicto, images[i]["name"], compfunc)
                if(pictoIndex==-1){
                    downloadPromise = downloadPromise.then(()=>{
                        return download_images(images[i]["id"], "./assets/picto", images[i]["name"])
                    })
                }   
                else{
                    existingPicto.splice(pictoIndex, 1)
                }
            }
            downloadPromise = downloadPromise.then(()=>{
                return pageToken
            })
            return downloadPromise
        })
        .then((pageToken)=>{
            if(pageToken){
                main_picto(cl, pageToken, existingPicto, callback)
            }
            else{
                resolve()
            }
        })
    })
    .then(()=>{
        existingPicto = existingPicto.map(picto=>`./assets/picto/${picto}`)
        utils.deleteFiles(existingPicto, callback)
    })
}

// ----- download_picto -----
// Lance le téléchargement des pictogrammes en utilisant la variable client globale
function download_picto(){
    return new Promise((resolve, reject)=>{
        fs.readdir("./assets/picto", (err,files)=>{
            files = files.sort()
            main_picto(client, null, files, ()=>{
                resolve()
            })
        })
    })
}

module.exports = {
    refreshPictures: refreshPictures,
    downloadImages: download_images,
    downloadPictos: download_picto
}
