import axios from 'axios';
import TokenService from './token.service';
import { api as apiIns, setNewHeaders } from '../api/api';

const login = async data => {
    // const login_response = await apiIns.post('login', data);
    // const token_res = await token();
    // const response = { ...login_response, ...token_res };
    // console.log(`token_res: ${JSON.stringify(token_res, null, 4)}`);
    const response = await apiIns.post('login', data);
    setNewHeaders(response);
    return response;
};

const token = async () => {
    const response = apiIns.get('token');
    // setNewHeaders(response);
    return response;
};

const refreshToken = url => {
    const config = {
        withCredentials: true,
        headers: { 'X-CSRFToken': TokenService.getCSRFToken() }
    };
    const response = axios.post(`${url}token/refresh`, {}, config);
    return response;
};

const logout = async (url, token) => {
    const config = {
        headers: { 'X-CSRFToken': TokenService.getCSRFToken() }
    };
    const response = apiIns.post(`${url}logout`, {}, config);
    return response;
};

const getUser = () => {
    return apiIns.get('user');
};

const AuthService = {
    token,
    refreshToken,
    login,
    logout,
    getUser
};

export default AuthService;
