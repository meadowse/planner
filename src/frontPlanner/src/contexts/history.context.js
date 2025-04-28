import { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext();

export const useHistoryContext = () => {
    return useContext(HistoryContext);
};

export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState([]);

    const addToHistory = route => {
        const tempData = Array.from(history);
        tempData.push(route);

        setHistory(tempData);
    };

    const backToPrevPath = () => {
        const tempData = Array.from(history);
        tempData.splice(tempData.length - 1, 1);
        setHistory(tempData);
    };

    useEffect(() => {
        console.log(`saved history: ${JSON.stringify(history, null, 4)}`);
    }, [history]);

    return (
        <HistoryContext.Provider value={{ history, addToHistory, backToPrevPath }}>{children}</HistoryContext.Provider>
    );
};
