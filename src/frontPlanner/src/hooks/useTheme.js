import { useEffect, useState } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return { theme, setTheme };
};
