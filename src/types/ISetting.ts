import { MemoExoticComponent } from "react";

export interface IGetAppSetting {
    withErrorDialog?: boolean,
    configName?: string,
    key?: string,
}

export enum ColorSchemeType {
    Light = "light",
    Dark = "dark",
}

export type ColorScheme = ColorSchemeType.Light | ColorSchemeType.Dark;

export enum ESettingTab {
    MyPets = 0,
    PetShop = 1,
    AddPet = 2,
    Scenarios = 3,
    Settings = 4,
    About = 5,
}

export interface ISettingTabs {
    Component: MemoExoticComponent<() => JSX.Element> | React.ComponentType<any>,
    title: string,
    description: string,
    Icon: React.ReactNode;
    label: string;
    tab: ESettingTab,
}

export enum DefaultConfigName {
    PET_LINKER = "pet_linker.json",
}