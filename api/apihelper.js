const http = require('http');
const bodyParser = require('body-parser');
const util = require('util');
const path = require('path');
const moment = require('moment');
const model = require('../model/search');


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

var searchHandler = function (req, res) {
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
                        model.sortByPrice(searchResult);
                        res.send(JSON.stringify(searchResult));
                    }
                });
            });
        });
    });
}

    module.exports = {
        apiHandler,
        searchHandler

    }



