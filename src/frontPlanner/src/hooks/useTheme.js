import { useEffect, useState } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('appTheme') || 'light';
    });

    // useEffect(() => {
    //     if (!theme) {
    //         setTheme('light');

    //         localStorage.setItem('appTheme', 'light');
    //         document.documentElement.setAttribute('data-theme', 'light');
    //     } else {
    //         setTheme(theme);
    //         document.documentElement.setAttribute('data-theme', theme);
    //     }
    // }, []);

    useEffect(() => {
        console.log(`theme: ${theme}`);

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    return { theme, setTheme };
};
