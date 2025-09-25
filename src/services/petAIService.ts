import { getCurrentTimeInfo } from './weatherService';
import { weatherCache } from './weatherCacheService';
import { masterCreativeSystem } from './masterCreativeSystemService';
import { generateThoughtMessage } from './geminiService';
import { timeTracker } from './timeTrackingService';
import { useSettingStore } from '../hooks/useSettingStore';
import { companionAI } from './companionAIService';

export interface PetAIManagerConfig {
  petId: string;
  minIntervalMs: number; // Tối thiểu 1 phút (60000ms)
  maxIntervalMs: number; // Tối đa 3 phút (180000ms)
}

export interface AIMessage {
  text: string;
  timestamp: number;
  petId: string;
  isLongSessionMessage: boolean;
}

class PetAIManager {
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastMessageTime: Map<string, number> = new Map();
  private readonly DEFAULT_MIN_INTERVAL = 60000; // 1 phút
  private readonly DEFAULT_MAX_INTERVAL = 180000; // 3 phút
  private readonly WORK_SESSION_CHECK_INTERVAL = 30000; // Kiểm tra 20 phút mỗi 30 giây

  /**
   * 🎛️ Check if AI is enabled in settings
   */
  private isAIEnabled(): boolean {
    const { aiEnabled } = useSettingStore.getState();
    return aiEnabled;
  }

  /**
   * ⏱️ Get AI frequency from settings (in milliseconds)
   */
  private getAIFrequencyMs(): number {
    const { aiFrequencyMinutes } = useSettingStore.getState();
    return aiFrequencyMinutes * 60 * 1000; // Convert minutes to milliseconds
  }
  
  /**
   * Khởi tạo timer AI cho một pet cụ thể
   */
  public startAITimer(config: PetAIManagerConfig, onMessage: (message: AIMessage) => void): void {
    // 🎛️ Check if AI is enabled
    if (!this.isAIEnabled()) {
      console.log(`🤖 AI is disabled in settings - not starting for pet ${config.petId}`);
      return;
    }

    // Dừng timer cũ nếu có
    this.stopAITimer(config.petId);
    
    // 🎯 Use user-defined frequency instead of random interval
    const userInterval = this.getAIFrequencyMs();
    const initialDelay = Math.min(userInterval, 30000); // Max 30s initial delay
    
    const timer = setTimeout(async () => {
      // Double-check AI is still enabled before generating
      if (this.isAIEnabled()) {
        await this.generateAndEmitMessage(config, onMessage);
        // Sau khi gửi message, đặt lại timer cho lần tiếp theo
        this.scheduleNextMessage(config, onMessage);
      }
    }, initialDelay);
    
    this.activeTimers.set(config.petId, timer);
    console.log(`🧠 Master Creative System khởi động - Frequency: ${Math.round(userInterval/60000)} phút`);
  }
  
  /**
   * Dừng timer AI cho một pet cụ thể
   */
  public stopAITimer(petId: string): void {
    const timer = this.activeTimers.get(petId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(petId);
      console.log(`🛑 AI Timer stopped cho pet ${petId}`);
    }
  }
  
  /**
   * Dừng tất cả timer AI
   */
  public stopAllTimers(): void {
    this.activeTimers.forEach((timer, petId) => {
      clearTimeout(timer);
      console.log(`🛑 AI Timer stopped cho pet ${petId}`);
    });
    this.activeTimers.clear();
  }
  
  /**
   * Lên lịch cho message tiếp theo với kiểm tra ưu tiên nghỉ ngơi
   */
  private scheduleNextMessage(config: PetAIManagerConfig, onMessage: (message: AIMessage) => void): void {
    // 🎛️ Check if AI is still enabled
    if (!this.isAIEnabled()) {
      console.log(`🤖 AI disabled, stopping scheduling for pet: ${config.petId}`);
      this.stopAITimer(config.petId);
      return;
    }

    // Kiểm tra định kỳ nếu cần nghỉ ngơi (mỗi 30 giây)
    const checkInterval = setInterval(() => {
      if (!this.isAIEnabled()) {
        clearInterval(checkInterval);
        this.stopAITimer(config.petId);
        return;
      }
      
      if (timeTracker.isLongSession()) {
        clearInterval(checkInterval);
        // Gửi message nghỉ ngơi ngay lập tức
        this.generateAndEmitMessage(config, onMessage);
        // Tiếp tục lịch bình thường
        this.scheduleNextMessage(config, onMessage);
        return;
      }
    }, this.WORK_SESSION_CHECK_INTERVAL);
    
    // 📏 Use user-defined frequency from settings instead of adaptive interval
    const userInterval = this.getAIFrequencyMs();
    const intervalMinutes = Math.round(userInterval / 60000);
    
    const timer = setTimeout(async () => {
      clearInterval(checkInterval); // Dọn dẹp check interval
      
      // Double-check before generating
      if (this.isAIEnabled()) {
        await this.generateAndEmitMessage(config, onMessage);
        this.scheduleNextMessage(config, onMessage); // Tiếp tục
      }
    }, userInterval);
    
    this.activeTimers.set(config.petId, timer);
    console.log(`⏰ Next message in ${intervalMinutes} minutes (User setting: ${intervalMinutes}min)`);
  }
  
