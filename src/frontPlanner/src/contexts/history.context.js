import { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext();

export const useHistoryContext = () => {
    return useContext(HistoryContext);
};

export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState([]);
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
        const tempData = Array.from(history);
        tempData.splice(tempData.length - 1, 1);
        setHistory(tempData);
    };

    useEffect(() => {
        // const newHistory = [];
        const tempData = Array.from(new Set(history));
        setHistory(tempData);

        // tempData.forEach(route => {
        //     const pathSegments = route.split('/');
        //     unsavedRoutes.forEach(unsavedRoute => {
        //         if (!pathSegments.includes(unsavedRoute)) newHistory.push(route);
        //     });
        // });

        console.log(`newHistory: ${JSON.stringify(tempData, null, 4)}`);
    }, [route]);

    return (
        <HistoryContext.Provider value={{ history, addToHistory, backToPrevPath }}>{children}</HistoryContext.Provider>
    );
};
