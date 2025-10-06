import { startTransition, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

// Импорт стилей
import './side_menu.css';

function ItemSideMenu(props) {
    // console.log(`item: ${item}\nselectedItem: ${selectedItem}`);
    const { item, selectedItem, setItem, navigate, setSearchElem } = props;
    const [hovered, setHovered] = useState(false);

    function handleClickItem(item) {
        // console.log(`value: ${JSON.stringify(value, null, 4)}`);
        startTransition(() => {
            localStorage.setItem('itemSideMenu', JSON.stringify(item));
            localStorage.setItem('globalSearch', '');

            setItem(item);
            setSearchElem('');

            // Разбиваем путь на массив
            const partsPathName = window.location.pathname.split('/');
            if (!partsPathName.includes(item.path.replace(/\/+$/, ''))) navigate(item.path);
        });
    }

    return (
        <li className="side-menu__item" onClick={() => handleClickItem(item)}>
            <div
                className={classNames('side-menu__item-box', {
                    'side-menu__item-box_active': item.title === selectedItem.title
                })}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <img
                    className="side-menu__item-image"
                    src={`/img/side_menu/${
                        item.imgName + (item.title === selectedItem.title || hovered ? '_active.svg' : '.svg')
                    }`}
                />
                <h2 className="side-menu__item-tooltip">{item.title}</h2>
            </div>
        </li>
    );
}

export default function SideMenu(props) {
    const { items, itemSideMenu, setItemSideMenu, setSearchElem } = props;
    const navigate = useNavigate();

    return (
        <ul className="side-menu">
            {items.map((item, indItem) => (
                <ItemSideMenu
                    key={indItem}
                    item={item}
                    selectedItem={itemSideMenu}
                    setItem={setItemSideMenu}
                    navigate={navigate}
                    setSearchElem={setSearchElem}
                />
            ))}
        </ul>
    );
}