  /**
   * Tạo message AI và gọi callback với ưu tiên nghỉ ngơi
   */
  private async generateAndEmitMessage(config: PetAIManagerConfig, onMessage: (message: AIMessage) => void): Promise<void> {
    try {
      // Lấy thông tin bối cảnh
      const timeInfo = getCurrentTimeInfo();
      const { city } = useSettingStore.getState();
      const isLongSession = timeTracker.isLongSession();
      
      // Lấy thông tin thời tiết (im lặng nếu lỗi)
      let weatherDescription: string | null = null;
      try {
        const weatherData = await weatherCache.getCachedWeather(city);
        if ('description' in weatherData) {
          weatherDescription = weatherData.description;
        }
      } catch (error) {
        // Không log error để giữ console sạch sẽ
      }
      
      // 🎨 Tạo Enhanced Creative Context cho AI
      const context = {
        timeOfDay: timeInfo.timeOfDay,
        weather: weatherDescription,
        city: city,
        isLongSession: isLongSession,
        dayOfWeek: new Date().toLocaleDateString('vi-VN', { weekday: 'long' }),
        season: getSeason(),
        mood: getMoodFromContext(timeInfo.timeOfDay, weatherDescription, isLongSession)
      };
      
      console.log(`🧠 Master Creative System: Tạo thông điệp ${isLongSession ? 'nghỉ ngơi' : 'tương tác'} lúc ${timeInfo.timeOfDay}`);
      
      // 🎯 SỬ DỤNG MASTER CREATIVE SYSTEM - Hoàn toàn chống lặp nội dung
      const aiResponse = await masterCreativeSystem.generateUniqueMessage(context);
      
      if (!aiResponse.success) {
        console.warn(`🧠 MasterCreative: Failed to generate unique message, error:`, aiResponse.error);
      }
      
      if (aiResponse.success && aiResponse.message) {
        const message: AIMessage = {
          text: aiResponse.message,
          timestamp: Date.now(),
          petId: config.petId,
          isLongSessionMessage: isLongSession,
        };
        
        // Reset timer nếu là message nghỉ ngơi
        if (isLongSession) {
          timeTracker.resetTimer();
          console.log(`⏰ Timer đã reset sau thông điệp nghỉ ngơi`);
        }
        
        // Gọi callback
        onMessage(message);
        this.lastMessageTime.set(config.petId, Date.now());
        
        // Ghi nhận interaction pattern cho companion AI
        companionAI.recordInteraction(isLongSession ? 'rest_reminder' : 'casual_interaction');
        
      } else {
        console.warn(`⚠️ AI service tạm thời không khả dụng:`, 'error' in aiResponse ? aiResponse.error : 'Unknown error');
      }
      
    } catch (error) {
      console.error(`❌ Lỗi tạo AI message:`, error);
    }
  }
  
  /**
   * Tạo khoảng thời gian ngẫu nhiên
   */
  private getRandomInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Lấy thông tin về timer đang hoạt động
   */
  public getActiveTimersInfo(): Array<{ petId: string; lastMessage?: number }> {
    const result: Array<{ petId: string; lastMessage?: number }> = [];
    
    this.activeTimers.forEach((timer, petId) => {
      result.push({
        petId,
        lastMessage: this.lastMessageTime.get(petId),
      });
    });
    
    return result;
  }
}

/**
 * 🌱 Helper Functions cho Enhanced Context
 */

/**
 * Xác định mùa hiện tại
 */
function getSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'xuân';
  if (month >= 6 && month <= 8) return 'hè';
  if (month >= 9 && month <= 11) return 'thu';
  return 'đông';
}

/**
 * Xác định mood dựa trên context
 */
function getMoodFromContext(
  timeOfDay: string, 
  weather: string | null, 
  isLongSession: boolean
): 'gentle' | 'energetic' | 'contemplative' | 'restful' {
  
  if (isLongSession) return 'restful';
  
  if (timeOfDay.includes('sáng')) return 'energetic';
  if (timeOfDay.includes('tối')) return 'contemplative';
  if (weather && weather.includes('mưa')) return 'contemplative';
  
  return 'gentle'; // default
}

// Export singleton instance
export const petAIManager = new PetAIManager();
