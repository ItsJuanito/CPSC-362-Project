// //Sample code for displaying a line graph
// var GRAPH = new Chart(document.getElementById("line-chart"), {
//   type: 'line',
//   data: {
//     labels: [1500, 1600, 1700, 1750, 1800],
//     datasets: [{
//       data: [86, 114, 106, 106, 107],
//       label: "Africa",
//       borderColor: "#3e95cd",
//       fill: false
//     }, {
//       data: [282, 350, 411, 502, 635],
//       label: "Asia",
//       borderColor: "#8e5ea2",
//       fill: false
//     }, {
//       data: [168, 170, 178, 190, 203],
//       label: "Europe",
//       borderColor: "#3cba9f",
//       fill: false
//     }, {
//       data: [40, 20, 10, 16, 24],
//       label: "Latin America",
//       borderColor: "#e8c3b9",
//       fill: false
//     }, {
//       data: [6, 3, 2, 2, 7],
//       label: "North America",
//       borderColor: "#c45850",
//       fill: false
//     }
//     ]
//   },
//   options: {
//     title: {
//       display: true,
//       text: 'World population per region (in millions)'
//     }
//   }
// });

// $(document).ready(function () {
//   $('#dtDynamicVerticalScrollExample').DataTable({
//     "scrollY": "50vh",
//     "scrollCollapse": true,
//   });
//   $('.dataTables_length').addClass('bs-select');
// });


var GRAPH;
Chart.defaults.global.defaultFontSize = 16;

var USStates = [];

