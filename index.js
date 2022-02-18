const http = require('http');
const app = require('./app');


const host = '127.0.0.1';
const port = 4080;

app.listen(port, () => {
    console.log('Started HTTP Server @ ' + host + ":" + port);
});
