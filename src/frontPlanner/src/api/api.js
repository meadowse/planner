import axios from 'axios';
// import jwt from 'jsonwebtoken';
import AuthService from '@services/auth.service';
import TokenService from '@services/token.service';

const baseURL = process.env.REACT_APP_URL_API;

const api = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response.status === 403 && originalRequest.url === baseURL + 'token/refresh') {
            return Promise.reject(error);
        }

        // Проверяем, истек ли токен доступа (например, статус 403)
        if (error.response.status === 403 && error.response.statusText === 'Forbidden') {
            originalRequest._retry = true;

            try {
                // Запрос на обновление токена
                const response = await AuthService.refreshToken(baseURL);

                // Устанавливаем новый токен в заголовки
                setNewHeaders(response);
                originalRequest.headers['Authorization'] = `Token ${response.data.access}`;

                // Повторяем оригинальный запрос с новым токеном
                return api(originalRequest);
            } catch (err) {
                // Обработка ошибки обновления токена
                console.error('Не удалось обновить токен', err);
                TokenService.clearTokens();
                window.location.reload();
                return Promise.reject(err);
            }
        }

        // Если ошибка не связана с истечением токена, просто возвращаем ошибку
        return Promise.reject(error);
    }
);

const setNewHeaders = response => {
    // const response = TokenService.getAccessToken(process.env.REACT_APP_URL_API);
    // console.log(`response: ${JSON.stringify(response, null, 4)}`);
    const access_token = response.data.access;
    api.defaults.headers['Authorization'] = `Token ${access_token}`;
    const tokenParts = access_token.split('.');
    const header_payload = tokenParts[0] + '.' + tokenParts[1];
    TokenService.setAccessToken(header_payload);
};

export { api, setNewHeaders };
