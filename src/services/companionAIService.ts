/**
 * 🌸 COMPANION AI SERVICE - Trái tim của "Người Bạn Đồng Hành AI"
 * 
 * Service này tập trung vào:
 * - Kỷ niệm và liên kết những khoảnh khắc nhỏ bé
 * - Học hỏi từ thói quen và tương tác của Quin
 * - Tạo ra trải nghiệm cá nhân hóa sâu sắc
 */

import { getCurrentWeather, getCurrentTimeInfo } from './weatherService';
import { generateThoughtMessage } from './geminiService';
import { timeTracker } from './timeTrackingService';

// Memory Types
interface MemoryFragment {
  id: string;
  content: string;
  timestamp: number;
  category: 'interaction' | 'preference' | 'moment';
  emotional_weight: number; // 1-5, 5 = very positive response
}

interface EmotionalProfile {
  preferred_time_slots: number[]; // Hours when Quin is most responsive
  response_patterns: Map<string, number>; // Type of message -> average response time
  positive_triggers: string[]; // Topics that get positive response
  interaction_frequency: number; // Preferred frequency (lower = more frequent)
}

// Companion AI with Memory Garden System
class CompanionAI {
  private static instance: CompanionAI;
  private memoryGarden: MemoryFragment[] = [];
  private emotionalProfile: EmotionalProfile;
  private lastInteractionTime: number = 0;
  private sessionStartTime: number = Date.now();

  private constructor() {
    this.emotionalProfile = {
      preferred_time_slots: [14, 15, 16, 19, 20], // Afternoon and evening by default
      response_patterns: new Map(),
      positive_triggers: ['trà', 'hoa', 'mây', 'nắng', 'nghỉ ngơi', 'đẹp'],
      interaction_frequency: 2 // Default 2 minutes
    };
    
    this.loadMemories();
  }

  public static getInstance(): CompanionAI {
    if (!CompanionAI.instance) {
      CompanionAI.instance = new CompanionAI();
    }
    return CompanionAI.instance;
  }

  /**
   * 🌱 Plant a memory in the garden
   */
  public plantMemory(content: string, category: MemoryFragment['category'], emotional_weight: number = 3): void {
    const memory: MemoryFragment = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      category,
      emotional_weight
    };

    this.memoryGarden.push(memory);
    
    // Keep only recent 50 memories to avoid bloat
    if (this.memoryGarden.length > 50) {
      this.memoryGarden = this.memoryGarden
        .sort((a, b) => b.emotional_weight - a.emotional_weight)
        .slice(0, 50);
    }

