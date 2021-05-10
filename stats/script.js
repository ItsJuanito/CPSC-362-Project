const nationPoitiveCases = document.querySelector("#nation_positive_cases")
const nationDeaths = document.querySelector("#nation_deaths")
const nationHospitalization = document.querySelector("#nation_hospitalization")
const nationTests = document.querySelector("#nation_total_tests")

const state_stats = document.querySelector("#state-stats")
const state_positive = document.querySelector("#state_positive_cases")
const state_deaths = document.querySelector("#state_deaths")
const state_hospitalized = document.querySelector("#state_hospitalization")
const state_total_tests = document.querySelector("#state_total_tests")

const country_stats = document.querySelector("#country-stats")
const country_error = document.querySelector("#country-error")
const country_positive = document.querySelector("#country_positive_cases")
const country_deaths = document.querySelector("#country_deaths")
const country_total_tests = document.querySelector("#country_total_tests")

let countryMap = new Map()

function getCasesTotal() {
    fetch("https://api.covidtracking.com/v1/us/daily.json")
    .then(response => response.json())
    .then(values => {
        nationPoitiveCases.textContent = values[0].positive.toLocaleString()
        nationDeaths.textContent = values[0].death.toLocaleString()
        nationHospitalization.textContent = values[0].hospitalized.toLocaleString()
        nationTests.textContent = values[0].totalTestResults.toLocaleString()
    })
    setSelectOptions()
}

function setSelectOptions() {
    let selectOptions = document.querySelector("#states-list")
    let countrySelect = document.querySelector("#country-select")

    for (key in state_map) {
        let options = document.createElement("option")
        options.text = state_map[key].toString()
        options.value = key.toString()
        selectOptions.append(options)
    }

    for (let i = 0; i<countries.length; i++) {
        let option = document.createElement("option")
        option.text = countries[i].country.toString()
        option.value = countries[i].iso2.toString()
        countryMap.set(countries[i].country.toString(), countries[i].iso2.toString())
        countrySelect.append(option)
    }

    getStateResult("al")
    getCountryResult("AF")
}

document.addEventListener("DOMContentLoaded", getCasesTotal)

function onChange(selectedChoice){
    var selectedStateName = selectedChoice.options[selectedChoice.selectedIndex].text;  //Gets selected value
    var key = getKeyByValue(state_map, selectedStateName);  //Gets the key for the selected value, only works if all values are unique
    getStateResult(key)
}

function getStateResult(key) {
    let url = "https://api.covidtracking.com/v1/states/"+key+"/current.json"
    fetch(url)
    .then(response => response.json())
    .then(values => {
        state_positive.textContent = values.positive.toLocaleString()
        state_deaths.textContent = values.death.toLocaleString()
        state_hospitalized.textContent = values.hospitalizedCurrently.toLocaleString()
        state_total_tests.textContent = values.totalTestResults.toLocaleString()
    })
}

function onCountrySelected(selectedCountry) {
    let countryName = selectedCountry.options[selectedCountry.selectedIndex].text
    let value = countryMap.get(countryName)
    getCountryResult(value)
}

function getCountryResult(value) {
    let url = "https://disease.sh/v3/covid-19/countries/"+value+"?strict=true"
    fetch(url)
    .then(response => response.json())
    .then(values => {
        if(values.message != null) {
         country_stats.style.visibility = "hidden"
         country_error.style.visibility = "visible"
         country_error.textContent = values.message.toString()
        } else {
         country_stats.style.visibility = "visible"
         country_error.textContent = ""
         country_error.style.visibility = "hidden"
         country_positive.textContent = values.cases.toLocaleString()
         country_total_tests.textContent = values.tests.toLocaleString()
         country_deaths.textContent = values.deaths.toLocaleString()
        }
         
    })
}

//Assists the onChange() function
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
