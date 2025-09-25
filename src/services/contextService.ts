/**
 * 🌸 SIMPLIFIED CONTEXT SERVICE - Dành riêng cho "Người Bạn Đồng Hành AI"
 * 
 * Service này chỉ tập trung vào:
 * - Theo dõi thời gian và ngữ cảnh cơ bản
 * - Hỗ trợ AI tạo bong bóng tương tác ấm áp
 * 
 * Loại bỏ hoàn toàn clipboard monitoring để tiết kiệm API request
 */

import { getCurrentTimeInfo } from './weatherService';

// Simplified Types - Chỉ giữ lại những gì cần thiết
interface ContextData {
  activeWindow: string | null;
  timeContext: any;
}

// Simplified Context Manager - Chỉ tập trung vào thời gian và cửa sổ
class ContextManager {
  private static instance: ContextManager;
  private currentContext: ContextData;
  private isMonitoring = false;
  private listeners: Array<(context: ContextData) => void> = [];

  private constructor() {
    this.currentContext = {
      activeWindow: null,
      timeContext: getCurrentTimeInfo(),
    };
  }

  public static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  /**
   * 🌸 Khởi động monitoring context - Chỉ thời gian cơ bản
   */
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log("🌸 Context Service đã khởi động - theo dõi thời gian cơ bản...");
    
    // Update time context every 30 seconds
    setInterval(() => {
      this.currentContext.timeContext = getCurrentTimeInfo();
      this.notifyListeners();
    }, 30000);
  }

  /**
   * 👂 Subscribe to context changes
   */
  public addListener(callback: (context: ContextData) => void): void {
    this.listeners.push(callback);
  }

  /**
   * 🔇 Unsubscribe from context changes  
   */
  public removeListener(callback: (context: ContextData) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * 📢 Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentContext);
      } catch (error) {
        console.error("Error in context listener:", error);
      }
    });
  }

  /**
   * 📊 Get current context
   */
  public getCurrentContext(): ContextData {
    return { ...this.currentContext };
  }

  /**
   * 🛑 Stop monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log("🛑 Context monitoring đã dừng");
  }
}

// Export singleton instance
export const contextManager = ContextManager.getInstance();

// Helper functions for external use
export const startContextMonitoring = () => contextManager.startMonitoring();
export const getCurrentContext = () => contextManager.getCurrentContext();
export const addContextListener = (callback: (context: ContextData) => void) => 
  contextManager.addListener(callback);
export const removeContextListener = (callback: (context: ContextData) => void) => 
  contextManager.removeListener(callback);

// Types export
export type { ContextData };