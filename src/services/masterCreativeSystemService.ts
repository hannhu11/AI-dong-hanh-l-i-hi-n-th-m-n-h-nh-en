/**
 * 🧠 MASTER CREATIVE SYSTEM SERVICE
 * ================================
 * 
 * Triển khai HOÀN CHỈNH theo "Linh Hồn Của AI - Chỉ Dẫn Chiến Lược Tối Thượng"
 * 
 * Giải quyết Vấn đề #3, #4, #6, #9: 
 * ✅ Chấm dứt sự lặp lại nội dung hoàn toàn
 * ✅ 4 Phương pháp tư duy sáng tạo động
 * ✅ Memory system chống repetition
 * ✅ Master instruction builder
 * ✅ Intelligent method selection
 */

import { generateThoughtMessage, CreativeContext, CreativeMethod } from './geminiService';

interface MessageMemory {
  content: string;
  method: CreativeMethod;
  timestamp: number;
  keywords: string[];
  structure: string;
}

interface CreativePromptContext {
  timeOfDay: string;
  dayOfWeek: string;
  city: string;
  weather: string | null;
  isLongSession: boolean;
  season: string;
  mood: string;
}

class MasterCreativeSystemService {
  private static instance: MasterCreativeSystemService;
  private messageHistory: MessageMemory[] = [];
  private readonly HISTORY_SIZE = 20; // Keep last 20 messages in memory
  private readonly SIMILARITY_THRESHOLD = 0.3; // Anti-repetition threshold

  private constructor() {}

  public static getInstance(): MasterCreativeSystemService {
    if (!MasterCreativeSystemService.instance) {
      MasterCreativeSystemService.instance = new MasterCreativeSystemService();
    }
    return MasterCreativeSystemService.instance;
  }

