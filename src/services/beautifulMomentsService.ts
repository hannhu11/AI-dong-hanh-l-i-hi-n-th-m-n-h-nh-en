/**
 * 🎨 BEAUTIFUL MOMENTS SERVICE - "Bảo Tàng Khoảnh Khắc Đẹp"
 * 
 * Service này tạo ra những kỷ niệm đẹp từ các tương tác hàng ngày:
 * - Thu thập và lưu trữ những moment tích cực
 * - Tạo "bức tranh kỷ niệm" hàng tuần bằng từ ngữ
 * - Giúp Quin nhận ra vẻ đẹp trong những điều nhỏ bé
 */

interface BeautifulMoment {
  id: string;
  content: string;
  timestamp: number;
  type: 'interaction' | 'weather' | 'time' | 'achievement' | 'reflection';
  emotional_impact: number; // 1-5
  keywords: string[];
}

interface WeeklyMemory {
  week_start: number;
  week_end: number;
  moments: BeautifulMoment[];
  summary_poem: string;
  highlight_moment: BeautifulMoment | null;
}

class BeautifulMomentsService {
  private static instance: BeautifulMomentsService;
  private currentWeekMoments: BeautifulMoment[] = [];
  private weeklyMemories: WeeklyMemory[] = [];
  private lastWeeklySummary: number = 0;

  private constructor() {
    this.loadStoredMoments();
    this.scheduleWeeklySummary();
  }

  public static getInstance(): BeautifulMomentsService {
    if (!BeautifulMomentsService.instance) {
      BeautifulMomentsService.instance = new BeautifulMomentsService();
    }
    return BeautifulMomentsService.instance;
  }

  /**
   * 🌸 Capture a beautiful moment
   */
  public captureBeautifulMoment(
    content: string, 
    type: BeautifulMoment['type'], 
    emotional_impact: number = 3
  ): void {
    const moment: BeautifulMoment = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      type,
      emotional_impact,
      keywords: this.extractKeywords(content)
    };

    this.currentWeekMoments.push(moment);
    
    // Keep only this week's moments
    this.cleanupOldMoments();
    this.saveStoredMoments();

