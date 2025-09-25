/**
 * Service theo dõi thời gian sử dụng ứng dụng
 */
class TimeTrackingService {
  private static instance: TimeTrackingService;
  private startTime: number;
  private lastResetTime: number;
  private readonly LONG_SESSION_THRESHOLD = 20 * 60 * 1000; // 20 phút tính bằng milliseconds

  private constructor() {
    this.startTime = Date.now();
    this.lastResetTime = Date.now();
  }

  public static getInstance(): TimeTrackingService {
    if (!TimeTrackingService.instance) {
      TimeTrackingService.instance = new TimeTrackingService();
    }
    return TimeTrackingService.instance;
  }

  /**
   * Kiểm tra xem đã sử dụng lâu chưa (> 20 phút kể từ lần reset cuối)
   */
  public isLongSession(): boolean {
    const currentTime = Date.now();
    const timeSinceLastReset = currentTime - this.lastResetTime;
    return timeSinceLastReset >= this.LONG_SESSION_THRESHOLD;
  }

  /**
   * Lấy thời gian đã sử dụng kể từ lần reset cuối (tính bằng phút)
   */
  public getTimeSinceLastReset(): number {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastResetTime;
    return Math.floor(timeDiff / (1000 * 60)); // Trả về số phút
  }

  /**
   * Lấy tổng thời gian sử dụng ứng dụng (tính bằng phút)
   */
  public getTotalUsageTime(): number {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.startTime;
    return Math.floor(timeDiff / (1000 * 60)); // Trả về số phút
  }

  /**
   * Reset thời gian - gọi sau khi đã hiển thị thông điệp nghỉ ngơi
   */
  public resetTimer(): void {
    this.lastResetTime = Date.now();
    console.log("⏰ Timer đã được reset - bắt đầu theo dõi phiên mới");
  }

  /**
   * Lấy thông tin chi tiết về thời gian sử dụng
   */
  public getUsageStats() {
    return {
      totalMinutes: this.getTotalUsageTime(),
      minutesSinceLastReset: this.getTimeSinceLastReset(),
      isLongSession: this.isLongSession(),
      startTime: new Date(this.startTime).toLocaleString('vi-VN'),
      lastResetTime: new Date(this.lastResetTime).toLocaleString('vi-VN'),
    };
  }
}

// Export singleton instance
export const timeTracker = TimeTrackingService.getInstance();
