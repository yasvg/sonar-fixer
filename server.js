var express = require('express');
var app = express();
var processor = require("./processor");
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

app.get('/listUsers', function(req, res) {
    fs.readFile(__dirname + "/" + "users.json", 'utf8', function(err, data) {
        console.log(data);
        res.end(data);
    });
})

app.get('/removeCommentedCode', processor.removeCommentedCode);
app.get('/addSemiColon', processor.addSemiColon);
app.get('/replaceArrObjConstr', processor.replaceArrObjConstr);
app.get('/addVarKeyword', processor.addVarKeyword);

var server = app.listen(8081, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})
