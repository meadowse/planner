import classNames from 'classnames';

// Импорт компонентов
import IconButton from '../buttons/IcButton';

// Импорт кастомных хуков
import { useDropdownMenu } from '@hooks/useDropdownMenu';

// Импорт стилей
import './dropdown_menu.css';

export default function DropdownMenu(props) {
    const { additClass, icon, nameMenu, disabledElem, option } = props;
    const { dropdownState, itemMenu, icBtnRef, info, setDropdownState, onItemMenuClick } = useDropdownMenu(props);

    // console.log(`DropdownMenu info: ${JSON.stringify(info, null, 4)}`);

    return (
        <div className={classNames(`dropdown-menu__${additClass}`, 'dropdown-menu')} ref={icBtnRef}>
            <IconButton
                nameClass={info.classes.icBtn}
                type={'button'}
                // text={dropdownState ? nameMenu : option ? nameMenu : itemMenu.title}
                text={dropdownState ? nameMenu : itemMenu.title}
                icon={icon}
                spanColor={
                    dropdownState
                        ? ''
                        : itemMenu === undefined
                        ? ''
                        : itemMenu.color === undefined
                        ? ''
                        : itemMenu.color
                }
                disabled={disabledElem}
                onClick={() => {
                    setDropdownState(true);
                }}
            />
            {dropdownState ? (
                <ul className={info.classes.menuItems}>
                    {info.menu?.values.map((item, index) => (
                        <li
                            key={index}
                            className={info.classes.item}
                            style={{ backgroundColor: item.color === undefined ? '' : item.color }}
                            onClick={() => onItemMenuClick(item)}
                        >
                            <span>{item.title}</span>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
