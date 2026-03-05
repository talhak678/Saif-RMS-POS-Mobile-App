import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ColorTheme = typeof Colors.light;

export interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    colors: ColorTheme;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
    colors: Colors.light,
});

const STORAGE_KEY = 'app_theme_mode';

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(false);
    const [ready, setReady] = useState(false);

    // Load persisted preference
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(val => {
            if (val === 'dark') setIsDark(true);
            setReady(true);
        });
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDark(prev => {
            const next = !prev;
            AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
            return next;
        });
    }, []);

    const colors: ColorTheme = isDark ? Colors.dark : Colors.light;

    // Don't render children until we've read the stored preference
    if (!ready) return null;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextType {
    return useContext(ThemeContext);
}
