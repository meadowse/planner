import { useState, createContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import TokenService from '../services/token.service';

export const authContext = createContext();

const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        accessToken: Cookies.get('MMAUTHTOKEN') || null
    });

    const contextValue = {
        authState,
        setAuthState
    };

    return <authContext.Provider value={contextValue}>{children}</authContext.Provider>;
};

export default AuthProvider;
