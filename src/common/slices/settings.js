import { appDir } from '@tauri-apps/api/path';
import { createSlice } from '@reduxjs/toolkit';
import { readJsonFile, writeJsonFile } from '../../util';

const settingsPath = `${await appDir()}/settings.json`;
const settings = await readJsonFile(settingsPath).catch(console.warn);
export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        theme: settings?.theme ?? 'default',
        uiStyle: settings?.uiStyle ?? 'default',
        account: settings?.account,
        language: settings?.language ?? 'en',
        'instances.showBanner': settings?.['instances.showBanner'] ?? true,
        'instances.modSearchPopout': settings?.['instances.modSearchPopout'] ?? false,
        'instances.defaultResolution': settings?.['instances.defaultResolution'] ?? [900, 500],
        'instances.modSearchSummaries': settings?.['instances.modSearchSummaries'] ?? true
    },
    reducers: {
        set: (state, { payload: [key, value] }) => {
            state[key] = value;
        },
        setTheme: (state, { payload }) => {
            state.theme = payload;
        },
        setAccount: (state, { payload }) => {
            state.account = payload;
        },
        setLanguage: (state, { payload }) => {
            state.language = payload;
        },
        saveSettings: state => {
            writeJsonFile(settingsPath, state);
        }
    }
});

export const { set, setTheme, setAccount, setLanguage, saveSettings } = settingsSlice.actions;
export default settingsSlice.reducer;