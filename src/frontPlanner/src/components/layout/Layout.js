import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

// Импорт компонетов
import SideMenu from './side_menu/SideMenu';

// Импорт данных
import menuItems from '@data/sideMenuData.json';

// Импорт стилей
import './layout.css';

export default function Layout() {
    const [itemSideMenu, setItemSideMenu] = useState({});
    const navigate = useNavigate();

    function onRetrieveUser() {
        navigate('user/');
    }

    useEffect(() => {
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
                    <img src="/img/user.svg" alt="#" />
                </figure>
            </div>
            <div className="app__right-column">
                <main className="main">
                    <div id="portal"></div>
                    <Outlet context={itemSideMenu} />
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
