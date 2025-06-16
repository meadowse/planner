import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('appTheme') || 'light';
    });

    // Изменить тему приложения
    const onToggleAppTheme = e => {
        if (e.currentTarget.checked) setTheme('dark');
        else setTheme('light');
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    return <ThemeContext.Provider value={{ theme, onToggleAppTheme }}>{children}</ThemeContext.Provider>;
};
