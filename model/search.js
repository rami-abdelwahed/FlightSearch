
var util = require('util');

function SearchResultItem(apiSearchResult) {
    this.airline = apiSearchResult.airline.name;
    this.flightNum = apiSearchResult.flightNum;
    this.from = util.format('%s(%s) on [%s]', apiSearchResult.start.airportName,
        apiSearchResult.start.cityName,
        apiSearchResult.start.dateTime
    );
    this.to = util.format('%s(%s) on [%s]', apiSearchResult.finish.airportName,
        apiSearchResult.finish.cityName,
        apiSearchResult.finish.dateTime
    );
    this.duration = (parseFloat(apiSearchResult.durationMin) / 60).toFixed(2);
    this.price = parseFloat(apiSearchResult.price);
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

module.exports = {
    SearchResultItem,
    sortByPrice
};