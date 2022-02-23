const fs = require('fs')
const utils = require('./utils.js')

fs.readdir('./assets/images', (err, files)=>{
    files=files.sort()
    console.log(files)
    const compfunc = (a,b)=>{
        if(a==b.split('.')[0]) return 0
        else if(a<b.split('.')[0]) return -1
        else if(a>b.split('.')[0]) return 1
    }

    const id_index = utils.binSearch(files, "1-IzYRUy1osTVDjDtoF6YS_ctXDbWJ-SR", compfunc)
    console.log(id_index)
})

