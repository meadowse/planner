import { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Импорт компонетов
import Header from './header/Header';
import SideMenu from './side_menu/SideMenu';

// Импорт данных
import menuItems from '@data/sideMenuData.json';

// Импорт стилей
import './layout.css';

export default function Layout() {
    const [itemSideMenu, setItemSideMenu] = useState(JSON.parse(localStorage.getItem('itemSideMenu')) || menuItems[0]);

    return (
        <div className="app">
            <img class="logo" src="/img/logo.svg" alt="Logo" />
            <div className="app__left-column">
                <SideMenu items={menuItems} itemSideMenu={itemSideMenu} setItemSideMenu={setItemSideMenu} />
            </div>
            <div className="app__right-column">
                <Header />
                <main className="main">
                    <div id="portal"></div>
                    <Outlet context={itemSideMenu} />
                </main>
            </div>
        </div>
    );
}
