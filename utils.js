
/** Décomposition d'un entier dans une base donnée
    @param {number} [base] base de la décomposition
    @param {number} [n] entier à décomposer
    @return {Array<number>} tableau d'entier de la décomposition
**/
const baseDecomposition = function(base, n){
    let dec = []
    while(n>base){
        dec.push(n%base)
        n = Math.floor(n/base)
    }
    dec.push(n)
    return dec.reverse()
}

const numberToColname = function(n){
    dec = baseDecomposition(26, n-1)
    return dec.map(x=>String.fromCharCode(65+x)).join("")
}
for(let i=25; i<100; i++){
    console.log(numberToColname(i))
}