//Navbar on click
function navbarClick() {
  var x = document.getElementById("myLinks");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

//Function that executes when page is finished loading, displays default graph
function PageLoad() {

  LoadHighScoresTables();

  //For the vertical scroll table
  $('#dtDynamicVerticalScrollExample').DataTable({
    "scrollY": "50vh",
    "scrollCollapse": true,
  });
  $('.dataTables_length').addClass('bs-select');

  //Reset radio buttons
  ResetRadioButtons();
  DrawGraphSet1(null, null, 'US', 'US Covid Cases Weekly Average', 'Number of Cases', 'Week');

  //Get Array of US states/counties/territories that users can query
  GetStatesLists();
  Submit();
}


//This function displays the average Covid cases per week in USA
//New cases are determined by looking at changes from the previous day
function GetUSACovidCasesWeeklyAverage(datasetIndex = 0) {

  $.ajax({
    async: true,
    type: 'GET',
    url: "https://disease.sh/v3/covid-19/historical/USA?lastdays=all",
    success: function (data) {
      //console.log(data.timeline.cases);


      //callback
      var tempDates = Object.keys(data.timeline.cases);
      var tempCases = Object.values(data.timeline.cases);
      var tempDeaths = Object.values(data.timeline.deaths);

      var weeklyAverages = [];  //Array of weekly averages
      var weeklyAverageDates = []; //Array of weekly average dates, used as labels for x-axis
      var dayCounter = 0; //7 day counter
      var sevenDayTotal = 0;  //Total count for each week, resets every 7 days  
      var changePerDay = 0;

      var dateStart = $('#startDate').val();
      var dateEnd = $('#endDate').val();

      for (var i = 1; i < tempCases.length; i++) {
        if (dateCompare(dateStart, tempDates[i]) && !dateCompare(dateEnd, tempDates[i])) {

          //This if statement is used to filter outliers from the dataset (eg. +1,000,000 US covid cases a day)
          // if(tempCases[i] > 1000000){
          //   tempCases[i] = tempCases[i - 1];  //Reuse the previous day's count if it is an outlier
          // }
          changePerDay = tempCases[i] - tempCases[i - 1];
          if (dayCounter >= 7) {
            //It is the end of the 7 day week, calculate the average
            //1. Add weekly average and date to respective arrays
            //2. Reset counters
            weeklyAverages.push(Math.ceil(sevenDayTotal / 7));
            weeklyAverageDates.push(tempDates[i - 7]);  //Adds the first date of the 7 day period
            sevenDayTotal = 0;
            dayCounter = 0;


          }
          sevenDayTotal += changePerDay;
          ++dayCounter;
        }
      }

      //Calculate highest daily cases and deaths
      var topCasesCount = 0, topDeathsCount = 0;
      var topCasesDate, topDeathsDate;
      var changeCases = 0, changeDeaths = 0;
      for (var i = 1; i < tempCases.length; i++) {
        changeCases = tempCases[i] - tempCases[i - 1];
        changeDeaths = tempDeaths[i] - tempDeaths[i - 1];

        if (changeCases > topCasesCount) {
          //New highest cases found
          topCasesCount = changeCases;
          topCasesDate = tempDates[i];
        }
        if (changeDeaths > topDeathsCount) {
          //New highest cases found
          topDeathsCount = changeDeaths;
          topDeathsDate = tempDates[i];
        }
      }

      //Set Highest cases and deaths to cards
      if (datasetIndex == 0) {
        //Update State 1
        $("#state1CasesDate").text("Date: " + topCasesDate);
        $("#state1Cases").text("Cases: " + NumberWithCommas(topCasesCount));

        $("#state1DeathsDate").text("Date: " + topDeathsDate);
        $("#state1Deaths").text("Deaths: " + NumberWithCommas(topDeathsCount));
      }
      else {
        //Update State 2
        $("#state2CasesDate").text("Date: " + topCasesDate);
        $("#state2Cases").text("Cases: " + NumberWithCommas(topCasesCount));

        $("#state2DeathsDate").text("Date: " + topDeathsDate);
        $("#state2Deaths").text("Deaths: " + NumberWithCommas(topDeathsCount));
      }

      //Set Graph Properties
      if (datasetIndex == 0) {
        GRAPH.options.title.display = true;
        GRAPH.options.title.text = "US Covid Cases Weekly Average";

      }
      GRAPH.data.datasets[datasetIndex].pointRadius = 3;
      GRAPH.data.labels = weeklyAverageDates;
      GRAPH.data.datasets[datasetIndex].data = weeklyAverages;
      GRAPH.data.datasets[datasetIndex].label = "USA";


      GRAPH.update();

    },
    error: function () {
      console.log("Error: Ajax call failed");
    }
  });

}

//This function displays the average Covid deaths per week in USA
//New cases are determined by looking at changes from the previous day
function GetUSACovidDeathsWeeklyAverage(datasetIndex = 0) {

  $.ajax({
    async: true,
    type: 'GET',
    url: "https://disease.sh/v3/covid-19/historical/USA?lastdays=all",
    success: function (data) {
      //console.log(data.timeline.cases);


      //callback
      var tempDates = Object.keys(data.timeline.deaths);
      var tempCases = Object.values(data.timeline.cases);
      var tempDeaths = Object.values(data.timeline.deaths);
      var weeklyAverages = [];  //Array of weekly averages
      var weeklyAverageDates = []; //Array of weekly average dates, used as labels for x-axis
      var dayCounter = 0; //7 day counter
      var sevenDayTotal = 0;  //Total count for each week, resets every 7 days  
      var changePerDay = 0;

      var dateStart = $('#startDate').val();
      var dateEnd = $('#endDate').val();

      for (var i = 1; i < tempDeaths.length; i++) {
        if (dateCompare(dateStart, tempDates[i]) && !dateCompare(dateEnd, tempDates[i])) {

          //This if statement is used to filter outliers from the dataset (eg. +1,000,000 US covid cases a day)
          // if(tempCases[i] > 1000000){
          //   tempCases[i] = tempCases[i - 1];  //Reuse the previous day's count if it is an outlier
          // }
          changePerDay = tempDeaths[i] - tempDeaths[i - 1];
          if (dayCounter >= 7) {
            //It is the end of the 7 day week, calculate the average
            //1. Add weekly average and date to respective arrays
            //2. Reset counters
            weeklyAverages.push(Math.ceil(sevenDayTotal / 7));
            weeklyAverageDates.push(tempDates[i - 7]);  //Adds the first date of the 7 day period
            sevenDayTotal = 0;
            dayCounter = 0;


          }
          sevenDayTotal += changePerDay;
          ++dayCounter;
        }
      }

      //Calculate highest daily cases and deaths
      var topCasesCount = 0, topDeathsCount = 0;
      var topCasesDate, topDeathsDate;
      var changeCases = 0, changeDeaths = 0;
      var dateStart = $('#startDate').val();
      var dateEnd = $('#endDate').val();

      for (var i = 1; i < tempCases.length; i++) {

        changeCases = tempCases[i] - tempCases[i - 1];
        changeDeaths = tempDeaths[i] - tempDeaths[i - 1];

        if (changeCases > topCasesCount) {
          //New highest cases found
          topCasesCount = changeCases;
          topCasesDate = tempDates[i];
        }
        if (changeDeaths > topDeathsCount) {
          //New highest cases found
          topDeathsCount = changeDeaths;
          topDeathsDate = tempDates[i];
        }
      }

      //Set Highest cases and deaths to cards
      if (datasetIndex == 0) {
        //Update State 1
        $("#state1CasesDate").text("Date: " + topCasesDate);
        $("#state1Cases").text("Cases: " + NumberWithCommas(topCasesCount));

        $("#state1DeathsDate").text("Date: " + topDeathsDate);
        $("#state1Deaths").text("Deaths: " + NumberWithCommas(topDeathsCount));
      }
      else {
        //Update State 2
        $("#state2CasesDate").text("Date: " + topCasesDate);
        $("#state2Cases").text("Cases: " + NumberWithCommas(topCasesCount));

        $("#state2DeathsDate").text("Date: " + topDeathsDate);
        $("#state2Deaths").text("Deaths: " + NumberWithCommas(topDeathsCount));
      }

      //Set Graph Properties
      if (datasetIndex == 0) {
        GRAPH.options.title.display = true;
        GRAPH.options.title.text = "US Covid Deaths Weekly Average";
        GRAPH.data.datasets[datasetIndex].label = "USA";

      }
      GRAPH.data.datasets[datasetIndex].pointRadius = 3;
      GRAPH.data.labels = weeklyAverageDates;
      GRAPH.data.datasets[datasetIndex].data = weeklyAverages;
      GRAPH.update();

    },
    error: function () {
      console.log("Error: Ajax call failed");
    }
  });

}



//Handles loading modal while waiting for Ajax call to finish
$body = $("body");
$(document).on({
  ajaxStart: function () { $body.addClass("loading"); },
  ajaxStop: function () { $body.removeClass("loading"); }
});


function HideCountyTable() {
  $('#countyModal').hide();
}

function ShowCountyTable() {
  $('#countyModal').show();
}

function Hide1stState() {
  $('#FirstStateModal').hide();
}

function Show1stState() {
  $('#FirstStateModal').show();
}

function Hide2ndState() {
  $('#SecondStateModal').hide();
}

function Show2ndState() {
  $('#SecondStateModal').show();
}

function GetStatesLists() {
  $.ajax({
    async: true,
    type: 'GET',
    url: "https://disease.sh/v3/covid-19/historical/usacounties",
    success: function (data) {
      USStates = Object.values(data);
      //console.log(USStates);

      var selectBox1 = document.getElementById('USStateSelect');
      var selectBox2 = document.getElementById('USStateSelect2');

      for (var i = 0, l = USStates.length; i < l; i++) {
        var option = USStates[i];
        var text = option.toUpperCase();
        selectBox1.options.add(new Option(text, option));
        selectBox2.options.add(new Option(text, option));
      }
    },
    error: function () {
      console.log("Error: Failed to get US states");
    }
  });
}

function ResetRadioButtons() {
  document.getElementById("radioCases").checked = true;
}

function DrawGraphSet1(_labels, _data, _dataLabel, _title, _xAxis, _yAxis) {
  GRAPH = new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
      labels: _labels,//weeklyAverageDates,
      datasets: [{
        data: _data, //weeklyAverages,
        label: _dataLabel, //"US",
        borderColor: "#cd3e3e",
        fill: false
      }, {

        borderColor: "#3c3ccd",
        fill: false
      }]
    },
    options: {
      title: {
        display: true,
        text: _title //'US Covid Cases Weekly Average'
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: _yAxis //'Number of Cases'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: _xAxis //'Week'
          }
        }]
      }
    }
  });
}

