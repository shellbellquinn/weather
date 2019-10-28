$( document ).ready(function() {

  // return date adjusted by extra days

var getDate = function(days){
  var someDate = new Date();
  var numberOfDaysToAdd = days ;
  someDate.setDate(someDate.getDate() + numberOfDaysToAdd); 

  var dd = someDate.getDate();
  var mm = someDate.getMonth() + 1;
  var y = someDate.getFullYear();

  return mm + '/'+ dd + '/'+ y;
}

//Wind Speed
var mph = (speed) => {
  return parseFloat(speed * (3600/1609.344)).toFixed(2);
} 

//Searched cities
var searchedCities = [];
if( localStorage.getItem("citysearch")){
  searchedCities = JSON.parse(localStorage.getItem("citysearch"));
}

//LastSearched city
var lastSearchedCity;


// City Id seperated for a new call of city change
var apiKey = "ef544c3962ea6eef3972eac908b270dc";


  

var weatherUpdate = function(cityName, searched){

  $("#searchError").html(""); 
  $("#search datalist").html("");


  // First AJAX call gets the city name provided to the function
  $.ajax({url: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`, success: function(result){
    
  // Checks if was sent from searchfield
  if(searched === true){
    // Checks if value was sent from form field before
    if(searchedCities.includes($("#search input").val()) !== true){
      searchedCities.push($("#search input").val());
      localStorage.setItem("citysearch", JSON.stringify(searchedCities));
    }

    localStorage.setItem("lastCitySearch", $("#search input").val());
   }



    cityId = result.id;
    // Second AJAX call uses the result.id data from the first to gather the information to display display the weather and pass to the third for the uv
    $.ajax({url: `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&APPID=${apiKey}&units=imperial`, success: function(result){
  
      // Empties current day information
      $("#currentDay").html("");
      // Sets current day information
      $("#currentDay").append(`<div class="blockHeading"><h2>${result.city.name} ( ${getDate(0)} )</h2><img src="https://openweathermap.org/img/w/${result.list[0].weather[0].icon}.png" alt="${result.list[0].weather[0].description}" width='50' height='50'>`);
      $("#currentDay").append(`<p class="humidity">Temperature: ${result.list[0].main.temp} °C</p>`);
      $("#currentDay").append(`<p class="humidity"> Humidity: ${result.list[0].main.humidity} %</p>`);
      $("#currentDay").append(`<p class="uv">Wind Speed:  ${mph(result.list[0].wind.speed)} MPH</p>`);
      // Third AJAX call uses the co-ordinate data from the second to call the uv data
      $.ajax({url: "https://api.openweathermap.org/data/2.5/uvi?appid=428bbab3989b31eb5f6dd40e0559cbeb&lat=" + result.city.coord.lat + "&lon=" + result.city.coord.lon, success: function(result){
        $("#currentDay").append(`<p class="uv">UV Index: <span>${result.value}</span></p>` );
      }});
  
      // 5 Day Forcast
      // Clear forcast data
      $("#forcast .days").html("");
      // Append forcast data
      for(var i=1; i <= 5; i++){
        var forcastBlock = function(i){
          return('<div>' +
          '<p class="date">' + getDate(i) + '</p>' +  
          `<img src="https://openweathermap.org/img/w/${result.list[i].weather[0].icon}.png" alt="${result.list[i].weather[0].description}" "width='50' height='50'>` +
          `<p class="temperature">Temp: ${result.list[i].main.temp}&nbsp;°C</p>` +
          `<p class="humidity">Humidity: ${result.list[i].main.humidity}&nbsp;%"</p>` +
          '</div>');
        }
        
        $("#forcast .days").append(forcastBlock(i));
      }
    }});
  },error: function (xhr, ajaxOptions, thrownError) {
    //Error handling ajax class from 404's
    if ($("#search input").val() === ""){
      $("#searchError").html("*Requires a city name."); 
    }else{
      $("#searchError").html("*City not found.");
    }
  }
});
  }
  
  if( localStorage.getItem("lastCitySearch")){
    weatherUpdate( localStorage.getItem("lastCitySearch"), false);
  }else{
    weatherUpdate("Toronto", false);
  }

  $("#presetCities div").on( "click", function() {
    weatherUpdate($(this).html().toString(), false);
  });

  $("#search button").on( "click", function() {
    weatherUpdate($("#search input").val(), true);     
  });

  

  });