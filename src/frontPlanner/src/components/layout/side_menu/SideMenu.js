import { startTransition, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

// Импорт стилей
import './side_menu.css';

function ItemSideMenu(props) {
    // console.log(`item: ${item}\nselectedItem: ${selectedItem}`);
    const { item, selectedItem, setItem, navigate } = props;

    function handleClickItem(item) {
        // console.log(`value: ${JSON.stringify(value, null, 4)}`);
        startTransition(() => {
            setItem(item);
            localStorage.setItem('itemSideMenu', JSON.stringify(item));
            navigate(`${item.path}`);
        });
    }

    return (
        <li className="side-menu__item" onClick={() => handleClickItem(item)}>
            <div
                className={classNames('side-menu__item-box', {
                    'side-menu__item-box_active': item.title === selectedItem.title
                })}
            >
                <img
                    className="side-menu__item-image"
                    src={`/img/side_menu/${
                        item.imgName + (item.title === selectedItem.title ? '_active.svg' : '.svg')
                    }`}
                />
            </div>
        </li>
    );
}

export default function SideMenu(props) {
    const { items, itemSideMenu, setItemSideMenu } = props;
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
                />
            ))}
        </ul>
    );
}