function DrawGraphSet2() { }

function GetTotalCasesOrDeathsForState(state, isCases, field) {
  //This method gets the total cases or deaths for the selected state and sets it to a specified text field

  $.ajax({
    async: true,
    type: 'GET',
    url: "https://disease.sh/v3/covid-19/historical/usacounties/" + state + "?lastdays=all",
    success: function (data) {
      var total = 0;

      //Get the total cases or deaths for the selected state
      if (isCases) {
        //Get total covid cases for the state
        for (var countyCount = 0; countyCount < data.length; countyCount++) {
          var countyData = data[countyCount];
          var tempCases = Object.values(countyData.timeline.cases);

          total = total + tempCases[tempCases.length - 1];
        }
        //console.log("Total Cases: " + total);
      }
      else {
        //Get total covid deaths for the state
        for (var countyCount = 0; countyCount < data.length; countyCount++) {
          var countyData = data[countyCount];
          var tempCases = Object.values(countyData.timeline.deaths);

          total = total + tempCases[tempCases.length - 1];
        }
        //console.log("Total Deaths: " + total);
      }

      //Update High Scores table row
      $(field).html(NumberWithCommas(total));


    },
    error: function () {
      console.log("Error: Failed to get Covid cases for the selected state");
    }
  });
}

function LoadHighScoresTables() {
  //Cases
  GetTotalCasesOrDeathsForState("california", 1, '#highScoresCases #hsc1 .count');
  GetTotalCasesOrDeathsForState("texas", 1, '#highScoresCases #hsc2 .count');
  GetTotalCasesOrDeathsForState("florida", 1, '#highScoresCases #hsc3 .count');
  GetTotalCasesOrDeathsForState("new york", 1, '#highScoresCases #hsc4 .count');
  GetTotalCasesOrDeathsForState("illinois", 1, '#highScoresCases #hsc5 .count');

  //Deaths
  GetTotalCasesOrDeathsForState("california", 0, '#highScoresDeaths #hsd1 .count');
  GetTotalCasesOrDeathsForState("new york", 0, '#highScoresDeaths #hsd2 .count');
  GetTotalCasesOrDeathsForState("texas", 0, '#highScoresDeaths #hsd3 .count');
  GetTotalCasesOrDeathsForState("florida", 0, '#highScoresDeaths #hsd4 .count');
  GetTotalCasesOrDeathsForState("pennsylvania", 0, '#highScoresDeaths #hsd5 .count');

}

