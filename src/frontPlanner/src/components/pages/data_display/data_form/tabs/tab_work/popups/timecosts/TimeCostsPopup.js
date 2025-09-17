import { useEffect, useState, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Cookies from 'js-cookie';
import classNames from 'classnames';

// Импорт компонетов
import BgFillText from '@generic/elements/text/BgFillText';
import IconButton from '@generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import CalendarWindow from '@generic/elements/calendar/CalendarWindow';
import UsersPopupWindow from '@generic/elements/popup/UsersPopupWindow';
import InputDataPopup from '@generic/elements/popup/InputDataPopup';
import ModalWindow from '@generic/elements/popup/ModalWindow';

// Импорт контекстов
// import { SocketContext } from '../../../../../../../../contexts/socket.context';
import { useHistoryContext } from '../../../../../../../../contexts/history.context';

// Импорт кастомных хуков
import { useTaskForm } from '@hooks/useAddTaskForm';

// Импорт конфигурации
import { EMPLOYEE_ACTIONS, ACTIONS_TASK } from '@config/tabs/tab_work.config';

// Импорт сервисов
import TaskService from '@services/tabs/tab_task.service';

// Импорт доп.функционала
import { getKeyByValue } from '@helpers/helper';
import { getDateInSpecificFormat } from '@helpers/calendar';

// Импорт стилей
import './timecosts_popup.css';

export default function TimeCostsPopup({ data, popupConf }) {
    const { additClass, title, popupState, setPopupState } = popupConf;

    console.log(`TimeCostsPopup data: ${JSON.stringify(data, null, 4)}`);

    // Отправка данных
    function onOnSubmitData(e) {}

    return (
        <>
            <div id="portal"></div>
            <InputDataPopup
                // idForm="add-task-form"
                idForm="task-form"
                title={title}
                additClass={additClass}
                overlay={true}
                statePopup={popupState}
                setStatePopup={setPopupState}
                deleteConfig={{
                    modalWindow: {
                        title: ''
                    },
                    onDelete: null
                }}
            >
                <form id="timecosts-form" className="popup__timecosts-form" onSubmit={e => onOnSubmitData(e)}></form>
            </InputDataPopup>
        </>
    );
}
