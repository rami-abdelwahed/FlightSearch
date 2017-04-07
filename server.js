const express = require('express');
const bodyParser = require('body-parser');
const util = require('util');
const api = require('./api/apihelper')

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 3000;

var router = express.Router();

app.use('/', express.static(__dirname + '/public'));

router.route('/api/airlines')
    .get(function (req, res) {
        api.apiHandler(util.format('/code-task/airlines'), function (responseData) {
            res.send(responseData);
        });
    });

router.route('/api/airports')
    .get(function (req, res) {
         api.apiHandler(util.format('/code-task/airports?q=%s', req.query.param), function (responseData) {
            res.send(responseData);
        });
    });

router.route('/api/search')
    .get(api.searchHandler);

app.use('/', router);

//Error handler
app.use(errorHandler);

function errorHandler (err, req, res, next) {
  res.status(500)
}
// START THE SERVER
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