//High Scores Row Click to Display Cases
$('#highScoresCases tr').click(function () {
  var selectedRowID = $(this).closest('tr').attr('id');
  switch (selectedRowID) {
    case "hsc1":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 6;
      //OnCasesClick();
      break;
    case "hsc2":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 50;
      //OnCasesClick();
      break;
    case "hsc3":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 12;
      //OnCasesClick();
      break;
    case "hsc4":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 37;
      //OnCasesClick();
      break;
    case "hsc5":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 18;
      //OnCasesClick();
      break;
  }
  $("#radioCases").click();
  Submit();
});

//High Scores Row Click to Display Deaths
$('#highScoresDeaths tr').click(function () {
  var selectedRowID = $(this).closest('tr').attr('id');
  switch (selectedRowID) {
    case "hsd1":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 6;
      //OnDeathsClick();      
      break;
    case "hsd2":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 37;
      //OnDeathsClick();       
      break;
    case "hsd3":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 50;
      //OnDeathsClick();       
      break;
    case "hsd4":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 12;
      //OnDeathsClick();       
      break;
    case "hsd5":
      var e = document.getElementById("USStateSelect");
      e.selectedIndex = 44;
      //OnDeathsClick();       
      break;
  }
  $('#radioDeaths').click();
  Submit();
});

function ClearCountyTable() {
  var table = $('#dtDynamicVerticalScrollExample').DataTable();
  table.clear().draw();
}

function AddCountyTableRow(county, cases, deaths, rates) {
  var table = $('#dtDynamicVerticalScrollExample').DataTable();
  table.row.add([county, cases, deaths, rates]).draw(true);
}

