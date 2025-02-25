import classNames from 'classnames';

// Импорт компонентов
import IconButton from '../buttons/IcButton';

// Импорт кастомных хуков
import { useDropdownMenu } from '@hooks/useDropdownMenu';

// Импорт стилей
import './dropdown_menu.css';

export default function ColorPaletteMenu(props) {
    const { additClass, icon, keyMenu, nameMenu, dataSource, disabledElem, onItemClick } = props;
    const params = { keyMenu, nameMenu, additClass, dataSource, onItemClick };
    const { dropdownState, icBtnRef, info, setDropdownState, onItemMenuClick } = useDropdownMenu(params);

    return (
        <div className={classNames(`dropdown-menu__${additClass}`, 'dropdown-menu')} ref={icBtnRef}>
            <IconButton
                nameClass={info.classes.icBtn}
                type={'button'}
                text={nameMenu}
                icon={icon}
                disabled={disabledElem}
                onClick={() => {
                    setDropdownState(true);
                }}
            />
            {dropdownState ? (
                <ul className={info.classes.menuItems}>
                    {info.menu.values.map((item, index) => (
                        <li
                            key={index}
                            className={info.classes.item}
                            style={{ backgroundColor: item.color === undefined ? '' : item.color }}
                            onClick={() => onItemMenuClick(item.color)}
                        ></li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
