const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const gsheet = require("./gsheet.js")
const utils = require("./utils")
//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------- Paramétrages de base -------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/templates/homepage.html');
});

app.get('/styles/style.css', (req, res) => {
    res.status(200).sendFile(__dirname + '/styles/style.css');
});

app.get('/test', (req, res)=>{
    const p = gsheet.getData(gsheet.client, `'Paramétrages critères'!A:Q`)
    p.then((value)=>{
        res.send(JSON.stringify(value))
    })
    .catch((err)=>{
        console.log(err)
    })
})
//==================== /data/arbres ==================
app.get('/data/arbres', (req, res)=>{
    gsheet.getData(gsheet.client, `'Tableau des essences'!A4:4`)
    .then((colnames)=>{
        ncols = colnames[0].length
        lastColumn = baseDecomposition(26, ncols)
        gsheet.getData(gsheet.client, `'Tableau des essences'!A6:4`)
        res.send("c'est bon")
    })
    .catch((err)=>{
        console.log(err)
    })
})
// ===================================================
module.exports = app;
