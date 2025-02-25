import Cookies from 'js-cookie';
import axios from 'axios';

const setAccessToken = access => {
    if (access) Cookies.set('header_payload', access, { sameSite: 'Strict', secure: false });
};

const getCSRFToken = () => Cookies.get('csrftoken');
const getAccessToken = () => Cookies.get('header_payload');

const clearTokens = () => {
    Cookies.remove('csrftoken');
    Cookies.remove('header_payload');
    // Cookies.remove('access');
};

const TokenService = {
    setAccessToken,
    getCSRFToken,
    getAccessToken,
    clearTokens
};

export default TokenService;
