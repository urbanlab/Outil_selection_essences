const app = require('./app');

const host = '0.0.0.0';
const port = 80;

app.listen(port, () => {
    console.log('Started HTTP Server @ ' + host + ":" + port);
});