  /**
   * 🎭 MAIN METHOD: Generate completely unique creative message
   * Theo "Linh Hồn Của AI" - Section III.2
   */
  public async generateUniqueMessage(context: CreativePromptContext): Promise<{
    success: boolean;
    message?: string;
    method?: CreativeMethod;
    error?: string;
  }> {
    try {
      // 🎲 Step 1: Select creative method intelligently
      const selectedMethod = this.selectOptimalCreativeMethod(context);
      
      // 📚 Step 2: Build Master Instruction (theo file hướng dẫn)
      const masterInstruction = this.buildMasterInstruction(context, selectedMethod);
      
      // 🔄 Step 3: Generate with anti-repetition validation
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        const creativeContext: CreativeContext = {
          timeOfDay: context.timeOfDay,
          weather: context.weather,
          city: context.city,
          isLongSession: context.isLongSession,
          dayOfWeek: context.dayOfWeek,
          season: context.season,
          mood: context.mood as 'gentle' | 'energetic' | 'contemplative' | 'restful' | undefined,
          customPrompt: masterInstruction
        };

        const result = await generateThoughtMessage(creativeContext);
        
        if (result.success && result.message) {
          // ✅ Validate against memory
          if (this.isMessageUnique(result.message, selectedMethod)) {
            // 📝 Store in memory
            this.storeMessageInMemory(result.message, selectedMethod);
            
            console.log(`🧠 MasterCreative: Generated unique message using ${selectedMethod} (attempt ${attempts + 1})`);
            return {
              success: true,
              message: result.message,
              method: selectedMethod
            };
          } else {
            console.log(`🧠 MasterCreative: Message too similar to previous ones, retrying... (attempt ${attempts + 1})`);
          }
        }
        
        attempts++;
      }

      // 🛡️ Fallback: Use enhanced fallback system
      return this.generateEnhancedFallbackMessage(selectedMethod, context);

    } catch (error) {
      console.error("🧠 MasterCreative: Error generating message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * 🎯 Intelligent Creative Method Selection
   * Based on context, weather, time to ensure variety
   */
  private selectOptimalCreativeMethod(context: CreativePromptContext): CreativeMethod {
    const hour = new Date().getHours();
    const methods: CreativeMethod[] = [CreativeMethod.METAPHOR, CreativeMethod.SENSORY, CreativeMethod.RHETORICAL, CreativeMethod.MICROSTORY];
    
    // 🎲 Smart selection based on context
    let preferredMethods: CreativeMethod[] = [];
    
    // Time-based preferences
    if (hour >= 6 && hour <= 10) {
      preferredMethods = [CreativeMethod.SENSORY, CreativeMethod.MICROSTORY]; // Morning: gentle awakening
    } else if (hour >= 11 && hour <= 14) {
      preferredMethods = [CreativeMethod.RHETORICAL, CreativeMethod.METAPHOR]; // Midday: contemplative
    } else if (hour >= 15 && hour <= 18) {
      preferredMethods = [CreativeMethod.MICROSTORY, CreativeMethod.SENSORY]; // Afternoon: creative
    } else {
      preferredMethods = [CreativeMethod.METAPHOR, CreativeMethod.RHETORICAL]; // Evening: reflective
    }

    // Weather-based adjustments
    if (context.weather?.includes('mưa')) {
      preferredMethods.push(CreativeMethod.METAPHOR, CreativeMethod.SENSORY);
    }
    if (context.weather?.includes('nắng')) {
      preferredMethods.push(CreativeMethod.MICROSTORY, CreativeMethod.RHETORICAL);
    }

    // Long session priority
    if (context.isLongSession) {
      preferredMethods = [CreativeMethod.SENSORY, CreativeMethod.METAPHOR]; // Gentle rest reminders
    }

    // 🚫 Avoid recently used methods
    const recentMethods = this.messageHistory.slice(-5).map(m => m.method);
    const availableMethods = preferredMethods.filter(method => 
      !recentMethods.includes(method) || recentMethods.length === 0
    );

    // Select randomly from available methods
    const finalMethods = availableMethods.length > 0 ? availableMethods : methods;
    return finalMethods[Math.floor(Math.random() * finalMethods.length)];
  }

  /**
   * 📜 Build Master Instruction theo "Linh Hồn Của AI"
   * Section III.2: Cấu trúc chỉ dẫn động
   */
  private buildMasterInstruction(context: CreativePromptContext, method: CreativeMethod): string {
    const recentMessages = this.getRecentMessagesForMemory();
    
    return `『BỐI CẢNH HIỆN TẠI』
- Thời gian: ${context.timeOfDay}, ${context.dayOfWeek}
- Địa điểm: ${context.city}
- Thời tiết: ${context.weather || 'khá dễ chịu'}
- Trạng thái người dùng: ${context.isLongSession ? 'Đã làm việc liên tục hơn 20 phút' : 'Đang tập trung'}
- Mùa: ${context.season}
- Tâm trạng: ${context.mood}
- Trí nhớ ngắn hạn (TUYỆT ĐỐI không lặp lại): ${recentMessages}

『VAI TRÒ CỐT LÕI』
Bạn là một "Chuyên Gia Đồng Cảm Số" - người bạn vô hình, tinh tế của Quin.

『NHIỆM VỤ SÁNG TẠO』
Hãy tạo ra một thông điệp **hoàn toàn mới và độc nhất** để gửi đến Quin.

**PHƯƠNG PHÁP ĐÃ CHỌN: ${this.getMethodDescription(method)}**

${this.getMethodSpecificInstructions(method, context)}

『CÁC QUY TẮC BẤT BIẾN』
1. **Ưu tiên:** ${context.isLongSession ? 'Thông điệp phải là lời nhắc nhở nghỉ ngơi thật tinh tế, nên thơ và gián tiếp' : 'Tạo thông điệp ấm áp và bất ngờ'}
2. **CẤM TUYỆT ĐỐI:** Không được lặp lại ý tưởng, cấu trúc câu, hoặc từ ngữ có trong "Trí nhớ ngắn hạn"
3. **Ngắn gọn:** Dưới 25 từ Tiếng Việt
4. **Giọng văn:** Thơ mộng, tinh tế, chân thành
5. **Giới hạn:** Không hỏi trực tiếp về cảm xúc, không icon, không tự xưng tên
6. **Đảm bảo:** Phải tạo ra một góc nhìn hoàn toàn mới, chưa từng xuất hiện`;
  }

  /**
   * 🎭 Get method-specific instructions
   */
  private getMethodDescription(method: CreativeMethod): string {
    switch (method) {
      case CreativeMethod.METAPHOR:
        return 'Ẩn dụ & Liên tưởng - Kết nối bối cảnh với cảm xúc sâu sắc';
      case CreativeMethod.SENSORY:
        return 'Đan dệt Giác quan - Gợi mở các giác quan để mang lại bình yên';
      case CreativeMethod.RHETORICAL:
        return 'Gợi mở Câu hỏi Tu từ - Khơi gợi suy tưởng nhẹ nhàng';
      case CreativeMethod.MICROSTORY:
        return 'Kể chuyện Siêu ngắn - Tạo hình ảnh đẹp và ý nghĩa';
      default:
        return 'Phương pháp sáng tạo độc đáo';
    }
  }

  /**
   * 📋 Get method-specific detailed instructions
   */
  private getMethodSpecificInstructions(method: CreativeMethod, context: CreativePromptContext): string {
    switch (method) {
      case CreativeMethod.METAPHOR:
        return `**Hướng dẫn Ẩn dụ:**
Sử dụng ${context.weather || 'thời tiết'} hoặc ${context.timeOfDay} để tạo ra một ẩn dụ hoàn toàn mới về cảm xúc hoặc trạng thái tâm lý. 
Tránh các ẩn dụ truyền thống như "hoa nở", "nắng sau mưa".
${context.isLongSession ? 'Hãy ẩn dụ về sự nghỉ ngơi như một điều tự nhiên và cần thiết.' : ''}`;

      case CreativeMethod.SENSORY:
        return `**Hướng dẫn Giác quan:**
Tạo thông điệp gợi mở ít nhất 2 trong 5 giác quan (nhìn, nghe, ngửi, nếm, sờ).
Dựa vào bối cảnh ${context.weather || 'hiện tại'} để xây dựng trải nghiệm giác quan độc đáo.
${context.isLongSession ? 'Tập trung vào cảm giác thư giãn và nghỉ ngơi qua giác quan.' : ''}`;

      case CreativeMethod.RHETORICAL:
        return `**Hướng dẫn Câu hỏi Tu từ:**
Đặt một câu hỏi nhẹ nhàng, không cần trả lời, để khơi gợi suy tưởng về cuộc sống hoặc thiên nhiên.
Câu hỏi phải liên quan đến ${context.timeOfDay} hoặc ${context.season}.
${context.isLongSession ? 'Hỏi về giá trị của việc nghỉ ngơi một cách thơ mộng.' : ''}`;

      case CreativeMethod.MICROSTORY:
        return `**Hướng dẫn Kể chuyện:**
Kể một câu chuyện siêu ngắn (1-2 câu) về một khoảnh khắc nhỏ đang diễn ra.
Có thể về một vật dụng, hiện tượng tự nhiên, hoặc cảm xúc trong ${context.timeOfDay}.
${context.isLongSession ? 'Câu chuyện về việc nghỉ ngơi như một hành trình nhỏ.' : ''}`;

      default:
        return `**Hướng dẫn Sáng tạo:**
Tạo thông điệp độc đáo dựa trên bối cảnh hiện tại một cách tự nhiên và thơ mộng.`;
    }
  }

  /**
   * 🧠 Check if message is unique against memory
   */
  private isMessageUnique(newMessage: string, method: CreativeMethod): boolean {
    const newKeywords = this.extractKeywords(newMessage);
    const newStructure = this.analyzeStructure(newMessage);

    for (const memory of this.messageHistory) {
      // Check keyword similarity
      const keywordSimilarity = this.calculateKeywordSimilarity(newKeywords, memory.keywords);
      if (keywordSimilarity > this.SIMILARITY_THRESHOLD) {
        return false;
      }

      // Check structure similarity for same method
      if (memory.method === method && this.calculateStringSimilarity(newStructure, memory.structure) > this.SIMILARITY_THRESHOLD) {
        return false;
      }

      // Check exact substring matches
      if (this.hasSignificantOverlap(newMessage, memory.content)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 🔤 Extract keywords from message
   */
  private extractKeywords(message: string): string[] {
    // Remove common words and extract meaningful terms
    const stopWords = ['và', 'của', 'là', 'có', 'một', 'các', 'với', 'để', 'không', 'thì', 'đã', 'sẽ', 'bị', 'được'];
    return message
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .filter(word => /^[a-zA-ZÀ-ỹ]+$/.test(word)); // Only Vietnamese/English letters
  }

  /**
   * 📐 Analyze message structure
   */
  private analyzeStructure(message: string): string {
    return message
      .replace(/[a-zA-ZÀ-ỹ]+/g, 'W') // Replace words with W
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/[^\w\s]/g, 'P'); // Replace punctuation with P
  }

  /**
   * 🔍 Calculate keyword similarity
   */
  private calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 && keywords2.length === 0) return 0;
    
    const intersection = keywords1.filter(word => keywords2.includes(word));
    const union = [...new Set([...keywords1, ...keywords2])];
    
    return intersection.length / union.length;
  }

  /**
   * 📊 Calculate string similarity
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
  }

  /**
   * 📏 Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 🎯 Check for significant content overlap
   */
  private hasSignificantOverlap(message1: string, message2: string): boolean {
    const words1 = message1.toLowerCase().split(/\s+/);
    const words2 = message2.toLowerCase().split(/\s+/);
    
    // Check for consecutive word matches
    for (let i = 0; i <= words1.length - 3; i++) {
      const phrase = words1.slice(i, i + 3).join(' ');
      if (words2.join(' ').includes(phrase)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 💾 Store message in memory
   */
  private storeMessageInMemory(message: string, method: CreativeMethod): void {
    const memory: MessageMemory = {
      content: message,
      method: method,
      timestamp: Date.now(),
      keywords: this.extractKeywords(message),
      structure: this.analyzeStructure(message)
    };

    this.messageHistory.push(memory);

    // Keep only recent messages
    if (this.messageHistory.length > this.HISTORY_SIZE) {
      this.messageHistory.shift();
    }
  }

  /**
   * 📚 Get recent messages for memory context
   */
  private getRecentMessagesForMemory(): string {
    const recent = this.messageHistory.slice(-5);
    if (recent.length === 0) return "Chưa có thông điệp nào";
    
    return recent.map((m, i) => `${i + 1}. "${m.content}" (${m.method})`).join('; ');
  }

  /**
   * 🛡️ Enhanced fallback system với creative methods
   */
  private generateEnhancedFallbackMessage(method: CreativeMethod, context: CreativePromptContext): {
    success: boolean;
    message: string;
    method: CreativeMethod;
  } {
    const fallbackMessages: Record<CreativeMethod, string[]> = {
      [CreativeMethod.METAPHOR]: [
        "Như sương mai nhẹ nhàng đến với đất",
        "Ta là hạt cát nhỏ trên bờ biển lớn",
        "Thời gian trôi như dòng suối mát"
      ],
      [CreativeMethod.SENSORY]: [
        "Nghe thấy tiếng lá xào xạc bên tai",
        "Ánh sáng hôm nay mềm mại như lụa", 
        "Hơi thở nhẹ nhàng, thế giới yên bình"
      ],
      [CreativeMethod.RHETORICAL]: [
        "Có phải niềm vui ẩn trong những điều nhỏ?",
        "Tại sao im lặng lại có thể nói nhiều điều?",
        "Liệu ta có nghe được tiếng lòng mình?"
      ],
      [CreativeMethod.MICROSTORY]: [
        "Có một giọt nước đang tìm đường về biển",
        "Đâu đó có ánh mắt đang tìm kiếm bình yên",
        "Chiếc lá nhỏ đang viết thư gửi gió"
      ]
    };

    const messages = fallbackMessages[method];
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Store in memory to avoid future repetition
    this.storeMessageInMemory(selectedMessage, method);
    
    console.log(`🛡️ MasterCreative: Using enhanced fallback message (${method})`);
    return {
      success: true,
      message: selectedMessage,
      method: method
    };
  }

  /**
   * 📊 Get system statistics
   */
  public getStats(): {
    totalMessages: number;
    methodDistribution: Record<CreativeMethod, number>;
    averageUniqueness: number;
  } {
    const methodCount: Record<CreativeMethod, number> = {
      [CreativeMethod.METAPHOR]: 0,
      [CreativeMethod.SENSORY]: 0,
      [CreativeMethod.RHETORICAL]: 0,
      [CreativeMethod.MICROSTORY]: 0
    };

    this.messageHistory.forEach(memory => {
      methodCount[memory.method]++;
    });

    return {
      totalMessages: this.messageHistory.length,
      methodDistribution: methodCount,
      averageUniqueness: this.calculateAverageUniqueness()
    };
  }

  /**
   * 📈 Calculate average uniqueness score
   */
  private calculateAverageUniqueness(): number {
    if (this.messageHistory.length < 2) return 1.0;

    let totalScore = 0;
    let comparisons = 0;

    for (let i = 0; i < this.messageHistory.length - 1; i++) {
      for (let j = i + 1; j < this.messageHistory.length; j++) {
        const similarity = this.calculateStringSimilarity(
          this.messageHistory[i].content,
          this.messageHistory[j].content
        );
        totalScore += (1 - similarity); // Convert to uniqueness score
        comparisons++;
      }
    }

    return comparisons > 0 ? totalScore / comparisons : 1.0;
  }

  /**
   * 🔄 Clear memory (for testing)
   */
  public clearMemory(): void {
    this.messageHistory = [];
    console.log("🧠 MasterCreative: Memory cleared");
  }
}

// 🧠 Export singleton instance
export const masterCreativeSystem = MasterCreativeSystemService.getInstance();
