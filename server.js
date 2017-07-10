var express = require('express');
var app = express();

app.get('/', function (request,response) {
  response.send("Hello Express");
});


app.listen(process.env.PORT || 5000)
