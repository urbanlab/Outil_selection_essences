const {google} = require('googleapis')
const keys = require('./image-updater-keys.json')
const fs = require('fs')
const config = require('./config.json')
const mime = require('./mime_type.json')
const utils = require('./utils')
const async = require('async')

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/spreadsheets"]
)

function getImages(cl, pageToken){
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
    const promise = new Promise((resolve, reject) => {
        gdapi.files.list(opt,(err, result)=>{
            if(err){
                reject(err)
            }
            let images = []
            let descriptions = {}
            for(let i=0; i<result.data.files.length; i++){
                if(result.data.files[i].parents && result.data.files[i].parents[0]==config.image_folder_id){
                    images.push(result.data.files[i])
                    descriptions[result.data.files[i].id]=result.data.files[i].description
                }
            }
            for(let i=0; i<images.length; i++){
                images[i].name = images[i].name.split(".")[0]
            }
            fs.writeFile('./data/attributions.json', JSON.stringify(descriptions), (err)=>{
                if(err){reject(err)}
                resolve([images, result.data.nextPageToken])
            })
        })
    })
    return promise
}

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
                throw err
            }
            resolve(result.data.values)
        })
    })
    return promise
}

function main(pageToken, callback){
    return new Promise((resolve, reject)=>{
        getImages(client, pageToken)
        .then((value)=>{
            images = value[0]
            pageToken = value[1]
            getData(client, `'${config.data_spreadsheet}'!${config.data_row_offset}${config.data_column_names_row}:${config.data_column_names_row}`)
            .then((columns)=>{
                const imageColumnIndex = columns[0].indexOf(config.image_column_name)
                const genreColumnIndex = columns[0].indexOf(config.genre_column_name)
                const especeColumnIndex = columns[0].indexOf(config.espece_column_name)

                if(imageColumnIndex==-1){
                    throw "Colonne Image non trouvée, vérifier la configuration"
                }
                const lastColumn = utils.columnToLetter(columns[0].length)
                getData(client, `${config.data_spreadsheet}!${config.data_column_offset}${config.data_start_row}:${lastColumn}`)
                .then((data)=>{
                    const compfunc = (a,b)=>{
                        if(a.name==b.name) return 0
                        else if(a.name<b.name) return -1
                        else if(a.name>b.name) return 1
                    }
                    images = images.sort(compfunc)
                    for(let i=0; i<data.length; i++){
                        let name = `${data[i][genreColumnIndex].trim()}_${data[i][especeColumnIndex].trim()}`
                        treeIndex = utils.binSearch(images, {name:name}, compfunc)
                        if(treeIndex!=-1){
                            data[i][imageColumnIndex] = images[treeIndex]["id"]
                        }
                    }
                    imageIndexes = []
                    for(let i=0; i<data.length; i++){
                        imageIndexes.push([data[i][imageColumnIndex]])
                    }
                    updateImages(client, imageIndexes, `${utils.columnToLetter(imageColumnIndex+1)}${config.data_start_row}:${utils.columnToLetter(imageColumnIndex+1)}`)
                    .then((res)=>{
                        if(pageToken){
                            main(pageToken, callback)
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

function refreshPictures(callback){
    client.authorize(function(err, token){
        if(err){
            console.log(err)
        }
        else{
            main(null, callback)
        }
    })
}

function main_images(cl, fileId){
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
                let dest = fs.createWriteStream(`./assets/images/${fileId}.${mime[mimeType]}`)
                let progress = 0
                res.data
                .on('error', err => {
                console.error(`Erreur téléchargement image ${fileId}`);
                })
                .on('end', ()=>{
                    console.log(`Téléchargée sous ./assets/images/${fileId}.${mime[mimeType]}`)
                    resolve()
                })
                .pipe(dest);
            }
        })
    })
}

function download_images(fileId){
    return new Promise((resolve, reject)=>{
        client.authorize(function(err, token){
            main_images(client, fileId)
            .then(()=>{
                resolve()
            })
        })
    })
}

// download_images('1znBl6OwFq0MJpyUNkZ69txqnbNz3jbh2')
module.exports = {
    refreshPictures: refreshPictures,
    downloadImages: download_images
}
