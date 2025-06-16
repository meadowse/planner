import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Импорт компонетов
import PopupWindow from '@generic/elements/popup/Popup';
import Preloader from '../../../auxiliary_pages/loader/Preloader';

// Импорт доп.функционала
import { dataLoader } from '@helpers/helper';

// Импорт данных
import USERS_DATA from '@data/usersData.json';

// Импорт стилей
import './users_popup.css';

function User(props) {
    const { user, setStatePopup, setUser } = props;

    const refFullNameUser = useRef(null);
    const refPostUser = useRef(null);

    // Перейти к началу текстового содержимого
    function onScrollTo() {
        refFullNameUser?.current.scrollTo(0, 0);
    }

    // Выбор пользователя
    function onSelectUser() {
        setStatePopup(false);
        setUser(user);
    }

    return (
        <li className="popup__user-list-item" onClick={onSelectUser}>
            <img className="popup-user__photo" src={user?.photo || '/img/user.svg'} alt="" />
            <div className="popup-user-info">
                <h3 className="popup-user-info__fullname" ref={refFullNameUser} onMouseLeave={onScrollTo}>
                    <span>{user?.fullName}</span>
                </h3>
                <p className="popup-user-info__post" ref={refPostUser} onMouseLeave={onScrollTo}>
                    <span>{user?.post}</span>
                </p>
            </div>
        </li>
    );
}

export default function UsersPopupWindow(props) {
    const { additClass, overlay, statePopup, setStatePopup, selectUser } = props;

    const [isLoading, setLoading] = useState(true);
    const [usersData, setUsersData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchItem, setSearchItem] = useState('');

    function onInputChangeUser(e) {
        setSearchItem(e.target.value);

        const filteredItems = usersData.filter(user =>
            user?.fullName.toLowerCase().includes(e.target.value.toLowerCase())
        );

        setFilteredUsers(filteredItems);
    }

    async function loadData() {
        await axios.get(`${window.location.origin}/api/employee/`).then(response => {
            if (response?.status === 200) {
                if (response?.data && response?.data.length !== 0) {
                    const sortedData = response.data.sort((a, b) => a?.fullName.localeCompare(b.fullName));
                    sortedData.forEach(
                        elem =>
                            (elem.photo = elem.mmId
                                ? `https://mm-mpk.ru/api/v4/users/${elem.mmId}/image`
                                : '/img/user.svg')
                    );

                    setUsersData(sortedData);
                    setFilteredUsers(sortedData);
                    setLoading(false);
                }
            }
        });
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <PopupWindow
            additClass={additClass}
            overlay={overlay}
            statePopup={statePopup}
            setStatePopup={setStatePopup}
            icon="cancel_bl.svg"
        >
            <div className="popup__content">
                <input
                    className="popup__inpt-search-user"
                    type="text"
                    value={searchItem}
                    onChange={e => onInputChangeUser(e)}
                />
                <div className="popup__users">
                    <h2 className="popup__title">Люди:</h2>
                    {isLoading ? (
                        <Preloader />
                    ) : (
                        <div className="popup__list-wrapper">
                            <ul
                                className="popup__list-users"
                                style={{
                                    gridTemplateRows: 'repeat(6, 1fr)',
                                    gridTemplateColumns: `repeat(${Math.ceil(filteredUsers.length / 6)}, 9rem)`
                                }}
                            >
                                {filteredUsers && filteredUsers.length !== 0
                                    ? filteredUsers.map((user, index) => (
                                          <User
                                              key={index}
                                              user={user}
                                              setStatePopup={setStatePopup}
                                              setUser={selectUser}
                                          />
                                      ))
                                    : null}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </PopupWindow>
    );
}
