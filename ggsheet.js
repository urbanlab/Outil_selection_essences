const {google} = require('googleapis')
const keys = require('./keys.json')
 
// Basé sur https://www.youtube.com/watch?v=MiPpQzW_ya0&ab_channel=LearnGoogleSpreadsheets
const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
)

client.authorize(function(err, token){
    if(err){
        console.log(err)
        return 
    }
    else{
        console.log("connecté")
        gsrun(client)
    }
})

async function gsrun(cl){
    const gsapi = google.sheets({
        version: 'v4',
        auth: cl
    })

    const opt ={
        spreadsheetId: '1ya91BlEzHoI6FegU0FJtEFzFBEWzQEkKc74HARh2zmk',
        range:`'Tableau des essences'!A6`
    }

    gsapi.spreadsheets.values.get(opt, (err, result)=>{
        console.log(result.data.values)
    })
}