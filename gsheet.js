/*
    Interraction avec l'api google sheet permettant de modifier le tableau des essences
*/

const res = require('express/lib/response')
const {google} = require('googleapis')
const keys = require('./keys.json')
const config = require('./config.json')

// Basé sur https://www.youtube.com/watch?v=MiPpQzW_ya0&ab_channel=LearnGoogleSpreadsheets
const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
)

// ----- getDataRange -----
// Lancement de la requête de récupération des données
// - range : format A1:B8 de séléction des données dans le tableau
function getDataRange(client, range) {
    const p = new Promise((resolve, reject)=>{
        client.authorize(function(err, token){
            if(err){
                console.log(err)
                return new Promise((resolve, error)=>{throw error})
            }
            else{
                const promise = gsrun(client, range)
                promise.then((value)=>{
                    resolve(value)
                })
                .catch((err)=>{
                    throw err
                })
            }
        })
    })  
    return p 
}

// ----- gsrun ----- 
// fonction de récupération des données
function gsrun(cl, range){
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

// getDataRange(client, `'Tableau des essences'!A3:3`)
// getDataRange(client, `'Notice des légendes'!A:B`)
module.exports = {
    client: client,
    getData: getDataRange
}