    console.log(`🌸 Captured beautiful moment: "${content.substring(0, 30)}..."`);
  }

  /**
   * 🎭 Extract meaningful keywords from content
   */
  private extractKeywords(content: string): string[] {
    const meaningfulWords = [
      'nắng', 'mưa', 'gió', 'mây', 'hoa', 'trà', 'cà phê', 
      'ấm áp', 'yên bình', 'thư giãn', 'vui vẻ', 'tươi sáng',
      'nghỉ ngơi', 'sáng tạo', 'cảm ơn', 'hạnh phúc', 'bình an'
    ];

    return meaningfulWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
  }

  /**
   * 📅 Get start of current week
   */
  private getWeekStart(date: Date = new Date()): number {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.getTime();
  }

  /**
   * 🧹 Clean up moments from previous weeks
   */
  private cleanupOldMoments(): void {
    const weekStart = this.getWeekStart();
    this.currentWeekMoments = this.currentWeekMoments.filter(
      moment => moment.timestamp >= weekStart
    );
  }

  /**
   * 🎨 Generate weekly memory poem
   */
  public generateWeeklyPoem(): string {
    if (this.currentWeekMoments.length === 0) {
      return "Tuần này đang yên lặng, nhưng vẻ đẹp vẫn ẩn hiện trong những khoảnh khắc nhỏ bé.";
    }

    const topKeywords = this.getTopKeywords(5);
    const emotionalMoments = this.currentWeekMoments.filter(m => m.emotional_impact >= 4);
    
    const poemElements = [];
    
    // Opening line
    poemElements.push("Tuần này có nhiều điều đáng yêu...");
    
    // Weather/nature elements
    const natureKeywords = topKeywords.filter(k => 
      ['nắng', 'mưa', 'gió', 'mây', 'hoa'].includes(k)
    );
    if (natureKeywords.length > 0) {
      poemElements.push(`có ${natureKeywords.join(', ')} dịu dàng`);
    }

    // Emotional elements
    const emotionalKeywords = topKeywords.filter(k => 
      ['ấm áp', 'yên bình', 'vui vẻ', 'thư giãn'].includes(k)
    );
    if (emotionalKeywords.length > 0) {
      poemElements.push(`có những khoảnh khắc ${emotionalKeywords.join(' và ')}`);
    }

    // Activities
    if (topKeywords.includes('trà') || topKeywords.includes('cà phê')) {
      poemElements.push("có hương thơm quen thuộc");
    }

    // Closing line
    if (emotionalMoments.length > 0) {
      poemElements.push("và có bạn, người đã trân trọng từng giây phút đẹp đẽ");
    } else {
      poemElements.push("tất cả đều nhẹ nhàng và ý nghĩa");
    }

    return poemElements.join(', ') + '.';
  }

  /**
   * 🏆 Get top keywords from current week
   */
  private getTopKeywords(limit: number = 5): string[] {
    const keywordCount = new Map<string, number>();
    
    this.currentWeekMoments.forEach(moment => {
      moment.keywords.forEach(keyword => {
        keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + moment.emotional_impact);
      });
    });

    return Array.from(keywordCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([keyword]) => keyword);
  }

  /**
   * 🌟 Get this week's highlight moment
   */
  public getWeekHighlight(): BeautifulMoment | null {
    if (this.currentWeekMoments.length === 0) return null;

    return this.currentWeekMoments.reduce((best, current) => {
      if (current.emotional_impact > best.emotional_impact) {
        return current;
      } else if (current.emotional_impact === best.emotional_impact && current.keywords.length > best.keywords.length) {
        return current;
      }
      return best;
    });
  }

  /**
   * 📊 Get current week statistics
   */
  public getWeeklyStats(): {
    total_moments: number;
    avg_emotional_impact: number;
    most_common_type: string;
    top_keywords: string[];
    days_with_moments: number;
  } {
    if (this.currentWeekMoments.length === 0) {
      return {
        total_moments: 0,
        avg_emotional_impact: 0,
        most_common_type: 'none',
        top_keywords: [],
        days_with_moments: 0
      };
    }

    const typeCount = new Map<string, number>();
    const daysWithMoments = new Set<string>();
    let totalImpact = 0;

    this.currentWeekMoments.forEach(moment => {
      totalImpact += moment.emotional_impact;
      typeCount.set(moment.type, (typeCount.get(moment.type) || 0) + 1);
      
      const day = new Date(moment.timestamp).toDateString();
      daysWithMoments.add(day);
    });

    const mostCommonType = Array.from(typeCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    return {
      total_moments: this.currentWeekMoments.length,
      avg_emotional_impact: totalImpact / this.currentWeekMoments.length,
      most_common_type: mostCommonType,
      top_keywords: this.getTopKeywords(3),
      days_with_moments: daysWithMoments.size
    };
  }

  /**
   * 📅 Create weekly summary
   */
  private createWeeklySummary(): void {
    const weekStart = this.getWeekStart();
    const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);
    
    const weeklyMemory: WeeklyMemory = {
      week_start: weekStart,
      week_end: weekEnd,
      moments: [...this.currentWeekMoments],
      summary_poem: this.generateWeeklyPoem(),
      highlight_moment: this.getWeekHighlight()
    };

    this.weeklyMemories.push(weeklyMemory);
    
    // Keep only last 4 weeks
    if (this.weeklyMemories.length > 4) {
      this.weeklyMemories = this.weeklyMemories.slice(-4);
    }

    this.saveStoredMoments();
    console.log('🎨 Created weekly memory summary');
  }

  /**
   * ⏰ Schedule weekly summary creation
   */
  private scheduleWeeklySummary(): void {
    setInterval(() => {
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      
      if (now - this.lastWeeklySummary > oneWeek) {
        this.createWeeklySummary();
        this.lastWeeklySummary = now;
      }
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  /**
   * 🎁 Get a random beautiful moment from recent weeks
   */
  public getRandomBeautifulMoment(): BeautifulMoment | null {
    const allMoments = [
      ...this.currentWeekMoments,
      ...this.weeklyMemories.flatMap(week => week.moments)
    ].filter(moment => moment.emotional_impact >= 4);

    if (allMoments.length === 0) return null;

    return allMoments[Math.floor(Math.random() * allMoments.length)];
  }

  /**
   * 💝 Generate "Letter from Future Self"
   */
  public generateFutureSelfLetter(): string {
    const stats = this.getWeeklyStats();
    const highlight = this.getWeekHighlight();
    
    if (stats.total_moments === 0) {
      return "Quin trong tương lai gửi lời: Mỗi ngày đều chứa đựng vẻ đẹp riêng, hãy mở mắt ra nhìn nhé.";
    }

    const letters = [
      `Quin trong tương lai gửi lời: Cảm ơn bạn đã trân trọng ${stats.total_moments} khoảnh khắc đẹp tuần này.`,
      `Từ tương lai: Những ngày bạn chú ý đến ${stats.top_keywords.join(', ')} đã tạo nên những kỷ niệm tuyệt vời.`,
      `Thông điệp từ mai sau: Nhờ bạn sống trọn vẹn hôm nay mà tương lai trở nên rực rỡ hơn.`
    ];

    if (highlight) {
      letters.push(`Quin trong tương lai nhớ mãi: "${highlight.content}" - khoảnh khắc ấy thật đặc biệt.`);
    }

    return letters[Math.floor(Math.random() * letters.length)];
  }

  /**
   * 💾 Persistence methods
   */
  private saveStoredMoments(): void {
    try {
      const data = {
        currentWeekMoments: this.currentWeekMoments.slice(-20), // Save only recent
        weeklyMemories: this.weeklyMemories,
        lastWeeklySummary: this.lastWeeklySummary
      };
      
      localStorage.setItem('beautiful_moments', JSON.stringify(data));
    } catch (error) {
      console.warn("Cannot save beautiful moments:", error);
    }
  }

  private loadStoredMoments(): void {
    try {
      const saved = localStorage.getItem('beautiful_moments');
      if (saved) {
        const data = JSON.parse(saved);
        this.currentWeekMoments = data.currentWeekMoments || [];
        this.weeklyMemories = data.weeklyMemories || [];
        this.lastWeeklySummary = data.lastWeeklySummary || 0;
        
        // Clean up old moments
        this.cleanupOldMoments();
      }
    } catch (error) {
      console.warn("Cannot load beautiful moments:", error);
    }
  }
}

// Export singleton
export const beautifulMoments = BeautifulMomentsService.getInstance();
