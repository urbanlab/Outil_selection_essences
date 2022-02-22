const app = require('./app');

const host = '127.0.0.1';
const port = 80;

app.listen(port, () => {
    console.log('Started HTTP Server @ ' + host + ":" + port);
});