function Submit() {
  //First get the state of each filter
  var isDisplayCases = 0;
  var dateStart, dateEnd;
  var state1, state1Name, state2, state2Name;

  //Get Cases or Deaths Radio Button
  if (document.getElementById('radioCases').checked) {
    isDisplayCases = 1;
  }

  //Get start and end date
  dateStart = $('#startDate').val();
  dateEnd = $('#endDate').val();

  //Get selected states and state names
  var e = document.getElementById("USStateSelect");
  state1 = e.options[e.selectedIndex];
  state1Name = state1.text;

  e = document.getElementById("USStateSelect2");
  state2 = e.options[e.selectedIndex];
  state2Name = state2.text;

  // console.log("isChecked " + isDisplayCases);
  // console.log("Start Date: " + dateStart);
  // console.log("End Date: " + dateEnd);
  // console.log("state 1:" + state1Name);
  // console.log("state 2:" + state2Name);

  //Get and Display State 1 data
  if (state1Name == "ALL" && isDisplayCases == 1) {
    GetUSACovidCasesWeeklyAverage();
    ClearCountyTable();
  }
  else if (state1Name == "ALL" && isDisplayCases == 0) {
    GetUSACovidDeathsWeeklyAverage();
    ClearCountyTable();
  }
  else {
    //Get date for a specific state
    GetAndDisplayData(isDisplayCases, state1, dateStart, dateEnd, 0);
  }

  if (state2Name == "ALL" && isDisplayCases == 1) {
    GetUSACovidCasesWeeklyAverage(1);
    ClearCountyTable();
  }
  else if (state2Name == "ALL" && isDisplayCases == 0) {
    GetUSACovidDeathsWeeklyAverage(1);
    ClearCountyTable();
  }
  else if (state2Name == "---") {
    GRAPH.data.datasets[1].data = null;
      GRAPH.data.datasets[1].label = null;
      GRAPH.update();
    ClearStateCards();
    ClearCountyTable();
  }
  else {
    //Get date for a specific state
    GetAndDisplayData(isDisplayCases, state2, dateStart, dateEnd, 1);
  }



}

