const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const gsheet = require("./gsheet.js");
const utils = require("./utils");
const config = require('./config.json');
const attributions = require('./data/attributions.json')
const fs = require('fs');
const path=require('path');
const compute_scores = require('./function1.js');
const image_updater = require('./gdrive.js');
const xss = require('xss');
const { deleteFiles } = require('./utils');

const password_update = 'baptiste';
//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------- Paramétrages de base -------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------

app.use(bodyParser.json({
    extended: true
}));
app.get("/image_attribution/:id", (req, res)=>{
    if(attributions[xss(req.params.id)]){
        res.send(attributions[xss(req.params.id)])
    }
    else{
        res.status(404).send()
    }
})
app.get("/image/:id", (req, res)=>{
    fs.readdir('./assets/images', (err, files)=>{
        filtered = files.filter(x=>{
            return x.split('.')[0]==xss(req.params.id)
        })
        if(filtered.length==0){
            res.status(404).send()
        }
        else{
            res.sendFile(path.join(__dirname,`/assets/images/${filtered[0]}`))
        }
    })
})

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

app.post('/data/arbres', (req, res) => {
    const param_page = req.query.page;
    mydata=require('./data/arbres.json');
    description=require('./data/filtres.json');
    result_tri = compute_scores(mydata,description,req.body);
    response = [];

    const page = (param_page) ? parseInt(param_page) : 1;

    for (let i = (page-1)*10; i < Math.min(page*10, result_tri.length); i++) {
        let arbre = result_tri[i]
        response.push(arbre);
    }
    var json = {nb_arbres_tries : result_tri.length,
                response: response};
    res.status(200).send(json);
});


app.get('/data/arbres', (req, res)=>{
    const param_id = req.query.id;
    const param_page = req.query.page;
    fs.readFile('./data/arbres.json', (err, value)=>{
        if(err){
            res.status(500).send("Erreur lecture des données filtres")
        }
        values = JSON.parse(value)
        let response = []
        if (param_page) {

            const page = parseInt(param_page);
            for (let i = (page-1)*10; i < Math.min(page*10, values.length); i++) {
                let val = values[i]
                response.push(val);
            }
        } else {
            for (let i = 0; i < values.length; i++) {
                if (!param_id || (param_id && param_id == `${values[i]["Genre"].trim()} ${values[i]["Espèce"].trim()}`)) {
                    response.push(values[i])
                }
            }
        }
        res.send(response)
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

app.use("/secure", (req, res, next) => {
    password = xss(req.query.password);
    if (password == password_update) {
        next();
    }
    else{
        res.status(403).send('Mot de passe incorrect. Veuillez réessayer.');
    }
})

app.get("/secure/data/refresh", (req,res)=>{
    // ==== Données d'arbres ====
    const arbresPromise = gsheet.getData(gsheet.client, `'${config.data_spreadsheet}'!${config.data_column_offset}${config.data_column_names_row}:${config.data_column_names_row}`)
    arbresPromise.then((colnames)=>{
        ncols = colnames[0].length+utils.letterToColumn(config.data_column_offset)-1
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
                console.log("Fin de mise à jour des données arbres")
            })
        })
    })
    .catch((err)=>{
        res.status(500).send("Erreur Sauvegarde des arbres")
    })

    // ==== Données légende ====
    const legendesPromise = gsheet.getData(gsheet.client,`'${config.legendes_spreadsheet}'!A1:B`)
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
            console.log("Fin de mise à jour des données légendes")
        })
    })
    .catch((err)=>{
        res.status(500).send("Erreur sauvegarde des legendes")
        return
    })

    // ==== Données filtres ====
    const filtresPromise = gsheet.getData(gsheet.client, `'${config.filter_spreadsheet}'!${config.filter_column_offset}${config.filter_row_offset}:${config.filter_row_offset}`)
    .then((colnames)=>{
        ncols = colnames[0].length+utils.letterToColumn(config.filter_column_offset)
        lastColumn = utils.columnToLetter(ncols)
        gsheet.getData(gsheet.client, `'${config.filter_spreadsheet}'!${config.filter_column_offset}${config.filter_row_offset}:${lastColumn}`)
        .then((value)=>{
            liste_criteres=[];
            for (let i = 0; i < value[0].length; i++) {
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
                console.log("Fin de mise à jour des données filtres")
            })
        })
    })
    .catch((err)=>{
        res.status(500).send('Erreur Sauvegarde des filtres')
    })

    Promise.all([arbresPromise, legendesPromise, filtresPromise])
    .then((values)=>{
        res.send("Update réussie");
    })
})

app.get('/secure/images/refresh', (req, res)=>{
    // A faire : vider le dossier des images avant
    image_updater.refreshPictures(function(){
        fs.readdir('./assets/images', (err, files)=>{
            files = files.sort()
            // files = files.map(file=>`./assets/images/${file}`)
            // utils.deleteFiles(files, ()=>{
            const arbresPromise = gsheet.getData(gsheet.client, `'${config.data_spreadsheet}'!${config.data_column_offset}${config.data_column_names_row}:${config.data_column_names_row}`)
            arbresPromise.then((colnames)=>{
                ncols = colnames[0].length+utils.letterToColumn(config.data_column_offset)-1
                lastColumn = utils.columnToLetter(ncols)
                gsheet.getData(gsheet.client, `'${config.data_spreadsheet}'!${config.data_column_offset}${config.data_start_row}:${lastColumn}`)
                .then((values)=>{
                    let response = []
                    const processData = async (cb)=>{
                        for (let i = 0; i < values.length; i++) {
                            let val = {}
                            for(let j=0; j<ncols-1; j++){
                                val[colnames[0][j]]=values[i][j]
                            }
                            response.push(val)
                            const compfunc = (a,b)=>{
                                if(a==b.split('.')[0]) return 0
                                else if(a<b.split('.')[0]) return -1
                                else if(a>b.split('.')[0]) return 1
                            }
                            const image_id = val[config.image_id_column]
                            const id_index = utils.binSearch(files, image_id, compfunc)
                            if(image_id.trim() != "" && image_id.trim() != "-" && id_index == -1){
                                console.log(`Téléchargement image ${image_id} (${i+1}/${values.length})`)
                                await image_updater.downloadImages(image_id)
                            }
                            else if (id_index > -1){
                                console.log(`Image ${image_id} existante (${i+1}/${values.length})`)
                                files.splice(id_index, 1)
                            }
                        }
                        files = files.map(file=>`./assets/images/${file}`)
                        utils.deleteFiles(files, ()=>{
                            fs.writeFile('./data/arbres.json', JSON.stringify(response), (err)=>{
                                if(err) throw err
                                cb()
                            })
                        })
                    }
                    return new Promise((resolve, reject)=>{
                        processData(resolve)
                    })
                })
                .then(()=>{
                    console.log("Fin de mise à jour des images")
                    res.send("images mises à jour")
                })
            })
            // })
        })
    })
});

app.use("/assets", express.static(path.join(__dirname, "/assets")));

app.use("/styles", express.static(path.join(__dirname, "/styles")));

app.use('/', (req, res) => {
  if(req.url == '/'){
    res.status(200).sendFile(__dirname + '/templates/homepage.html');
  }
  else{
    res.status(200).sendFile(__dirname + `/templates/${req.url}.html`);

  }
});

module.exports = app;
