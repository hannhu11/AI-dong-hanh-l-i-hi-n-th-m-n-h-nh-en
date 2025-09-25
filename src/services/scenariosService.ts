/**
 * 🎯 SCENARIOS SERVICE - Tối ưu hóa Workflow với AI
 * 
 * Service quản lý các kịch bản tự động hóa workflow:
 * - Tạo và lưu trữ scenarios
 * - Thực thi chuỗi actions 
 * - AI suggestions dựa trên context
 * - Smart workflow optimization
 * 
 * Phát triển bởi: Hàn Như | Dự án: Trợ Lý Nhận Thức AI
 */

import { invoke } from '@tauri-apps/api/tauri';
import { generateThoughtMessage } from './geminiService';
import { getCurrentContext } from './contextService';

// Types
export type ActionType = 'open_app' | 'open_url' | 'open_folder' | 'run_command' | 'delay';

export interface ScenarioAction {
  id: string;
  type: ActionType;
  name: string;
  target: string; // App path, URL, folder path, or command
  delay?: number; // Delay in milliseconds
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  actions: ScenarioAction[];
  category: 'work' | 'personal' | 'development' | 'entertainment' | 'custom';
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  tags: string[];
  isActive: boolean;
}

export interface ScenarioExecutionResult {
  success: boolean;
  executedActions: number;
  failedActions: string[];
  duration: number;
  message: string;
}

// Predefined scenarios templates
const SCENARIO_TEMPLATES: Omit<Scenario, 'id' | 'createdAt' | 'lastUsed' | 'usageCount'>[] = [
  {
    name: "🌅 Bắt đầu ngày làm việc",
    description: "Chuẩn bị môi trường làm việc hoàn hảo",
    icon: "🌅",
    category: "work",
    actions: [
      {
        id: "1", type: "open_app", name: "Mở Spotify", 
        target: "spotify:", description: "Phát nhạc tập trung"
      },
      {
        id: "2", type: "open_url", name: "Gmail", 
        target: "https://mail.google.com", description: "Kiểm tra email"
      },
      {
        id: "3", type: "open_url", name: "Calendar", 
        target: "https://calendar.google.com", description: "Xem lịch trình"
      },
      {
        id: "4", type: "delay", name: "Nghỉ ngắn", 
        target: "2000", description: "Chờ ứng dụng load"
      }
    ],
    tags: ["morning", "productivity", "work"],
    isActive: true
  },
  {
    name: "💻 Khởi động Dev Environment",
    description: "Mở tất cả tools cần thiết cho coding",
    icon: "💻",
    category: "development", 
    actions: [
      {
        id: "1", type: "open_app", name: "VS Code", 
        target: "code", description: "IDE chính"
      },
      {
        id: "2", type: "open_app", name: "Terminal", 
        target: "wt", description: "Windows Terminal"
      },
      {
        id: "3", type: "open_url", name: "GitHub", 
        target: "https://github.com", description: "Version control"
      },
      {
        id: "4", type: "open_folder", name: "Projects", 
        target: "D:\\Projects", description: "Thư mục dự án"
      }
    ],
    tags: ["development", "coding", "tools"],
    isActive: true
  },
  {
    name: "🎵 Thư giãn & Giải trí",
    description: "Chế độ thư giãn sau giờ làm việc",
    icon: "🎵",
    category: "entertainment",
    actions: [
      {
        id: "1", type: "open_url", name: "YouTube Music", 
        target: "https://music.youtube.com", description: "Nghe nhạc thư giãn"
      },
      {
        id: "2", type: "open_app", name: "Steam", 
        target: "steam://", description: "Gaming platform"
      },
      {
        id: "3", type: "open_url", name: "Netflix", 
        target: "https://netflix.com", description: "Phim & TV"
      }
    ],
    tags: ["entertainment", "music", "gaming"],
    isActive: true
  }
];

// Scenarios Manager Class
class ScenariosManager {
  private static instance: ScenariosManager;
  private scenarios: Scenario[] = [];
  private isExecuting = false;
  private listeners: Array<(scenarios: Scenario[]) => void> = [];

  private constructor() {
    this.loadScenarios();
  }

