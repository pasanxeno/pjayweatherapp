// Constants
const API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
const API_URL = 'https://api.openweathermap.org/data/2.5/';

// DOM Elements
const searchContainer = document.getElementById('search-container');
const weatherContainer = document.getElementById('weather-container');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const backBtn = document.getElementById('back-btn');
const cityNameEl = document.getElementById('city-name');
const currentDateEl = document.getElementById('current-date');
const temperatureEl = document.getElementById('temperature');
const weatherIconEl = document.getElementById('weather-icon');
const weatherConditionEl = document.getElementById('weather-condition');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
backBtn.addEventListener('click', showSearchForm);
cityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Initialize the app
function initApp() {
    // Show the search form initially
    showSearchForm();
}

// Show search form
function showSearchForm() {
    searchContainer.classList.add('active');
    searchContainer.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
    weatherContainer.classList.remove('active');
    cityInput.value = '';
    cityInput.focus();
}

// Show weather data
function showWeatherData() {
    searchContainer.classList.remove('active');
    searchContainer.classList.add('hidden');
    weatherContainer.classList.remove('hidden');
    weatherContainer.classList.add('active');
}

// Handle search
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    
    // Show loading state
    cityNameEl.textContent = 'Loading...';
    showWeatherData();
    
    // Fetch current weather data
    fetchCurrentWeather(city);
}

// Fetch current weather data
function fetchCurrentWeather(city) {
    const url = `${API_URL}weather?q=${city}&units=metric&appid=${API_KEY}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            // Display current weather
            displayCurrentWeather(data);
            
            // Fetch forecast data
            return fetchForecast(city);
        })
        .catch(error => {
            showError(error.message);
        });
}

// Fetch forecast data
function fetchForecast(city) {
    const url = `${API_URL}forecast?q=${city}&units=metric&appid=${API_KEY}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            return response.json();
        })
        .then(data => {
            // Display forecast
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
        });
}

// Display current weather
function displayCurrentWeather(data) {
    // Update city name
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    
    // Update date
    const currentDate = new Date();
    currentDateEl.textContent = formatDate(currentDate);
    
    // Update temperature
    temperatureEl.textContent = Math.round(data.main.temp);
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIconEl.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // Update weather condition
    weatherConditionEl.textContent = data.weather[0].description;
    
    // Update humidity and wind speed
    humidityEl.textContent = data.main.humidity;
    windSpeedEl.textContent = Math.round(data.wind.speed);
}

// Display forecast
function displayForecast(data) {
    // Clear previous forecast
    forecastContainer.innerHTML = '';
    
    // Get forecast for the next 3 days at noon
    const forecasts = filterForecastData(data.list);
    
    // Create forecast cards
    forecasts.forEach(forecast => {
        const forecastCard = createForecastCard(forecast);
        forecastContainer.appendChild(forecastCard);
    });
}

// Filter forecast data to get one forecast per day at noon
function filterForecastData(forecastList) {
    const dailyForecasts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get unique dates excluding today
    const dates = {};
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        date.setHours(0, 0, 0, 0);
        
        // Skip today
        if (date.getTime() === today.getTime()) {
            return;
        }
        
        const dateStr = date.toDateString();
        
        if (!dates[dateStr] && Object.keys(dates).length < 3) {
            dates[dateStr] = true;
            
            // Find forecast closest to noon for this date
            const noonForecast = findForecastClosestToNoon(forecastList, date);
            if (noonForecast) {
                dailyForecasts.push(noonForecast);
            }
        }
    });
    
    return dailyForecasts;
}

// Find forecast closest to noon for a given date
function findForecastClosestToNoon(forecastList, targetDate) {
    targetDate.setHours(12, 0, 0, 0);
    const targetTime = targetDate.getTime();
    
    let closestForecast = null;
    let minTimeDiff = Infinity;
    
    forecastList.forEach(item => {
        const itemDate = new Date(item.dt * 1000);
        
        if (itemDate.toDateString() === targetDate.toDateString()) {
            const timeDiff = Math.abs(itemDate.getTime() - targetTime);
            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                closestForecast = item;
            }
        }
    });
    
    return closestForecast;
}

// Create forecast card element
function createForecastCard(forecast) {
    const date = new Date(forecast.dt * 1000);
    const dayName = getDayName(date);
    const temperature = Math.round(forecast.main.temp);
    const description = forecast.weather[0].description;
    const iconCode = forecast.weather[0].icon;
    
    const card = document.createElement('div');
    card.className = 'forecast-day';
    
    card.innerHTML = `
        <h4>${dayName}</h4>
        <div class="forecast-icon">
            <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon">
        </div>
        <div class="forecast-temp">${temperature}°C</div>
        <div class="forecast-condition">${description}</div>
    `;
    
    return card;
}

// Format date as "Day, Month Date, Year"
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get day name from date
function getDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// Show error message
function showError(message) {
    cityNameEl.textContent = 'Error';
    weatherConditionEl.textContent = message;
    temperatureEl.textContent = '--';
    humidityEl.textContent = '--';
    windSpeedEl.textContent = '--';
    weatherIconEl.src = '';
    forecastContainer.innerHTML = '';
}

// Initialize the app
window.addEventListener('DOMContentLoaded', initApp); 