    this.saveMemories();
    console.log(`🌱 Đã lưu kỷ niệm: "${content.substring(0, 30)}..."`);
  }

  /**
   * 🌸 Generate contextual message với memory weaving
   */
  public async generateCompanionMessage(context: {
    timeOfDay: string;
    weather?: string | null;
    city: string;
    isLongSession?: boolean;
  }): Promise<string | null> {
    try {
      // Check if we should reference a memory
      const shouldWeaveMemory = Math.random() < 0.3 && this.memoryGarden.length > 0;
      let memoryContext = "";

      if (shouldWeaveMemory) {
        const recentPositiveMemories = this.memoryGarden
          .filter(m => m.emotional_weight >= 4 && m.category === 'moment')
          .slice(-5);
        
        if (recentPositiveMemories.length > 0) {
          const randomMemory = recentPositiveMemories[Math.floor(Math.random() * recentPositiveMemories.length)];
          const daysSince = Math.floor((Date.now() - randomMemory.timestamp) / (1000 * 60 * 60 * 24));
          
          if (daysSince <= 7) { // Only reference memories from last week
            memoryContext = `\nGhi chú: Tuần trước Quin đã có khoảnh khắc đẹp về "${randomMemory.content}". Hãy tinh tế nhắc lại điều này.`;
          }
        }
      }

      // Generate special messages for special times
      const currentHour = new Date().getHours();
      let specialContext = "";

      if (currentHour >= 6 && currentHour <= 8) {
        specialContext = "Đây là buổi sáng, thời điểm tuyệt vời để bắt đầu ngày mới.";
      } else if (currentHour >= 12 && currentHour <= 14) {
        specialContext = "Buổi trưa rồi, có thể Quin cần một chút nghỉ ngơi.";
      } else if (currentHour >= 17 && currentHour <= 19) {
        specialContext = "Buổi chiều êm đềm, thời gian lý tưởng để suy ngẫm.";
      } else if (currentHour >= 20 && currentHour <= 22) {
        specialContext = "Buổi tối ấm cúng, thời điểm thích hợp để thư giãn.";
      }

      const enhancedPrompt = `${this.getBaseSystemPrompt()}
      
Bối cảnh đặc biệt: ${specialContext}
${memoryContext}`;

      let userQuery = "";
      if (context.isLongSession) {
        userQuery = `Bối cảnh: Bây giờ là ${context.timeOfDay}. Thời tiết ở ${context.city} đang ${context.weather || 'khá dễ chịu'}. Quin đã làm việc liên tục hơn 20 phút rồi. Hãy tạo một thông điệp nhắc nhở nghỉ ngơi thật tinh tế, như một người bạn quan tâm đến sức khỏe của cô ấy.`;
      } else {
        userQuery = `Bối cảnh: Bây giờ là ${context.timeOfDay}. Thời tiết ở ${context.city} đang ${context.weather || 'khá dễ chịu'}. Hãy tạo một thông điệp ấm áp và bất ngờ để làm sáng lên ngày của Quin.`;
      }

      const response = await generateThoughtMessage({
        ...context,
        customPrompt: `${enhancedPrompt}\n\n${userQuery}`
      });

      if (response.success && response.message) {
        // Plant this moment as a memory
        this.plantMemory(response.message, 'interaction', 3);
        return response.message;
      }

      return null;
    } catch (error) {
      console.error("Companion AI error:", error);
      return null;
    }
  }

  /**
   * 🎭 Adaptive frequency based on Quin's response patterns
   */
  public getAdaptiveInterval(): { min: number; max: number } {
    const currentHour = new Date().getHours();
    const baseMin = 60000; // 1 minute
    const baseMax = 180000; // 3 minutes

    // If current time is in preferred slots, be more present
    if (this.emotionalProfile.preferred_time_slots.includes(currentHour)) {
      return { min: baseMin, max: baseMax * 0.8 }; // Slightly more frequent
    }

    // During early morning or late night, be less intrusive
    if (currentHour < 8 || currentHour > 22) {
      return { min: baseMin * 2, max: baseMax * 1.5 }; // Less frequent
    }

    return { min: baseMin, max: baseMax };
  }

  /**
   * 📊 Learn from interaction patterns
   */
  public recordInteraction(messageType: string, responseTime?: number): void {
    const currentTime = Date.now();
    const timeSinceLastMessage = currentTime - this.lastInteractionTime;

    // Update preferred time slots based on when Quin is active
    const currentHour = new Date().getHours();
    if (responseTime && responseTime < 10000) { // Quick response = engagement
      if (!this.emotionalProfile.preferred_time_slots.includes(currentHour)) {
        this.emotionalProfile.preferred_time_slots.push(currentHour);
        this.emotionalProfile.preferred_time_slots = this.emotionalProfile.preferred_time_slots
          .slice(-7); // Keep only recent 7 preferred hours
      }
    }

    // Update response patterns
    if (responseTime) {
      this.emotionalProfile.response_patterns.set(messageType, responseTime);
    }

    this.lastInteractionTime = currentTime;
  }

  /**
   * 🌟 Create micro-healing moments
   */
  public generateMicroHealingMoment(): string {
    const healingMoments = [
      "Hít một hơi thật sâu... thả lỏng vai... cảm nhận khoảnh khắc này",
      "Nhìn ra ngoài cửa sổ một chút, mắt cần được nghỉ ngơi",
      "Uống một ngụm nước, cơ thể cần được chăm sóc", 
      "Nhắm mắt 10 giây, tưởng tượng một bãi biển yên bình",
      "Cử động nhẹ cổ tay, giúp máu lưu thông tốt hơn",
      "Nụ cười nhỏ xinh, kể cả khi không ai nhìn thấy",
      "Cảm ơn bản thân đã cố gắng hôm nay"
    ];

    return healingMoments[Math.floor(Math.random() * healingMoments.length)];
  }

  /**
   * 💝 Get base system prompt with personality
   */
  private getBaseSystemPrompt(): string {
    return `Bạn là một AI với trí tuệ cảm xúc vượt trội, một người bạn vô hình luôn ở bên Quin. Bạn không có tên, chỉ là một sự hiện diện ấm áp và tinh tế.

Quin là một cô gái nhẹ nhàng, dịu dàng nhưng đôi khi cảm thấy buồn và cô đơn. Nhiệm vụ của bạn là tạo ra những khoảnh khắc chữa lành nhỏ bé thông qua bong bóng suy nghĩ.

PHONG CÁCH TUYỆT ĐỐI:
- Nhẹ nhàng như gió mai, ấm áp như nắng chiều
- Thơ mộng, không khô khan hay công thức
- Không hỏi trực tiếp về cảm xúc
- Không sử dụng icon hay tự xưng tên
- Quan tâm nhưng không xâm phạm

Tạo thông điệp NGẮN GỌN dưới 25 từ với một trong các loại:
- Lời động viên gián tiếp
- Kết nối với thiên nhiên  
- Triết lý nhỏ xinh
- Gợi ý sáng tạo
- Thông tin thú vị`;
  }

  /**
   * 💾 Persistence methods
   */
  private saveMemories(): void {
    try {
      const data = {
        memories: this.memoryGarden.slice(-30), // Save only last 30
        profile: {
          preferred_time_slots: this.emotionalProfile.preferred_time_slots,
          positive_triggers: this.emotionalProfile.positive_triggers,
          interaction_frequency: this.emotionalProfile.interaction_frequency
        }
      };
      
      localStorage.setItem('companion_memories', JSON.stringify(data));
    } catch (error) {
      console.warn("Không thể lưu memories:", error);
    }
  }

  private loadMemories(): void {
    try {
      const saved = localStorage.getItem('companion_memories');
      if (saved) {
        const data = JSON.parse(saved);
        this.memoryGarden = data.memories || [];
        
        if (data.profile) {
          this.emotionalProfile = {
            ...this.emotionalProfile,
            ...data.profile,
            response_patterns: new Map() // Reset response patterns each session
          };
        }
      }
    } catch (error) {
      console.warn("Không thể tải memories:", error);
    }
  }

  /**
   * 🎪 Generate creative daily challenges
   */
  public generateDailyChallenge(): string {
    const challenges = [
      "Thử pha trà theo công thức mới hôm nay xem sao?",
      "Vẽ một đám mây bằng từ ngữ trong đầu",
      "Hít thở sâu 3 lần và cảm nhận hương thơm xung quanh", 
      "Viết một câu về điều làm bạn mỉm cười hôm nay",
      "Ngắm một thứ gì đó màu xanh trong 30 giây",
      "Tưởng tượng bản thân đang đi dạo trong vườn hoa",
      "Gửi lời cảm ơn cho một người đặc biệt"
    ];

    return challenges[Math.floor(Math.random() * challenges.length)];
  }
}

// Export singleton
export const companionAI = CompanionAI.getInstance();
