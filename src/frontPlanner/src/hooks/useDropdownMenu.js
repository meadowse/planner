import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

// Импорт сервисов
import DataFormService from '@services/data_form.service';

export const useDropdownMenu = params => {
    const { keyMenu, nameMenu, additClass, dataSource, specifiedVal, onItemClick } = params;

    const [dropdownState, setDropdownState] = useState(false);
    const [itemMenu, setItemMenu] = useState(
        specifiedVal && Object.keys(specifiedVal).length !== 0 ? specifiedVal : { ['title']: nameMenu }
    );
    const icBtnRef = useRef();

    const data = DataFormService.getOptions(keyMenu);
    const menu =
        dataSource && dataSource.length !== 0
            ? { ['values']: dataSource }
            : data && data.length !== 0
            ? { ['values']: data }
            : null;

    const classes = {
        icBtn: classNames(
            `icon-btn__${additClass}`,
            'icon-btn',
            dropdownState ? `icon-btn__${additClass}_active` : null
        ),
        menuItems: classNames(`dropdown-menu-list__${additClass}`, 'dropdown-menu-list'),
        item: classNames(`dropdown-menu-list-item__${additClass}`, 'dropdown-menu-list-item')
    };

    const info = {
        menu: menu,
        classes: classes
    };

    function onItemMenuClick(data) {
        // console.log(`params: ${JSON.stringify(params, null, 4)}`);
        setItemMenu(data);
        onItemClick(data);
        setDropdownState(false);
    }

    function onClickOutside(event) {
        if (icBtnRef.current && !icBtnRef.current.contains(event.target)) setDropdownState(false);
    }

    useEffect(() => {
        setItemMenu(specifiedVal && Object.keys(specifiedVal).length !== 0 ? specifiedVal : { ['title']: nameMenu });
    }, [specifiedVal]);

    useEffect(() => {
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return {
        dropdownState,
        itemMenu,
        icBtnRef,
        info,
        setDropdownState,
        setItemMenu,
        onItemMenuClick
    };
};
