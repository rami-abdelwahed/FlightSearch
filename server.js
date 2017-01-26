var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var path = require('path');
var moment = require('moment');
var model = require('./model/search')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

// ROUTES FOR OUR API
var router = express.Router();

router.get('/', function (req, res) {
    res.sendfile(path.join(__dirname + '/public/index.html'));
});
app.use('/', express.static(__dirname + '/public'));

// more routes for our API will happen here
router.route('/api/airlines')
    .get(function (req, res) {
        apiHandler(util.format('/code-task/airlines'), function (responseData) {
            res.send(responseData);
        });
    });

router.route('/api/airports')
    .get(function (req, res) {
        apiHandler(util.format('/code-task/airports?q=%s', req.query.param), function (responseData) {
            res.send(responseData);
        });
    });

router.route('/api/search')
    .get(function (req, res) {
        var callCount = 0;
        var searchResult = {};
        var searchDate = moment(req.query.date);
        var now = moment().startOf('day');
        var i = 2;
        var searchDates = [];
        while (i > 0) {
            var dateBefore = searchDate.clone().subtract(i, 'day');
            if (!dateBefore.isBefore(now)) {
                searchDates.push(dateBefore);
            }
            --i;
        }
        apiHandler(util.format('/code-task/airlines'), function (responseData) {
            var airlines = JSON.parse(responseData);
            searchDates.push(searchDate, searchDate.clone().add(1, 'day'), searchDate.clone().add(2, 'day'));
            searchDates.forEach(function (date) {
                airlines.forEach(function (airline) {
                    var apiUrl = util.format('/code-task/flight_search/%s?date=%s&from=%s&to=%s',
                        airline.code, date.format('YYYY-MM-DD'), req.query.from, req.query.to);
                    apiHandler(apiUrl, function (responseData) {
                        var arr = JSON.parse(responseData);
                        arr.forEach(function (item) {
                            var searchResultItem = new model.SearchResultItem(item);
                            if (!searchResult[date.format('YYYY-MM-DD')]) {
                                searchResult[date.format('YYYY-MM-DD')] = [];
                            }
                            searchResult[date.format('YYYY-MM-DD')].push(searchResultItem);
                        });
                        if (++callCount === searchDates.length * airlines.length) {
                            sortByPrice(searchResult);
                            res.send(JSON.stringify(searchResult));
                        }
                    });
                });
            });
        });
    });

// REGISTER OUR ROUTES -------------------------------
app.use('/', router);

var apiHandler = function (apiUrl, onResult) {
    var options = {
        host: 'node.locomote.com',
        port: 80,
        path: apiUrl,
        method: 'GET'
    };

    http.request(options, function (res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            onResult(data);
        });
    }).end();
}

var sortByPrice = function (searchResult) {
    var keys = Object.keys(searchResult);
    for(var i = 0; i < keys.length; i++) {
        searchResult[keys[i]].sort(function(a, b) {
            return a.price - b.price;
        });
    }
    return searchResult;
}
//Error handler
app.use(errorHandler);

function errorHandler (err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}
// START THE SERVER
app.listen(port);
console.log('Server listening on port ' + port);
