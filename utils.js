const fs = require('fs')

/* ----- columnToLetter -----
  Converti un indice de colonne en la chaine de caractère représentant la colonne sous excel (28 -> AB)
  - column : entier indice de la colonne
*/
function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

/* ----- letter to column -----
  Converti un nom de colonne excel en l'entier correspondant (AB -> 28)
  - val : str nom de la colonne
*/
function letterToColumn(val){
    var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;
  
    for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1)
    } 
    return result
}

/* ----- binSearch -----
  Recherche dichotomique dans une liste triée
  - arr : liste d'entrée triée
  - e : élément à rechercher
  - comp : fonction de comparaison entre a=e et b: un élément de la liste qui renvoie 0 si a=b, -1 si a<b et 1 si a>b
*/
function binSearch(arr, e, comp=(a,b)=>{
  if(a==b) return 0
  else if(a<b) return -1
  else return 1
}){
  if(arr.length==0){
    return -1
  }
  let end = arr.length -1
  let start = 0
  if(comp(e, arr[start])==0){
    return start
  }
  else if(comp(e, arr[end])==0){
    return end
  }
  else{
    while ((start != end) && (start != end-1)){
      let m = Math.floor((end+start)/2)
      if(comp(e, arr[m])==0){
        return m
      }
      else if(comp(e, arr[m])==-1){
        end = m
      }
      else {
        start = m
      }
    }
    return -1
  }
}

/* ----- deleteFiles -----
  Supprime les fichiers contenus dans la liste files 
*/
function deleteFiles(files, callback){
  let i = files.length;
  if(files.length==0){
    callback(null)
  }
  else{
    files.forEach(function(filepath){
      fs.unlink(filepath, function(err) {
        i--;
        if (err) {
          callback(err);
          return;
        } else if (i <= 0) {
          callback(null);
        }
      });
    });
  }
}

module.exports ={
    columnToLetter: columnToLetter,
    letterToColumn: letterToColumn,
    deleteFiles: deleteFiles,
    binSearch: binSearch
}
