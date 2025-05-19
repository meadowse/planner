import { useState, createContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import TokenService from '../services/token.service';

export const authContext = createContext();

const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        accessToken: Cookies.get('MMAUTHTOKEN') || null
    });
    const [authorizedUser, setAuthorizedUser] = useState({});

    const contextValue = {
        authState,
        authorizedUser,
        setAuthState
    };

    async function loadEmployee() {
        await axios
            .post(`${window.location.origin}/api/getDataUser`, { employeeId: Cookies.get('MMUSERID') })
            .then(response => {
                if (response.status === 200) {
                    const { id, mmId, FIO } = response.data && response.data.length !== 0 ? response.data[0] : {};
                    const fio = FIO.trim().split(' ');
                    const employee = { id, mmId, fullName: `${fio[0] + ' ' + fio[1]}` };

                    setAuthorizedUser(employee);
                }
            })
            .catch(error => {
                if (error.response) {
                    console.log('server responded');
                } else if (error.request) {
                    console.log('network error');
                } else {
                    console.log(error);
                }
            });
    }

    useEffect(() => {
        if (!authorizedUser || Object.keys(authorizedUser).length === 0) loadEmployee();
    }, []);

    return <authContext.Provider value={contextValue}>{children}</authContext.Provider>;
};

export default AuthProvider;
