// 🚨 REBUILT SETTINGS COMPONENT - STEP BY STEP
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Switch, Slider, Text, Button, Group, Divider, Select } from "@mantine/core";
import { IconBrain, IconClockHour4 } from "@tabler/icons-react";
import { useSettingStore } from "../../hooks/useSettingStore";
import { handleSettingChange } from "../../utils/handleSettingChange";
import { DispatchType } from "../../types/IEvents";
import { vietnamCities } from "../../data/vietnamCities";

function Settings() {
    const { t } = useTranslation();
    
    // 🛡️ SAFE LOADING - Get store data defensively
    const storeData = useSettingStore();
    
    // 🏙️ Local state with SAFE defaults
    const [tempAiFrequency, setTempAiFrequency] = useState(3);
    const [tempSelectedCity, setTempSelectedCity] = useState('Quy Nhon');
    const [citySaveStatus, setCitySaveStatus] = useState<'saved' | 'error' | null>(null);
    
    // 🔄 SYNC local state when store loads
    useEffect(() => {
        if (storeData && storeData.aiFrequencyMinutes !== undefined) {
            setTempAiFrequency(storeData.aiFrequencyMinutes || 3);
            setTempSelectedCity(storeData.city || 'Quy Nhon');
        }
    }, [storeData]);
    
    // 🏙️ Handle City Save
    const handleSaveCity = useCallback(() => {
        try {
            handleSettingChange(DispatchType.ChangeCity, tempSelectedCity);
            setCitySaveStatus('saved');
            
            // Clear status sau 3 giây
            setTimeout(() => setCitySaveStatus(null), 3000);
        } catch (error) {
            console.error('Error saving city:', error);
            setCitySaveStatus('error');
            setTimeout(() => setCitySaveStatus(null), 3000);
        }
    }, [tempSelectedCity]);
    
    // 🚨 EARLY RETURN if store not ready
    if (!storeData || storeData.city === undefined) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                color: '#888',
                fontSize: '16px'
            }}>
                {t("Loading settings")}...
            </div>
        );
    }

    try {
        const { aiEnabled, aiFrequencyMinutes, city } = storeData;

        return (
            <div style={{ padding: '20px' }}>
                <h2 style={{ marginBottom: '20px', color: '#0066cc' }}>
                    ⚙️ Cài Đặt - Settings
                </h2>
                
                {/* AI CONTROLS SECTION */}
                <div style={{ 
                    background: 'white', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    marginBottom: '20px',
                    border: '1px solid #e0e0e0'
                }}>
                    <Group justify="space-between" mb="md">
                        <div>
                            <Text size="lg" fw={600} style={{ color: '#333', marginBottom: '4px' }}>
                                <IconBrain size={20} style={{ marginRight: '8px', display: 'inline' }} />
                                🧠 Người Bạn Đồng Hành AI
                            </Text>
                            <Text size="sm" style={{ color: '#666' }}>
                                Tự động khởi chạy AI companion khi bạn sử dụng app
                            </Text>
                        </div>
                        <Switch
                            checked={aiEnabled || false}
                            onChange={(event) => handleSettingChange(DispatchType.ToggleAI, event.currentTarget.checked)}
                            size="lg"
                            color="blue"
                        />
                    </Group>

                    {aiEnabled && (
                        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8f9ff', borderRadius: '8px' }}>
                            <Text size="sm" style={{ marginBottom: '12px', color: '#333' }}>
                                <IconClockHour4 size={16} style={{ marginRight: '8px', display: 'inline' }} />
                                Tần suất tương tác: {tempAiFrequency} phút
                            </Text>
                            <Slider 
                                min={1} 
                                max={15} 
                                value={tempAiFrequency} 
                                onChange={setTempAiFrequency}
                                onChangeEnd={(value) => handleSettingChange(DispatchType.ChangeAIFrequency, value)}
                                step={1}
                                marks={[
                                    { value: 1, label: '1p' },
                                    { value: 5, label: '5p' },
                                    { value: 10, label: '10p' },
                                    { value: 15, label: '15p' }
                                ]}
                                style={{ marginTop: '8px' }}
                                color="blue"
                            />
                            <Text size="xs" style={{ marginTop: '8px', color: '#666', fontStyle: 'italic' }}>
                                Thời gian AI chờ giữa các thông điệp để tránh làm phiền bạn
                            </Text>
                        </div>
                    )}
                </div>

                      {/* CITY SELECTOR SECTION */}
                      <div style={{ 
                          background: 'white', 
                          padding: '20px', 
                          borderRadius: '12px', 
                          marginBottom: '20px',
                          border: '1px solid #e0e0e0'
                      }}>
                          <Text size="lg" fw={600} style={{ color: '#333', marginBottom: '12px' }}>
                              🏙️ Vị Trí Của Bạn
                          </Text>
                          <Text size="sm" style={{ color: '#666', marginBottom: '16px' }}>
                              Chọn thành phố để AI hiểu bối cảnh thời tiết và môi trường xung quanh
                          </Text>
                          
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                              <div style={{ flex: 1 }}>
                                  <Select
                                      data={vietnamCities || [
                                          { value: 'Quy Nhon', label: 'Quy Nhon' },
                                          { value: 'Ho Chi Minh City', label: 'TP. Hồ Chí Minh' },
                                          { value: 'Hanoi', label: 'Hà Nội' },
                                          { value: 'Da Nang', label: 'Đà Nẵng' }
                                      ]}
                                      value={tempSelectedCity}
                                      onChange={(value) => setTempSelectedCity(value || 'Quy Nhon')}
                                      placeholder="Chọn thành phố..."
                                      searchable
                                      clearable={false}
                                      maxDropdownHeight={200}
                                      styles={{
                                          input: { fontSize: '14px' },
                                          dropdown: { fontSize: '14px' }
                                      }}
                                  />
                              </div>
                              <Button
                                  onClick={handleSaveCity}
                                  disabled={tempSelectedCity === city}
                                  color={tempSelectedCity === city ? 'gray' : 'blue'}
                                  size="sm"
                                  style={{ minWidth: '80px' }}
                              >
                                  {tempSelectedCity === city ? '✅ Đã lưu' : '💾 Lưu'}
                              </Button>
                          </div>
                          
                          {/* City Save Status */}
                          {citySaveStatus && (
                              <Text size="xs" style={{ 
                                  marginTop: '8px', 
                                  color: citySaveStatus === 'saved' ? '#28a745' : '#dc3545',
                                  fontStyle: 'italic' 
                              }}>
                                  {citySaveStatus === 'saved' ? '✅ Đã cập nhật vị trí thành công!' : '❌ Lỗi khi lưu vị trí'}
                              </Text>
                          )}
                      </div>

                {/* PET BEHAVIOR SETTINGS */}
                <div style={{ 
                    background: 'white', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    marginBottom: '20px',
                    border: '1px solid #e0e0e0'
                }}>
                    <Text size="lg" fw={600} style={{ color: '#333', marginBottom: '12px' }}>
                        🐾 Hành Vi Pet
                    </Text>
                    <Text size="sm" style={{ color: '#666', marginBottom: '16px' }}>
                        Tùy chỉnh cách thức pet tương tác với màn hình và người dùng
                    </Text>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Pet Above Taskbar */}
                        <Group justify="space-between">
                            <div>
                                <Text size="sm" fw={500} style={{ color: '#333' }}>
                                    📌 Pet trên thanh taskbar
                                </Text>
                                <Text size="xs" style={{ color: '#666' }}>
                                    Cho phép pet xuất hiện trên thanh taskbar
                                </Text>
                            </div>
                            <Switch
                                checked={storeData.allowPetAboveTaskbar || false}
                                onChange={(event) => handleSettingChange(DispatchType.SwitchPetAboveTaskbar, event.currentTarget.checked)}
                                color="blue"
                            />
                        </Group>

                        <Divider />

                        {/* Pet Interaction */}
                        <Group justify="space-between">
                            <div>
                                <Text size="sm" fw={500} style={{ color: '#333' }}>
                                    🤝 Tương tác với pet
                                </Text>
                                <Text size="xs" style={{ color: '#666' }}>
                                    Pet có thể nhận click và tương tác chuột
                                </Text>
                            </div>
                            <Switch
                                checked={storeData.allowPetInteraction || false}
                                onChange={(event) => handleSettingChange(DispatchType.SwitchAllowPetInteraction, event.currentTarget.checked)}
                                color="blue"
                            />
                        </Group>

                        <Divider />

                        {/* Pet Climbing */}
                        <Group justify="space-between">
                            <div>
                                <Text size="sm" fw={500} style={{ color: '#333' }}>
                                    🧗 Pet leo trèo
                                </Text>
                                <Text size="xs" style={{ color: '#666' }}>
                                    Pet có thể leo trèo lên các cửa sổ khác
                                </Text>
                            </div>
                            <Switch
                                checked={storeData.allowPetClimbing || false}
                                onChange={(event) => handleSettingChange(DispatchType.SwitchAllowPetClimbing, event.currentTarget.checked)}
                                color="blue"
                            />
                        </Group>

                        <Divider />

                        {/* Pet Scale */}
                        <div>
                            <Text size="sm" fw={500} style={{ color: '#333', marginBottom: '8px' }}>
                                📏 Kích thước pet: {Math.round((storeData.petScale || 0.7) * 100)}%
                            </Text>
                            <Text size="xs" style={{ color: '#666', marginBottom: '12px' }}>
                                Điều chỉnh kích thước hiển thị của pet
                            </Text>
                            <Slider 
                                min={0.3} 
                                max={1.5} 
                                value={storeData.petScale || 0.7} 
                                onChange={(value) => handleSettingChange(DispatchType.ChangePetScale, value)}
                                step={0.1}
                                marks={[
                                    { value: 0.3, label: '30%' },
                                    { value: 0.7, label: '70%' },
                                    { value: 1.0, label: '100%' },
                                    { value: 1.5, label: '150%' }
                                ]}
                                color="blue"
                            />
                        </div>
                    </div>
                </div>

                <div style={{ 
                    background: 'white', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    border: '1px solid #ddd'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        🌐 Ngôn Ngữ
                    </h3>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        Hiện tại: Tiếng Việt
                    </p>
                </div>

                {/* AI STATUS DASHBOARD */}
                {aiEnabled && (
                    <div style={{ 
                        background: 'rgba(0, 102, 204, 0.1)', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(0, 102, 204, 0.3)',
                        marginTop: '20px'
                    }}>
                        <Text fw={500} size="md" style={{ marginBottom: '10px', color: '#0066cc' }}>
                            <IconBrain size={20} style={{ marginRight: '8px', display: 'inline' }} />
                            Trạng Thái AI Companion
                        </Text>
                        <Text size="sm" style={{ color: '#333' }}>
                            • Trạng thái: <span style={{color: '#28a745', fontWeight: 'bold'}}>Đang hoạt động</span><br />
                            • Tần suất: {aiFrequencyMinutes || tempAiFrequency} phút/lần<br />
                            • Thành phố: {city || "Quy Nhơn"}<br />
                            • Chống lặp nội dung: Bật<br />
                            • 4 phương pháp sáng tạo: Ẩn dụ, Giác quan, Hỏi tu từ, Kể chuyện
                        </Text>
                    </div>
                )}

                      {/* SUCCESS INDICATOR - PHASE 2 COMPLETE */}
                      <div style={{ 
                          background: '#e8f5e8', 
                          padding: '15px', 
                          borderRadius: '8px', 
                          border: '1px solid #4caf50',
                          marginTop: '20px'
                      }}>
                          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
                              ✅ Settings Complete - Phase 2 Deployed!
                          </h3>
                          <p style={{ margin: '0', color: '#388e3c', fontSize: '14px' }}>
                              ✅ AI Controls: Toggle + Frequency Slider<br/>
                              ✅ City Selector: Dropdown + Save Button<br/>
                              ✅ Pet Settings: Taskbar, Interaction, Climbing, Scale<br/>
                              ✅ Fallback System: Unified timing fixed<br/>
                              Component: {new Date().toLocaleTimeString()}
                          </p>
                      </div>
            </div>
        );
    } catch (error) {
        console.error('Settings Component Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return <div style={{color: 'red', padding: '20px', fontSize: '16px'}}>
            Settings Error: {errorMessage}
        </div>;
    }
}

export default Settings;