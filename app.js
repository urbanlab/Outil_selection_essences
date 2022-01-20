const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const gsheet = require("./gsheet.js")
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
module.exports = app;
