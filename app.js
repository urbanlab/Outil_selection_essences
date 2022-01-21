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

//========================== Filtres ==============================
app.get('/filtres', (req, res)=>{
    const p = gsheet.getData(gsheet.client, `'Paramétrages critères'!A:Q`);
    p.then((value)=>{
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

module.exports = app;
