/**
 * 🌤️ WEATHER ENHANCED SERVICE - Kết nối sâu sắc với thiên nhiên
 * 
 * Service này mở rộng weather service cơ bản để:
 * - Tạo ra những thông điệp phù hợp với thời tiết và tâm trạng
 * - Kết nối Quin với nhịp điệu tự nhiên của ngày
 * - Biến thông tin thời tiết thành trải nghiệm cảm xúc
 */

import { getCurrentWeather, getWeatherDescription, WeatherData } from './weatherService';

// Enhanced weather context
interface WeatherContext {
  description: string;
  temperature: number;
  feeling: 'refreshing' | 'warm' | 'cozy' | 'energizing' | 'calming';
  activity_suggestion: string;
  mood_enhancement: string;
  color_palette: string[];
}

interface SeasonalMoment {
  season: string;
  message: string;
  suggestion: string;
}

class WeatherEnhancedService {
  private static instance: WeatherEnhancedService;
  private lastWeatherCheck: number = 0;
  private cachedWeatherContext: WeatherContext | null = null;
  private readonly WEATHER_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private constructor() {}

  public static getInstance(): WeatherEnhancedService {
    if (!WeatherEnhancedService.instance) {
      WeatherEnhancedService.instance = new WeatherEnhancedService();
    }
    return WeatherEnhancedService.instance;
  }

  /**
   * 🌈 Get enhanced weather context với cảm xúc
   */
  public async getEnhancedWeatherContext(city: string = "Ho Chi Minh City"): Promise<WeatherContext | null> {
    const now = Date.now();
    
    // Use cache if still fresh
    if (this.cachedWeatherContext && (now - this.lastWeatherCheck) < this.WEATHER_CACHE_DURATION) {
      return this.cachedWeatherContext;
    }

    try {
      const weatherData = await getCurrentWeather(city);
      
      if ('error' in weatherData) {
        return this.getDefaultWeatherContext();
      }

      const context = this.interpretWeatherEmotionally(weatherData);
      
      this.cachedWeatherContext = context;
      this.lastWeatherCheck = now;
      
      return context;
    } catch (error) {
      return this.getDefaultWeatherContext();
    }
  }

  /**
   * 🎨 Interpret weather data emotionally
   */
  private interpretWeatherEmotionally(weather: WeatherData): WeatherContext {
    const temp = weather.temperature;
    const desc = weather.description.toLowerCase();
    
    let feeling: WeatherContext['feeling'] = 'calming';
    let activity_suggestion = '';
    let mood_enhancement = '';
    let color_palette: string[] = [];

    // Temperature-based feelings
    if (temp >= 30) {
      feeling = 'energizing';
      activity_suggestion = 'Uống một ly nước mát lạnh và tận hưởng sự sống động';
      mood_enhancement = 'Nắng nóng mang lại năng lượng tích cực';
      color_palette = ['#FF6B35', '#F29E4C', '#FFCC02'];
    } else if (temp >= 25) {
      feeling = 'warm';
      activity_suggestion = 'Mở cửa sổ để đón gió thoảng, rất dễ chịu';
      mood_enhancement = 'Thời tiết ấm áp giúp tâm hồn thư thái';
      color_palette = ['#FFD93D', '#6BCF7F', '#4D96FF'];
    } else if (temp >= 20) {
      feeling = 'refreshing';
      activity_suggestion = 'Thời điểm hoàn hảo cho một ly trà ấm';
      mood_enhancement = 'Không khí mát mẻ làm đầu óc minh mẫn';
      color_palette = ['#4ECDC4', '#44A08D', '#093637'];
    } else {
      feeling = 'cozy';
      activity_suggestion = 'Quàng một chiếc áo ấm và tận hưởng sự ấm cúng';
      mood_enhancement = 'Thời tiết mát lành tạo cảm giác an toàn, ấm áp';
      color_palette = ['#667eea', '#764ba2', '#f093fb'];
    }

    // Weather-specific adjustments
    if (desc.includes('mưa') || desc.includes('rain')) {
      feeling = 'calming';
      activity_suggestion = 'Nghe tiếng mưa rơi, để tâm hồn được thư giãn';
      mood_enhancement = 'Tiếng mưa nhẹ nhàng xoa dịu tâm hồn';
      color_palette = ['#667eea', '#764ba2', '#a8edea'];
    } else if (desc.includes('nắng') || desc.includes('clear') || desc.includes('sunny')) {
      activity_suggestion = 'Ánh nắng đẹp thế này, thích hợp ngắm ra ngoài cửa sổ';
      mood_enhancement = 'Ánh nắng tươi mang lại niềm vui tự nhiên';
    } else if (desc.includes('mây') || desc.includes('cloud')) {
      activity_suggestion = 'Ngắm những đám mây trôi, tưởng tượng hình dạng chúng';
      mood_enhancement = 'Mây che tạo không gian mơ mộng, lãng mạn';
      color_palette = ['#a8e6cf', '#dcedc1', '#f8f3d3'];
    }

    return {
      description: weather.description,
      temperature: temp,
      feeling,
      activity_suggestion,
      mood_enhancement,
      color_palette
    };
  }