//This method gets a State's covid cases and death info
function GetAndDisplayData(isDisplayCases, state, dateStart, dateEnd, datasetIndex) {
  $.ajax({
    async: true,
    type: 'GET',
    url: "https://disease.sh/v3/covid-19/historical/usacounties/" + state.value + "?lastdays=all",
    success: function (data) {
      //console.log(data.length);

      var dailyCases = [];
      var dailyDeaths = [];
      var dates = [];

      ClearCountyTable();
      for (var countyCount = 0; countyCount < data.length; countyCount++) {
        var countyData = data[countyCount];
        var tempCases = Object.values(countyData.timeline.cases);
        var tempDeaths = Object.values(countyData.timeline.deaths);

        //County Data Table
        if (countyData.county != null) {
          var countyName = countyData.county.charAt(0).toUpperCase() + countyData.county.slice(1)
          var countyCases = parseInt(tempCases[tempCases.length - 1]);
          var countyDeaths = parseInt(tempDeaths[tempDeaths.length - 1]);
          var countyDeathRate;
          try {
            if (countyDeaths == 0) {
              countyDeathRate = 0 + '%';
            }
            else {
              //countyDeathRate = countyDeaths/countyCases ;
              countyDeathRate = ((countyDeaths / countyCases) * 100).toFixed(2) + '%'
            }
          }
          catch {
            countyDeathRate = 0 + '%';
          }
          if (countyName != "unassigned" && countyName != "out of al")
            AddCountyTableRow(countyName, countyCases, countyDeaths, countyDeathRate);
        }
        //console.log(tempCases);
        //Initialize array to 0 on first iteration
        if (countyCount == 0) {
          dates = Object.keys(countyData.timeline.deaths);
          for (var i = 0; i < tempDeaths.length; i++) {
            dailyCases[i] = 0;
            dailyDeaths[i] = 0;
          }
        }

        for (var i = 0; i < tempCases.length; i++) {
          dailyCases[i] = dailyCases[i] + tempCases[i];
          dailyDeaths[i] = dailyDeaths[i] + tempDeaths[i];
        }
      }

      //Calculate highest daily cases and deaths
      var topCasesCount = 0, topDeathsCount = 0;
      var topCasesDate, topDeathsDate;
      var changeCases = 0, changeDeaths = 0;
      for (var i = 1; i < dailyCases.length; i++) {
        changeCases = dailyCases[i] - dailyCases[i - 1];
        changeDeaths = dailyDeaths[i] - dailyDeaths[i - 1];

        if (changeCases > topCasesCount) {
          //New highest cases found
          topCasesCount = changeCases;
          topCasesDate = dates[i];
        }
        if (changeDeaths > topDeathsCount) {
          //New highest cases found
          topDeathsCount = changeDeaths;
          topDeathsDate = dates[i];
        }
      }

      //Set Highest cases and deaths to cards
      if (datasetIndex == 0) {
        //Update State 1
        $("#state1CasesDate").text("Date: " + topCasesDate);
        $("#state1Cases").text("Cases: " + NumberWithCommas(topCasesCount));

        $("#state1DeathsDate").text("Date: " + topDeathsDate);
        $("#state1Deaths").text("Deaths: " + NumberWithCommas(topDeathsCount));
      }
      else {
        //Update State 2
        $("#state2CasesDate").text("Date: " + topCasesDate);
        $("#state2Cases").text("Cases: " + NumberWithCommas(topCasesCount));

        $("#state2DeathsDate").text("Date: " + topDeathsDate);
        $("#state2Deaths").text("Deaths: " + NumberWithCommas(topDeathsCount));
      }

      //console.log(dailyCases[dailyCases.length - 1]);
      //console.log(dates);

      var weeklyAverages = [];  //Array of weekly averages
      var weeklyAverageDates = []; //Array of weekly average dates, used as labels for x-axis
      var dayCounter = 0; //7 day counter
      var sevenDayTotal = 0;  //Total count for each week, resets every 7 days  
      var changePerDay = 0;

      var filteredDates = [];
      var dateStart = $('#startDate').val();
      var dateEnd = $('#endDate').val();

      for (var i = 1; i < dailyCases.length; i++) {
        if (dateCompare(dateStart, dates[i]) && !dateCompare(dateEnd, dates[i])) {

          if (isDisplayCases) {
            changePerDay = dailyCases[i] - dailyCases[i - 1];
          }
          else {
            changePerDay = dailyDeaths[i] - dailyDeaths[i - 1];
          }
          if (dayCounter >= 7) {
            weeklyAverages.push(Math.ceil(sevenDayTotal / 7));
            weeklyAverageDates.push(dates[i - 7]);  //Adds the first date of the 7 day period
            sevenDayTotal = 0;
            dayCounter = 0;
          }
          sevenDayTotal += changePerDay;
          ++dayCounter;
        }
      }

      var formattedStateName = ToUpperEachWord(state.value);

      //Set Graph Properties
      GRAPH.options.title.display = true;
      if (isDisplayCases) {
        GRAPH.options.title.text = formattedStateName + " Covid Cases Weekly Average";
        GRAPH.options.scales.yAxes[0].scaleLabel.labelString = "Number of Cases";
      }
      else {
        GRAPH.options.title.text = formattedStateName + " Covid Deaths Weekly Average";
        GRAPH.options.scales.yAxes[0].scaleLabel.labelString = "Number of Deaths";
      }

      GRAPH.data.datasets[datasetIndex].pointRadius = 3;
      GRAPH.data.datasets[datasetIndex].label = formattedStateName;
      GRAPH.data.labels = weeklyAverageDates;
      GRAPH.data.datasets[datasetIndex].data = weeklyAverages;
      GRAPH.update();
    },
    error: function () {
      GRAPH.data.datasets[datasetIndex].data = null;
      GRAPH.data.datasets[datasetIndex].label = null;
      GRAPH.update();

      console.log("Error: Failed to get Covid cases for the selected state");
    }
  });

}

/*
  json sample date
  1/22/20 (also earliest date)

  datepicker sample date
  2020/12/31
  2020/01/01



*/

function dateCompare(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  if (date1 > date2) {
    //console.log(`${d1} is greater than ${d2}`)
    return 0;
  } else if (date1 < date2) {
    //console.log(`${d1} is NOT greater than ${d2}`)
    return 1;
  } else {
    //console.log(`Both dates are equal`)
    return 1;
  }
}

function test() {
  dateCompare("01/01/2021", "2020/12/31")
  dateCompare("01/01/2021", "01/01/2021")
}

function ToUpperEachWord(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

}

function NumberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ClearStateCards() {
  $("#state2CasesDate").text("Date: N/A");
  $("#state2Cases").text("Cases: 0");

  $("#state2DeathsDate").text("Date: N/A");
  $("#state2Deaths").text("Deaths: 0");
}