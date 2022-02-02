const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const gsheet = require("./gsheet.js")
const utils = require("./utils");
const config = require('./config.json')
const fs = require('fs')
const path=require('path')
//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------- Paramétrages de base -------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------

app.use(bodyParser.json({
    extended: true
}));

app.use("/assets", express.static(path.join(__dirname, "/assets")));

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/templates/homepage.html');
});

app.get('/styles/style.css', (req, res) => {
    res.status(200).sendFile(__dirname + '/styles/style.css');
});

app.post('/update_filtres', (req, res) => {
  res.status(200).send('Success');
});

// ========================== Filtres =============================
app.get('/data/filtres', (req, res)=>{
    fs.readFile('./data/filtres.json', (err, value)=>{
        if(err){
            res.status(500).send("Erreur lecture des données filtres")
        }
        json = JSON.parse(value)
        res.send(json)
    })
});
// ===================================================

// ==================== /data/arbres =================
app.get('/data/arbres', (req, res)=>{
    const param_id = req.query.id;
    const param_page = req.query.page;
    gsheet.getData(gsheet.client, `'${config.data_spreadsheet}'!${config.data_row_offset}${config.data_column_names_row}:${config.data_column_names_row}`)
    .then((colnames)=>{
        ncols = colnames[0].length+utils.letterToColumn(config.data_column_offset)
        lastColumn = utils.columnToLetter(ncols)
        gsheet.getData(gsheet.client, `'${config.data_spreadsheet}'!${config.data_column_offset}${config.data_start_row}:${lastColumn}`)
        .then((values)=>{
            let response = []
            if (param_page) {
                const page = parseInt(param_page);
                for (let i = (page-1)*10; i < Math.min(page*10, values.length); i++) {
                    let val = {}
                    for(let j=0; j<ncols-1; j++){
                        val[colnames[0][j].trim()]=values[i][j].trim()
                    }
                    response.push(val);
                }
            } else {
                for (let i = 0; i < values.length; i++) {
                    if (!param_id || (param_id && param_id == `${values[i][1].trim()} ${values[i][2].trim()}`)) {
                        let val = {}
                        for(let j=0; j<ncols-1; j++){
                            val[colnames[0][j]]=values[i][j]
                        }
                        response.push(val)
                    }
                }
            }
            res.send(response)
        })
        .catch((err)=>{
            console.log(err)
        })
    })
    .catch((err)=>{
        res.status(500).send("Erreur de connexion à ggsheet")
    })
})
// =====================================================

// ==================== /data/columns ==================
app.get('/data/colonnes', (req, res)=>{
    gsheet.getData(gsheet.client, `'${config.data_spreadsheet}'!${config.data_row_offset}${config.data_column_names_row}:${config.data_column_names_row}`)
    .then((colnames)=>{
        colnames[0].pop()
        res.send(colnames[0])
    })
    .catch((err)=>{
        res.status(500).send("Erreur récupération des colonnes")
    })
})
// ======================================================

// ==================== /data/legendes ==================
app.get('/data/legendes', (req, res)=>{
    fs.readFile('./data/legendes.json', (err, value)=>{
        if(err){
            res.status(500).send("Erreur lecture des données légende")
        }
        json = JSON.parse(value)
        res.send(json)
    })
})
// ================================================

app.get("/data/refresh", (req,res)=>{
    // ==== Données d'arbres ====
    let arbresPromise = gsheet.getData(gsheet.client, `'${config.data_spreadsheet}'!${config.data_column_offset}${config.data_column_names_row}:${config.data_column_names_row}`)
    arbresPromise.then((colnames)=>{
        ncols = colnames[0].length+utils.letterToColumn(config.data_column_offset)
        lastColumn = utils.columnToLetter(ncols)
        gsheet.getData(gsheet.client, `'${config.data_spreadsheet}'!${config.data_column_offset}${config.data_start_row}:${lastColumn}`)
        .then((values)=>{
            let response = []
            for (let i = 0; i < values.length; i++) {
                let val = {}
                for(let j=0; j<ncols-1; j++){
                    val[colnames[0][j]]=values[i][j]
                }
                response.push(val)
            }
            fs.writeFile('./data/arbres.json', JSON.stringify(response), (err)=>{
                if(err) throw err
            })
        })
    })
    .catch((err)=>{
        res.status(500).send("Erreur Sauvegarde des arbres")
    })

    // ==== Données de légende ====
    let legendesPromise = gsheet.getData(gsheet.client,`'${config.legendes_spreadsheet}'!A1:B`)
    legendesPromise.then((legendes)=>{
        let newAttr = true
        let curentAttr = ""
        result = {}
        for(let i=0; i<legendes.length; i++){
                if(newAttr){
                    curentAttr = legendes[i][0]
                    result[curentAttr]={
                        description:"",
                        values:{
                        }
                    }
                    if(legendes[i].length>=2){
                        result[curentAttr]["description"]=legendes[i][1]
                    }
                    else{
                        result[curentAttr]["description"]=null
                    }
                    newAttr=false
                }
                else if(legendes[i].length==0){
                    newAttr=true
                }
                else{
                    result[curentAttr]["values"][legendes[i][0]]=legendes[i][1]
                }

        }
        fs.writeFile('./data/legendes.json', JSON.stringify(result), (err)=>{
            if(err) throw err
        })
    })
    .catch((err)=>{
        res.status(500).send("Erreur sauvegarde des legendes")
        return
    })

    // ==== Données filres ====
    let filtresPromise = gsheet.getData(gsheet.client, `'${config.filter_spreadsheet}'!${config.filter_column_offset}${config.filter_row_offset}:${config.filter_row_offset}`)
    .then((colnames)=>{
        ncols = colnames[0].length+utils.letterToColumn(config.filter_column_offset)
        lastColumn = utils.columnToLetter(ncols)
        gsheet.getData(gsheet.client, `'${config.filter_spreadsheet}'!${config.filter_column_offset}${config.filter_row_offset}:${lastColumn}`)
        .then((value)=>{
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
                    while (value[c] && value[c][i]!='' && value[c][i]!= undefined) {
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
            fs.writeFile('./data/filtres.json', JSON.stringify(liste_criteres), (err)=>{
                if(err) throw err
            })
        })
    })
    .catch((err)=>{
        res.status(500).send('Erreur Sauvegarde des filtres')
    })

    Promise.all([arbresPromise, legendesPromise, filtresPromise])
    .then((values)=>{
        res.send("Données rafraichies")
    })
})
module.exports = app;
