const fs = require('fs')

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

function letterToColumn(val){
    var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;
  
    for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1)
    } 
    return result
}

function binSearch(arr, e, comp=(a,b)=>{
  if(a==b) return 0
  else if(a<b) return -1
  else return 1
}){
  let end = arr.length -1
  let start = 0
  if(arr[start]==e){
    return start
  }
  else if(arr[end]==e){
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

function deleteFiles(files, callback){
  var i = files.length;
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

module.exports ={
    columnToLetter: columnToLetter,
    letterToColumn: letterToColumn,
    deleteFiles: deleteFiles,
    binSearch: binSearch
}
