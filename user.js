const express = require('express')
const os = require('os');
const hostname = os.hostname();
const path = require('path');
// require('./DBconnection/Connection')
const app = express()
// const router = require('./Routes/index')
app.use(express.urlencoded({extended: false}))
const port = 9001;
app.use(express.static(__dirname + '/testbuild/'))
app.use(express.static(path.join(__dirname,'testbuild', 'build')));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname,'testbuild', 'build', 'index.html'));
});
// app.use(router)
var bodyParser = require('body-parser'); 
app.use(bodyParser.json());
app.use(express.json());
console.log('Current working directory:', process.cwd());
console.log('Directory of the current script:', __dirname);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

});
