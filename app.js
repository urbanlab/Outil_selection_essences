const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const gsheet = require("./gsheet.js")
const utils = require("./utils");
//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------- Paramétrages de base -------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------

app.use(bodyParser.json({
    extended: true
}));

app.get('/assets/arbre_template.png', (req, res) => {
  res.status(200).sendFile(__dirname + '/assets/arbre_template.png');
});

app.get('/assets/logo_erasme_grandlyon.png', (req, res) => {
  res.status(200).sendFile(__dirname + '/assets/logo_erasme_grandlyon.png');
});

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/templates/homepage.html');
});

app.get('/styles/style.css', (req, res) => {
    res.status(200).sendFile(__dirname + '/styles/style.css');
});

// ========================== Filtres =============================
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
// ===================================================

app.post('/update_filtres', (req, res) => {
  console.log(req.body);
  res.status(200).send('Success');
});

// ==================== /data/arbres =================
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
// =====================================================

// ==================== /data/columns ==================
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
