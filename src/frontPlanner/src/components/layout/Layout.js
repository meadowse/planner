import { startTransition, Suspense, useContext, useEffect, useState } from 'react';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

// Импорт компонетов
import Preloader from '@components/auxiliary_pages/loader/Preloader';
import SideMenu from './side_menu/SideMenu';

// Импорт контекстов
import { useHistoryContext } from '../../contexts/history.context';
// import { SocketContext } from '../../contexts/socket.context';
import { ThemeContext } from '../../contexts/theme.context';

// Импорт данных
import menuItems from '@data/sideMenuData.json';

// Импорт стилей
import './layout.css';

export default function Layout() {
    const navigate = useNavigate();

    // const socket = useContext(SocketContext);
    const { theme, onToggleAppTheme } = useContext(ThemeContext);
    const { addToHistory } = useHistoryContext();

    const [itemSideMenu, setItemSideMenu] = useState({});

    function onRetrieveUser() {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${Cookies.get('MMUSERID')}/profile/profile/`, {
                state: { idEmployee: Cookies.get('MMUSERID'), path: `${window.location.pathname}` }
            });
        });
    }

    useEffect(() => {
        // Разбиваем путь на массив
        const firstPartPath = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');
        const savedMenu = JSON.parse(localStorage.getItem('itemSideMenu'));

        let defaultVal = null;

        menuItems?.forEach(menuItem => {
            if (menuItem?.path.replace(/\/+$/, '') === firstPartPath) defaultVal = menuItem;
        });

        if (!savedMenu || Object.keys(savedMenu).length === 0) {
            setItemSideMenu(defaultVal ?? menuItems[0]);
            localStorage.setItem('itemSideMenu', JSON.stringify(defaultVal ?? menuItems[0]));
        } else {
            const menuItemLen = Object.keys(defaultVal ?? menuItems[0]).length;
            const savedMenuItemLen = Object.keys(savedMenu).length;
            // console.log(`menuItem Len: ${menuItemLen}\nsavedMenuItem Len: ${savedMenuItemLen}`);

            if (menuItemLen > savedMenuItemLen) {
                setItemSideMenu(defaultVal ?? menuItems[0]);
                localStorage.setItem('itemSideMenu', JSON.stringify(itemSideMenu));
            } else setItemSideMenu(savedMenu);
        }
    }, []);

    return (
        <div className="app">
            <img class="logo" src={theme === 'dark' ? '/img/logo_dark.svg' : '/img/logo.svg'} alt="Logo" />
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
