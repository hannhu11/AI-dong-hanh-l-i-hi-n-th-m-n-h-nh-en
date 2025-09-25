const WEATHER_API_KEY = "651625ad01482b8a4f1489e72fdd53e8";
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  description: string;
  temperature: number;
  city: string;
  country: string;
  humidity: number;
  windSpeed: number;
}

export interface WeatherError {
  error: string;
  code?: number;
}

/**
 * Lấy thông tin thời tiết hiện tại từ OpenWeatherMap API
 * @param city Tên thành phố (mặc định: "Ho Chi Minh City")
 * @returns Promise<WeatherData | WeatherError>
 */
export async function getCurrentWeather(city: string = "Ho Chi Minh City"): Promise<WeatherData | WeatherError> {
  try {
    const apiUrl = `${WEATHER_API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=vi`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { error: `Không tìm thấy thông tin thời tiết cho "${city}"`, code: 404 };
      } else if (response.status === 401) {
        return { error: "API key không hợp lệ", code: 401 };
      } else {
        return { error: `Lỗi API thời tiết: ${response.status}`, code: response.status };
      }
    }
    
    const data = await response.json();
    
    return {
      description: data.weather[0].description,
      temperature: Math.round(data.main.temp),
      city: data.name,
      country: data.sys.country,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
    return { error: "Không thể kết nối đến dịch vụ thời tiết" };
  }
}

/**
 * Lấy mô tả thời tiết đơn giản
 * @param city Tên thành phố
 * @returns Promise<string | null>
 */
export async function getWeatherDescription(city: string = "Ho Chi Minh City"): Promise<string | null> {
  try {
    const weatherData = await getCurrentWeather(city);
    
    if ('error' in weatherData) {
      console.warn("Lỗi lấy thời tiết:", weatherData.error);
      return null;
    }
    
    return weatherData.description;
  } catch (error) {
    console.error("Lỗi lấy mô tả thời tiết:", error);
    return null;
  }
}

/**
 * Lấy thông tin thời gian hiện tại theo định dạng tiếng Việt
 * @returns object với thông tin thời gian
 */
export function getCurrentTimeInfo() {
  const now = new Date();
  const hour = now.getHours();
  
  let timeOfDay = "";
  if (hour >= 5 && hour < 12) {
    timeOfDay = "buổi sáng";
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = "buổi chiều";  
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = "buổi tối";
  } else {
    timeOfDay = "buổi đêm";
  }
  
  return {
    timeOfDay,
    hour,
    date: now.toLocaleDateString('vi-VN'),
    time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };
}