  /**
   * 🍂 Get seasonal wisdom
   */
  public getSeasonalMoment(): SeasonalMoment {
    const month = new Date().getMonth();
    const season = this.getCurrentSeason(month);
    
    const seasonalWisdom = {
      'spring': [
        { message: 'Mùa xuân nhắc nhở ta về sự khởi đầu mới', suggestion: 'Trồng một hạt giống hy vọng trong lòng' },
        { message: 'Hoa nở không vội vàng, ta cũng vậy', suggestion: 'Kiên nhẫn với bản thân trong hành trình trưởng thành' },
        { message: 'Mùa xuân thì thầm rằng sự thay đổi luôn có thể', suggestion: 'Hãy mở lòng đón nhận những điều mới mẻ' }
      ],
      'summer': [
        { message: 'Mùa hè dạy ta biết tận hưởng từng khoảnh khắc', suggestion: 'Sống trọn vẹn trong hiện tại' },
        { message: 'Nắng hè rực rỡ như niềm tin trong ta', suggestion: 'Để ánh sáng bên trong tỏa sáng' },
        { message: 'Mùa hè là thời gian của sự sống động', suggestion: 'Tìm niềm vui trong những điều đơn giản' }
      ],
      'autumn': [
        { message: 'Thu về, lá rơi dạy ta biết buông bỏ', suggestion: 'Thả lỏng những gì không còn cần thiết' },
        { message: 'Mùa thu mang vẻ đẹp của sự chín muồi', suggestion: 'Trân trọng những kinh nghiệm đã có' },
        { message: 'Thu sang nhắc ta về sự cân bằng trong cuộc sống', suggestion: 'Tìm kiếm sự hài hòa giữa làm việc và nghỉ ngơi' }
      ],
      'winter': [
        { message: 'Mùa đông dạy ta sức mạnh của sự tĩnh lặng', suggestion: 'Tận hưởng những giây phút yên bình' },
        { message: 'Đông về, ta học cách trân trọng sự ấm áp', suggestion: 'Gửi tình yêu thương đến những người thân yêu' },
        { message: 'Mùa đông là thời gian để tâm hồn nghỉ ngơi', suggestion: 'Dành thời gian chăm sóc bản thân' }
      ]
    };

    const messages = seasonalWisdom[season as keyof typeof seasonalWisdom] || seasonalWisdom['spring'];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      season,
      ...randomMessage
    };
  }

  /**
   * 🌅 Generate time-of-day weather message
   */
  public async generateWeatherMomentMessage(city: string = "Ho Chi Minh City"): Promise<string | null> {
    const weatherContext = await this.getEnhancedWeatherContext(city);
    if (!weatherContext) return null;

    const currentHour = new Date().getHours();
    const timeOfDay = this.getTimeOfDayPoetic(currentHour);
    
    const messages = [
      `${timeOfDay}, ${weatherContext.description}. ${weatherContext.mood_enhancement}.`,
      `${weatherContext.activity_suggestion} - ${weatherContext.description} hôm nay.`,
      `${timeOfDay} với ${weatherContext.description}, ${weatherContext.mood_enhancement.toLowerCase()}.`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 🎭 Get poetic time of day description
   */
  private getTimeOfDayPoetic(hour: number): string {
    if (hour >= 5 && hour < 8) return 'Buổi sáng tinh khôi';
    if (hour >= 8 && hour < 11) return 'Sáng đang rộ nắng';
    if (hour >= 11 && hour < 14) return 'Giữa trưa nắng ấm';
    if (hour >= 14 && hour < 17) return 'Chiều êm đềm';
    if (hour >= 17 && hour < 19) return 'Chiều tà lãng mạn';
    if (hour >= 19 && hour < 22) return 'Tối ấm cúng';
    return 'Đêm yên bình';
  }

  /**
   * 📅 Determine current season
   */
  private getCurrentSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer'; 
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * 🌤️ Default weather context when API fails
   */
  private getDefaultWeatherContext(): WeatherContext {
    return {
      description: 'thời tiết dễ chịu',
      temperature: 26,
      feeling: 'refreshing',
      activity_suggestion: 'Hít một hơi thật sâu và cảm nhận khoảnh khắc này',
      mood_enhancement: 'Mỗi ngày đều mang trong mình vẻ đẹp riêng',
      color_palette: ['#4ECDC4', '#44A08D', '#093637']
    };
  }

  /**
   * 🌟 Get weather-based ThoughtBubble style
   */
  public getWeatherBasedBubbleType(weatherContext: WeatherContext | null): 'gentle' | 'rest' | 'creative' | 'healing' {
    if (!weatherContext) return 'gentle';
    
    switch (weatherContext.feeling) {
      case 'energizing':
        return 'creative';
      case 'warm':
        return 'gentle';
      case 'refreshing':
        return 'healing';
      case 'cozy':
        return 'rest';
      case 'calming':
        return 'healing';
      default:
        return 'gentle';
    }
  }
}

// Export singleton
export const weatherEnhanced = WeatherEnhancedService.getInstance();
