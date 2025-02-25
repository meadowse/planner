import { useState, useEffect } from 'react';
import classNames from 'classnames';

// Импорт компонетов
import PopupWindow from '@generic/elements/popup/Popup';

// Импорт кастомных хуков
import { useDataLoader } from '@hooks/useDataLoader';

// Импорт вспомогательного функционала
import { findNestedObj } from '@helpers/helper';

// Импорт стилей
import './object_departure_popup.css';

export default function ObjectDeparturePopup(props) {
    let sections = useDataLoader(process.env.REACT_APP_SERVER_URL);
    // console.log(`data: ${JSON.stringify(data, null, 4)}`);

    const [addresses, setAddresses] = useState([]);
    const { additClass, statePopup, setStatePopup } = props;

    useEffect(() => {
        const departures = findNestedObj(sections, 'title', 'Выезды')?.data;
        if (departures && departures.length !== 0) setAddresses(departures?.map(item => item?.address));
        console.log(`addresses: ${JSON.stringify(addresses, null, 4)}`);
    }, [sections]);

    return (
        <PopupWindow additClass={additClass} statePopup={statePopup} setStatePopup={setStatePopup}>
            <div className={classNames('popup_content', additClass)}>
                <input className="inpt_search_object" type="text" placeholder="Поиск" />
                <ul className="list_departure_objects">
                    {addresses.map((item, ind) => (
                        <li key={ind}>{item}</li>
                    ))}
                </ul>
            </div>
        </PopupWindow>
    );
}
