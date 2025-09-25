import { Select, Slider, TextInput, Button, Group, Text, Divider, Badge } from "@mantine/core";
import { SelectItem } from "./settings/SelectItem";
import languages from "../../locale/languages";
import SettingSwitch from "./settings/SettingSwitch";
import { useTranslation } from "react-i18next";
import { handleSettingChange } from "../../utils/handleSettingChange";
import { useSettingStore } from "../../hooks/useSettingStore";
import { memo, useCallback, useState } from "react";
import { IconLanguage, IconMapPin, IconBrain, IconClockHour4, IconDeviceFloppy } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/tauri";
import SettingButton from "./settings/SettingButton";
import { DispatchType } from "../../types/IEvents";
import { vietnamCities, findCityByValue } from "../../data/vietnamCities";
import { notifications } from '@mantine/notifications';

interface ISettingsContent {
    title: string,
    description: string,
    checked: boolean,
    dispatchType: DispatchType,
    component?: React.ReactNode,
}

function Settings() {
    try {
        const { t, i18n } = useTranslation();
        const { 
            allowAutoStartUp, allowPetAboveTaskbar, allowPetInteraction, allowOverridePetScale, 
            petScale, allowPetClimbing, city, aiEnabled, aiFrequencyMinutes 
        } = useSettingStore();
    
    // 🏙️ Local state for city selection
    const [selectedCity, setSelectedCity] = useState(city);
    const [tempAiFrequency, setTempAiFrequency] = useState(aiFrequencyMinutes);

    const settingSwitches: ISettingsContent[] = [
        {
            title: t("Auto start-up"),
            description: t("Automatically open WindowPet every time u start the computer"),
            checked: allowAutoStartUp,
            dispatchType: DispatchType.SwitchAutoWindowStartUp,
        },
        {
            title: "🧠 Người Bạn Đồng Hành AI",
            description: "Tự động khởi chạy Người Bạn Đồng Hành AI mỗi khi bạn khởi động máy tính",
            checked: aiEnabled,
            dispatchType: DispatchType.ToggleAI,
            component: aiEnabled &&
                <div style={{ marginTop: '1rem' }}>
                    <Text size="sm" style={{ marginBottom: '0.5rem', color: '#666' }}>
                        <IconClockHour4 size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
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
                        style={{ marginTop: '0.5rem' }}
                    />
                    <Text size="xs" style={{ marginTop: '0.5rem', color: '#888', fontStyle: 'italic' }}>
                        Thời gian AI sẽ chờ giữa các thông điệp để tránh làm phiền bạn
                    </Text>
                </div>
        },
        {
            title: t("Pet above taskbar"),
            description: t("Make the pet float above taskbar (For Window User)"),
            checked: allowPetAboveTaskbar,
            dispatchType: DispatchType.SwitchPetAboveTaskbar,
        },
        {
            title: t("Pet interactions"),
            description: t("If allow pet interaction turn on, user will be able to drag and move the pet around their window"),
            checked: allowPetInteraction,
            dispatchType: DispatchType.SwitchAllowPetInteraction,
        },
        {
            title: t("Allow pet climb"),
            description: t("If allow pet climb turn on, pet will be able to climb on the left, right, and top of the window"),
            checked: allowPetClimbing,
            dispatchType: DispatchType.SwitchAllowPetClimbing,
        },
        {
            title: t("Override pet scale"),
            description: t("Allow the program to adjust all pet sizes by a fixed amount determined by your preferences, ignoring any individual pet scales"),
            checked: allowOverridePetScale,
            dispatchType: DispatchType.OverridePetScale,
            component: allowOverridePetScale &&
                <Slider min={0.1} max={1} defaultValue={petScale} my={"sm"} step={0.1} onChangeEnd={(value) => handleSettingChange(DispatchType.ChangePetScale, value)} />,
        }
    ];

    const openConfigFolder = useCallback(async () => {
        const configPath: string = await invoke("combine_config_path", { config_name: "" });
        await invoke("open_folder", { path: configPath });
    }, []);

    // 💾 Save city handler
    const handleSaveCity = useCallback(() => {
        handleSettingChange(DispatchType.ChangeCity, selectedCity);
        notifications.show({
            title: '🏙️ Thành phố đã được lưu',
            message: `Đã cập nhật thành phố thành "${findCityByValue(selectedCity)?.label || selectedCity}"`,
            color: 'green',
        });
    }, [selectedCity]);

    // 🌍 Prepare city data for Select
    const citySelectData = vietnamCities.map(city => ({
        value: city.value,
        label: `${city.label} (${city.region})`,
        group: city.region
    }));

        return (
            <>
                {settingSwitches.map((settingSwitch, index) => (
                <SettingSwitch 
                    key={index}
                    title={settingSwitch.title} 
                    description={settingSwitch.description} 
                    checked={settingSwitch.checked} 
                    dispatchType={settingSwitch.dispatchType}
                    component={settingSwitch.component}
                />
            ))}
            <SettingButton title={t("App Config Path")} description={t(`The location path of where the app store your config such as settings, pets, etc`)} btnLabel={t("Open")} btnFunction={openConfigFolder} />
            <Select
                leftSection={<IconLanguage />}
                allowDeselect={false}
                checkIconPosition={"right"}
                my={"sm"}
                label={t("Language")}
                placeholder="Pick one"
                // itemComponent={SelectItem}
                data={languages}
                maxDropdownHeight={400}
                value={i18n.language}
                onChange={(value) => handleSettingChange(DispatchType.ChangeAppLanguage, value as string)}
            />
            <Divider my="xl" label="🌍 Cài đặt vị trí & AI" labelPosition="center" />
            
            <div style={{ marginBottom: '1rem' }}>
                <Select
                    leftSection={<IconMapPin />}
                    label="🏙️ Thành phố"
                    placeholder="Chọn thành phố của bạn"
                    description="Thành phố sẽ được sử dụng để lấy thông tin thời tiết cho AI"
                    data={citySelectData}
                    value={selectedCity}
                    onChange={(value) => setSelectedCity(value || 'Ho Chi Minh City')}
                    searchable
                    maxDropdownHeight={300}
                    comboboxProps={{ transitionProps: { transition: 'fade', duration: 200 } }}
                />
                
                <Group justify="space-between" mt="sm">
                    <div>
                        {selectedCity !== city && (
                            <Badge color="orange" size="sm">Chưa lưu</Badge>
                        )}
                        {selectedCity === city && (
                            <Badge color="green" size="sm">Đã lưu</Badge>
                        )}
                    </div>
                    <Button 
                        leftSection={<IconDeviceFloppy size={16} />}
                        variant="light"
                        size="sm"
                        onClick={handleSaveCity}
                        disabled={selectedCity === city}
                    >
                        Lưu thay đổi
                    </Button>
                </Group>
            </div>

            {aiEnabled && (
                <div style={{ 
                    background: 'rgba(0, 150, 255, 0.05)', 
                    border: '1px solid rgba(0, 150, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                }}>
                    <Text size="sm" fw={500} style={{ marginBottom: '0.5rem', color: '#0066cc' }}>
                        <IconBrain size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                        Trạng thái AI: Đang hoạt động
                    </Text>
                    <Text size="xs" style={{ color: '#666' }}>
                        • Tần suất tương tác: {aiFrequencyMinutes} phút<br />
                        • Chống lặp nội dung: Bật<br />
                        • 4 phương pháp sáng tạo: Ẩn dụ, Giác quan, Hỏi tu từ, Kể chuyện<br />
                        • API throttling: 30 phút/lần cho thời tiết
                    </Text>
                </div>
                )}
            </>
        );
    } catch (error) {
        console.error('🚨 Settings Component Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return <div style={{color: 'red', padding: '20px', fontSize: '16px'}}>
            Settings Error: {errorMessage}
        </div>;
    }
}

export default memo(Settings);