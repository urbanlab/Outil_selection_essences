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

//========================== Filtres ==============================
app.get('/filtres', (req, res)=>{
    const p = gsheet.getData(gsheet.client, `'Paramétrages critères'!A:Q`);
    p.then((value)=>{
        console.log(value);
        liste_criteres=[];
        for (let i = 1; i < value[0].length; i++) {
            if (value[2][i] == 'TRUE'){
                var json = {
                    nom: value[0][i],
                    importance: value[1][i],
                    type_question: value[3][i]
                }
                var c=4;
                reponses=[];
                while (value[c] && value[c][i]!='') {
                    morceaux = value[c][i].split(':');
                    json_reponse = {
                        valeur: morceaux[0],
                        texte: morceaux[1]
                    }
                    reponses.push(json_reponse);
                    c++;
                }
                json['reponses']=reponses;
                liste_criteres.push(json);
            }
        }
        res.send(JSON.stringify(liste_criteres));
    })
    .catch((err)=>{
        console.log(err);
    })
});
//========================== Filtres ==============================

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
