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

function binSearch(arr, e, comp=(a,b)=>{
  if(a==b) return 0
  else if(a<b) return -1
  else return 1
}){
  let end = arr.length -1
  let start = 0
  if(comp(arr[start],e)==0){
    return start
  }
  else if(comp(arr[end],e)==0){
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
module.exports ={
    columnToLetter: columnToLetter,
    binSearch: binSearch
}
