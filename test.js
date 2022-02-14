// const p = new Promise((resolve, reject)=>{
//     console.log("début promesse")
//     setTimeout(resolve, 2*1000)
// })
// .then(()=>{
//     console.log("c'est bon")
//     return new Promise((resolve, reject)=>{
//         setTimeout(resolve, 1*1000)
//     })
// })
// .then(()=>{
//     console.log("c'est rebon")
// })

function returnPromise(){
    return new Promise((resolve, reject)=>{
        console.log("salut")
        setTimeout(resolve, 1*1000)
    })
}

returnPromise()
.then(()=>{
    console.log("bonjour")
})