const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const gsheet = require("./gsheet.js")
const utils = require("./utils");
//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------- Paramétrages de base -------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/templates/homepage.html');
});

app.get('/styles/style.css', (req, res) => {
    res.status(200).sendFile(__dirname + '/styles/style.css');
});

//==================== /data/arbres ==================
app.get('/data/arbres', (req, res)=>{
    gsheet.getData(gsheet.client, `'Tableau des essences'!A4:4`)
    .then((colnames)=>{
        ncols = colnames[0].length
        lastColumn = utils.columnToLetter(ncols)
        gsheet.getData(gsheet.client, `'Tableau des essences'!A6:${lastColumn}358`)
        .then((values)=>{
            let response = []
            for (let i = 0; i < values.length; i++) {
                let val = {}
                for(let j=0; j<ncols-1; j++){
                    val[colnames[0][j]]=values[i][j]
                }
                response.push(val)
            }
            res.send(response)
        })
        .catch((err)=>{
            console.log(err)
        })
    })
    .catch((err)=>{
        console.log(err)
    })
})

//==================== /data/columns ==================
app.get('/data/columns', (req, res)=>{
    gsheet.getData(gsheet.client, `'Tableau des essences'!A4:4`)
    .then((colnames)=>{
        colnames[0].pop()
        res.send(colnames[0])
    })
    .catch((err)=>{
        console.log(err)
    })
})
// ===================================================
module.exports = app;