  public static getInstance(): ScenariosManager {
    if (!ScenariosManager.instance) {
      ScenariosManager.instance = new ScenariosManager();
    }
    return ScenariosManager.instance;
  }

  /**
   * 📥 Load scenarios from localStorage
   */
  private loadScenarios(): void {
    try {
      const stored = localStorage.getItem('cognitive_ai_scenarios');
      if (stored) {
        this.scenarios = JSON.parse(stored).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          lastUsed: s.lastUsed ? new Date(s.lastUsed) : undefined
        }));
      } else {
        // Initialize with templates
        this.scenarios = SCENARIO_TEMPLATES.map(template => ({
          ...template,
          id: this.generateId(),
          createdAt: new Date(),
          usageCount: 0
        }));
        this.saveScenarios();
      }
      
      console.log(`🎯 Đã load ${this.scenarios.length} scenarios`);
    } catch (error) {
      console.error("Error loading scenarios:", error);
      this.scenarios = [];
    }
  }

  /**
   * 💾 Save scenarios to localStorage
   */
  private saveScenarios(): void {
    try {
      localStorage.setItem('cognitive_ai_scenarios', JSON.stringify(this.scenarios));
      this.notifyListeners();
    } catch (error) {
      console.error("Error saving scenarios:", error);
    }
  }

  /**
   * 🆕 Create new scenario
   */
  public createScenario(scenario: Omit<Scenario, 'id' | 'createdAt' | 'usageCount'>): Scenario {
    const newScenario: Scenario = {
      ...scenario,
      id: this.generateId(),
      createdAt: new Date(),
      usageCount: 0
    };

    this.scenarios.push(newScenario);
    this.saveScenarios();

    console.log(`✨ Đã tạo scenario mới: ${newScenario.name}`);
    return newScenario;
  }

  /**
   * ✏️ Update existing scenario
   */
  public updateScenario(id: string, updates: Partial<Scenario>): boolean {
    const index = this.scenarios.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.scenarios[index] = { ...this.scenarios[index], ...updates };
    this.saveScenarios();

    console.log(`📝 Đã cập nhật scenario: ${this.scenarios[index].name}`);
    return true;
  }

  /**
   * 🗑️ Delete scenario
   */
  public deleteScenario(id: string): boolean {
    const index = this.scenarios.findIndex(s => s.id === id);
    if (index === -1) return false;

    const deleted = this.scenarios.splice(index, 1)[0];
    this.saveScenarios();

    console.log(`🗑️ Đã xóa scenario: ${deleted.name}`);
    return true;
  }

  /**
   * 🚀 Execute scenario
   */
  public async executeScenario(id: string): Promise<ScenarioExecutionResult> {
    if (this.isExecuting) {
      return {
        success: false,
        executedActions: 0,
        failedActions: [],
        duration: 0,
        message: "Đang thực thi scenario khác, vui lòng đợi!"
      };
    }

    const scenario = this.scenarios.find(s => s.id === id);
    if (!scenario) {
      return {
        success: false,
        executedActions: 0,
        failedActions: ["Scenario not found"],
        duration: 0,
        message: "Không tìm thấy scenario!"
      };
    }

    this.isExecuting = true;
    const startTime = Date.now();
    let executedCount = 0;
    const failedActions: string[] = [];

    console.log(`🚀 Bắt đầu thực thi scenario: ${scenario.name}`);

    // Show AI message
    window.dispatchEvent(new CustomEvent('ai-message', {
      detail: {
        text: `Đang thực thi "${scenario.name}" - ${scenario.actions.length} hành động`,
        timestamp: Date.now(),
        petId: 'scenario-ai',
        isContextMessage: true
      }
    }));

    try {
      for (const action of scenario.actions) {
        try {
          console.log(`⚡ Thực thi: ${action.name}`);
          
          switch (action.type) {
            case 'open_app':
              await this.executeOpenApp(action.target);
              break;
            case 'open_url':
              await this.executeOpenUrl(action.target);
              break;
            case 'open_folder':
              await this.executeOpenFolder(action.target);
              break;
            case 'run_command':
              await this.executeCommand(action.target);
              break;
            case 'delay':
              await this.executeDelay(parseInt(action.target));
              break;
          }
          
          executedCount++;
          
          // Small delay between actions
          await this.executeDelay(500);
          
        } catch (error) {
          console.error(`❌ Lỗi thực thi ${action.name}:`, error);
          failedActions.push(action.name);
        }
      }

      // Update usage stats
      scenario.lastUsed = new Date();
      scenario.usageCount++;
      this.saveScenarios();

      const duration = Date.now() - startTime;
      const isSuccess = failedActions.length === 0;

      // Show completion message
      const completionMessage = isSuccess 
        ? `✅ Hoàn thành "${scenario.name}" trong ${Math.round(duration/1000)}s`
        : `⚠️ "${scenario.name}" hoàn thành với ${failedActions.length} lỗi`;

      window.dispatchEvent(new CustomEvent('ai-message', {
        detail: {
          text: completionMessage,
          timestamp: Date.now(),
          petId: 'scenario-ai',
          isContextMessage: true
        }
      }));

      return {
        success: isSuccess,
        executedActions: executedCount,
        failedActions,
        duration,
        message: completionMessage
      };

    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 💡 Get AI suggestions for new scenarios
   */
  public async getScenarioSuggestions(): Promise<string[]> {
    try {
      const context = getCurrentContext();
      const activeWindow = context.activeWindow || "Unknown";
      
      const suggestionPrompt = `Dựa trên cửa sổ đang hoạt động "${activeWindow}", hãy đề xuất 3 kịch bản tự động hóa hữu ích (mỗi kịch bản 1 dòng, dưới 15 từ):`;
      
      const response = await generateThoughtMessage({
        timeOfDay: context.timeContext.timeOfDay,
        weather: null,
        city: "Ho Chi Minh City",
        customPrompt: suggestionPrompt
      });

      if (response.success && response.message) {
        return response.message.split('\n').filter(line => line.trim().length > 0);
      }
    } catch (error) {
      console.error("Error getting scenario suggestions:", error);
    }
    
    return [
      "🌅 Kịch bản bắt đầu ngày làm việc",
      "🎯 Kịch bản tập trung coding",
      "🎵 Kịch bản thư giãn buổi tối"
    ];
  }

  /**
   * 🔍 Search scenarios
   */
  public searchScenarios(query: string): Scenario[] {
    const lowercaseQuery = query.toLowerCase();
    return this.scenarios.filter(s => 
      s.name.toLowerCase().includes(lowercaseQuery) ||
      s.description.toLowerCase().includes(lowercaseQuery) ||
      s.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Execution helpers
  private async executeOpenApp(target: string): Promise<void> {
    if (target.includes('://')) {
      // Protocol handler (steam://, spotify:, etc.)
      await invoke('open_folder', { path: target });
    } else {
      // Regular app command
      await invoke('execute_shell_command', { command: target });
    }
  }

  private async executeOpenUrl(target: string): Promise<void> {
    await invoke('open_folder', { path: target });
  }

  private async executeOpenFolder(target: string): Promise<void> {
    await invoke('open_folder', { path: target });
  }

  private async executeCommand(target: string): Promise<void> {
    await invoke('execute_shell_command', { command: target });
  }

  private async executeDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utilities
  private generateId(): string {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.scenarios]);
      } catch (error) {
        console.error("Error in scenario listener:", error);
      }
    });
  }

  // Public getters
  public getAllScenarios(): Scenario[] {
    return [...this.scenarios];
  }

  public getScenario(id: string): Scenario | undefined {
    return this.scenarios.find(s => s.id === id);
  }

  public getScenariosByCategory(category: Scenario['category']): Scenario[] {
    return this.scenarios.filter(s => s.category === category);
  }

  public addListener(callback: (scenarios: Scenario[]) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (scenarios: Scenario[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  public isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }
}

// Export singleton
export const scenariosManager = ScenariosManager.getInstance();

// Helper functions
export const createScenario = (scenario: Omit<Scenario, 'id' | 'createdAt' | 'usageCount'>) => 
  scenariosManager.createScenario(scenario);

export const executeScenario = (id: string) => scenariosManager.executeScenario(id);
export const getAllScenarios = () => scenariosManager.getAllScenarios();
export const getScenarioSuggestions = () => scenariosManager.getScenarioSuggestions();
export const searchScenarios = (query: string) => scenariosManager.searchScenarios(query);

// Types already exported above, no need to re-export
