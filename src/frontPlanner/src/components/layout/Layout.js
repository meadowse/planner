import { startTransition, Suspense, useContext, useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

// Импорт компонетов
import Preloader from '@components/auxiliary_pages/loader/Preloader';
import SideMenu from './side_menu/SideMenu';

// Импорт контекстов
import { useHistoryContext } from '../../contexts/history.context';
import { SocketContext } from '../../contexts/socket.context';
import { ThemeContext } from '../../contexts/theme.context';

// Импорт данных
import menuItems from '@data/sideMenuData.json';

// Импорт стилей
import './layout.css';

export default function Layout() {
    const navigate = useNavigate();

    const socket = useContext(SocketContext);
    const { theme, onToggleAppTheme } = useContext(ThemeContext);
    const { addToHistory } = useHistoryContext();

    const [itemSideMenu, setItemSideMenu] = useState({});

    function onRetrieveUser() {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${Cookies.get('MMUSERID')}/profile/profile/`, {
                state: { idEmployee: Cookies.get('MMUSERID'), path: `${window.location.pathname}` }
            });
            // navigate(`../../user/profile/`, {
            //     state: { idEmployee: Cookies.get('MMUSERID'), path: `${window.location.pathname}` }
            // });
        });
    }

    useEffect(() => {
        socket.emit('register', Cookies.get('MMUSERID'));

        const savedMenu = JSON.parse(localStorage.getItem('itemSideMenu'));
        if (!savedMenu || Object.keys(savedMenu).length === 0) {
            setItemSideMenu(menuItems[0]);
            localStorage.setItem('itemSideMenu', JSON.stringify(menuItems[0]));
        } else setItemSideMenu(savedMenu);
    }, []);

    return (
        <div className="app">
            <img class="logo" src="/img/logo.svg" alt="Logo" />
            <div className="app__left-column">
                <SideMenu items={menuItems} itemSideMenu={itemSideMenu} setItemSideMenu={setItemSideMenu} />
                <figure className="app__user" onClick={onRetrieveUser}>
                    <img
                        src={
                            Cookies.get('MMUSERID')
                                ? `https://mm-mpk.ru/api/v4/users/${Cookies.get('MMUSERID')}/image`
                                : '/img/user.svg'
                        }
                        alt="#"
                    />
                </figure>
            </div>
            <div className="app__right-column">
                <main className="main">
                    <div id="portal" />
                    <Suspense fallback={<Preloader />}>
                        <Outlet context={{ itemSideMenu, theme, onToggleAppTheme }} />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

// useEffect(() => {
//     if (JSON.parse(localStorage.getItem('itemSideMenu'))) localStorage.removeItem('itemSideMenu');
//     setItemSideMenu(menuItems[0]);
//     localStorage.setItem('itemSideMenu', JSON.stringify(menuItems[0]));
// }, []);

// const [itemSideMenu, setItemSideMenu] = useState(JSON.parse(localStorage.getItem('itemSideMenu')) || menuItems[0]);

// <button onClick={onRetrieveUser}>Получить пользователя</button>
// <button onClick={onExitAccount}>Выйти</button>
// <div className="user_image" onClick={() => navigate('users/17')}></div>
