import { useState } from 'react';

// Импорт компонетов
import AuthService from '@services/auth.service';
import TokenService from '@services/token.service';

// Импорт стилей
import './header.css';

export default function Header() {
    const [user, setUser] = useState({});

    const onRetrieveUser = async () => {
        await AuthService.getUser()
            .then(response => {
                if (response.status === 200) alert(`user data: ${JSON.stringify(response.data, null, 4)}`);
            })
            .catch(e => alert(`errors: ${JSON.stringify(e.response, null, 4)}`));
    };

    const onExitAccount = async () => {
        // const token_res = await AuthService.token();
        await AuthService.logout(process.env.REACT_APP_URL_API)
            .then(response => {
                if (response.status === 200) {
                    TokenService.clearTokens();
                    window.location.reload();
                }
            })
            .catch(e => alert(`errors: ${JSON.stringify(e.response, null, 4)}`));
    };

    return (
        <header className="header">
            <input className="header__inpt-search" type="text" placeholder="Поиск" />
            <div className="header__user">
                {/* <p className="user_name">{user.name}</p> */}
                <p className="header__user-name">Солоха Николай</p>
                <div className="header__user-image" onClick={onRetrieveUser}></div>
                {/* <button onClick={onExitAccount}>Выйти</button> */}
                {/* <div className="user_image" onClick={() => navigate('users/17')}></div> */}
                {/* <button onClick={onRetrieveUser}>Получить пользователя</button> */}
            </div>
        </header>
    );
}
