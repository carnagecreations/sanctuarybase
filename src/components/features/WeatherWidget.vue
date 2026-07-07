<template>
  <AppCard :flat="false" class="weather-card">
    <div class="weather-container">
      <div class="weather-main">
        <div class="weather-icon">{{ getWeatherIcon() }}</div>
        <div class="weather-info">
          <div class="weather-temp">{{ Math.round(temperature) }}°F</div>
          <div class="weather-condition">{{ condition }}</div>
        </div>
      </div>

      <div class="weather-details">
        <div class="detail">
          <span class="detail-label">Feels like</span>
          <span class="detail-value">{{ Math.round(feelsLike) }}°F</span>
        </div>
        <div class="detail">
          <span class="detail-label">Humidity</span>
          <span class="detail-value">{{ humidity }}%</span>
        </div>
        <div class="detail">
          <span class="detail-label">Wind</span>
          <span class="detail-value">{{ windSpeed }} mph</span>
        </div>
      </div>

      <div v-if="warnings.length" class="weather-warnings">
        <div v-for="warning in warnings" :key="warning" class="warning-badge">
          ⚠️ {{ warning }}
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppCard } from '../ui'

const temperature = ref(72)
const feelsLike = ref(70)
const humidity = ref(65)
const windSpeed = ref(8)
const condition = ref('Partly Cloudy')
const loading = ref(false)

const warnings = computed(() => {
  const warns = []
  if (temperature.value > 95) warns.push('Extreme Heat')
  if (temperature.value < 32) warns.push('Freezing Conditions')
  if (windSpeed.value > 25) warns.push('High Winds')
  if (humidity.value > 85) warns.push('High Humidity')
  return warns
})

const getWeatherIcon = () => {
  if (condition.value.includes('Rain')) return '🌧️'
  if (condition.value.includes('Cloud')) return '☁️'
  if (condition.value.includes('Sun') || condition.value.includes('Clear')) return '☀️'
  if (condition.value.includes('Snow')) return '❄️'
  if (condition.value.includes('Storm')) return '⛈️'
  return '🌤️'
}

const fetchWeather = async () => {
  loading.value = true
  try {
    // Using Open-Meteo API (free, no key required)
    // Zip code 85365 (Arizona)
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=32.21&longitude=-110.97&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&temperature_unit=fahrenheit&wind_speed_unit=mph'
    )
    const data = await response.json()

    if (data.current) {
      const current = data.current
      temperature.value = current.temperature_2m
      feelsLike.value = current.apparent_temperature
      humidity.value = current.relative_humidity_2m
      windSpeed.value = Math.round(current.wind_speed_10m)

      // Map WMO weather code to condition
      const code = current.weather_code
      if (code === 0) condition.value = 'Clear'
      else if (code === 1 || code === 2) condition.value = 'Partly Cloudy'
      else if (code === 3) condition.value = 'Cloudy'
      else if (code === 45 || code === 48) condition.value = 'Foggy'
      else if (code >= 51 && code <= 67) condition.value = 'Rainy'
      else if (code >= 71 && code <= 85) condition.value = 'Snowing'
      else if (code >= 80 && code <= 82) condition.value = 'Heavy Rain'
      else if (code === 85 || code === 86) condition.value = 'Heavy Snow'
      else if (code >= 90 && code <= 99) condition.value = 'Thunderstorm'
      else condition.value = 'Changing'
    }
  } catch (err) {
    console.error('Failed to fetch weather:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchWeather()
})
</script>

<style scoped>
.weather-card {
  background: linear-gradient(135deg, rgba(78,255,197,.1), rgba(255,107,157,.05));
  border: 1px solid rgba(78,255,197,.2);
}

.weather-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.weather-icon {
  font-size: 48px;
  line-height: 1;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weather-temp {
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
}

.weather-condition {
  font-size: 13px;
  color: var(--ink-2);
  font-weight: 600;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: var(--r);
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.weather-warnings {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.warning-badge {
  padding: 6px 12px;
  background: rgba(255, 107, 107, 0.15);
  color: #FF6B6B;
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
