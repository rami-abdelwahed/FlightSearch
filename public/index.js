$(document).ready(function () {
  $('#from, #to').autocomplete({
    source: function (request, response) {
      $.ajax({
        url: "/api/airports",
        dataType: "json",
        data: {
          param: request.term
        },
        success: function (data) {
          var items = [];
          if (data) {
            data.forEach(function (item) {
              items.push(new AutocompleteItem(item));
            });
          }
          response(items);
        },
        error: function (error) {
          alert("Communication error: " + error);
          console.log(error);
        }
      });
    },
    minLength: 2
  });
  $("#datepicker").datepicker({ dateFormat: 'yy-mm-dd', minDate: -0 });
  var tabs = $("div#tabs").tabs();
  $("div#tabs").hide();
  $("#searchForm").submit(function (event) {
    event.preventDefault();
    $("div#tabs").hide();
    $("div#tabs").find("ul").empty();
    $('div#tabs div').remove();
    $("#search").prop('disabled', true);
    $("#search").text('Searching...');
    $.ajax({
      url: "/api/search",
      dataType: "json",
      data: {
        from: $('#from').val(),
        to: $('#to').val(),
        date: $('#datepicker').val()
      },
      complete: function (data) {
        if (data) {
          var jsonData = JSON.parse(data.responseText);
          var keys = Object.keys(jsonData);

          keys.sort();
          for (var i = 0; i < keys.length; i++) {
            addTab($("div#tabs"), keys[i], keys[i], jsonData[keys[i]]);
          }
          $("#search").prop('disabled', false);
          $("#search").text('Search');
          $("div#tabs").show();
          $("div#tabs").tabs('option', 'active', 0);
        }
      },
      error: function (error) {
        alert("Communication error: " + error);
        console.log(error);
      }
    });
  });

});


function AutocompleteItem(obj) {
  this.label = obj.cityName + '(' + obj.countryName + ') - ' + obj.airportName;
  this.value = obj.airportCode;
}

function addTab(tabs, tabId, tabLabel, jsonData) {

  var ul = tabs.find("ul");
  $("<li><a href='#" + tabId + "'>" + tabLabel + "</a></li>").appendTo(ul);
  $("<div class='tab-content' id='" + tabId + "'><p>" + generateHtml(jsonData) + "</p></div>").appendTo(tabs);
  tabs.tabs("refresh");
};

function generateHtml(jsonData) {
  var htmlContent = '';
  var tablePrototype = '<table style="width:100%"><tr><th align="left">Airline</th><th align="left">Origin</th>'+
        '<th align="left">Destination</th><th align="left">Duration(hour)</th><th align="left">Price</th></tr>';
  if (jsonData) {
    jsonData.forEach(function (dataItem) {
      htmlContent += '<tr>' +
        '<td>' + dataItem.airline + '</td>' +
        '<td>' + dataItem.from + '</td>' +
        '<td>' + dataItem.to + '</td>' +
        '<td>' + dataItem.duration + '</td>' +
        '<td>' + dataItem.price + '</td>' +
        '</tr>';
    });
  }
  return tablePrototype + htmlContent + '</table>';
}

