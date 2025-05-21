import { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext();

export const useHistoryContext = () => {
    return useContext(HistoryContext);
};

export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState(JSON.parse(localStorage.getItem('history')) || []);
    const [route, setRoute] = useState(null);

    const unsavedRoutes = ['user'];

    const addToHistory = routeVal => {
        const tempData = Array.from(history);
        const pathSegments = routeVal.split('/');

        unsavedRoutes.forEach(unsavedRoute => {
            if (!pathSegments.includes(unsavedRoute)) tempData.push(routeVal);
        });

        setRoute(routeVal);
        setHistory(tempData);
    };

    const backToPrevPath = () => {
        if (!history || history.length === 0) {
            setHistory(() => {
                localStorage.setItem('history', JSON.stringify(['/department']));
                return ['/department'];
            });
        } else {
            const tempData = Array.from(history);
            tempData.splice(tempData.length - 1, 1);
            setHistory(tempData);
        }
    };

    useEffect(() => {
        if (!history || history.length === 0) {
            setHistory(() => {
                localStorage.setItem('history', JSON.stringify(['/department']));
                return ['/department'];
            });
        } else {
            const tempData = Array.from(new Set(history));
            setHistory(() => {
                localStorage.setItem('history', JSON.stringify(tempData));
                return tempData;
            });
            console.log(`newHistory: ${JSON.stringify(tempData, null, 4)}`);
        }
    }, [route]);

    return (
        <HistoryContext.Provider value={{ history, addToHistory, backToPrevPath }}>{children}</HistoryContext.Provider>
    );
};
