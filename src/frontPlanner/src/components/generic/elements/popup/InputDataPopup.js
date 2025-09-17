import { useState } from 'react';
import classNames from 'classnames';

// Импорт компонетов
import IconButton from '../buttons/IcButton';
import ModalWindow from '@generic/elements/popup/ModalWindow';

// Импорт кастомных хуков
import { useInputDataPopup } from '@hooks/useInputDataPopup';

// Импорт стилей
import './input_data_popup.css';

export default function InputDataPopup(props) {
    const { children, idForm, title, additClass, overlay, statePopup, setStatePopup, deleteConfig, changeLink } = props;
    const { modalWindow, onDelete } = deleteConfig;
    const params = { statePopup, changeLink, setStatePopup };

    const { popupRef, onSaveData, onCancelClick, onItemClick } = useInputDataPopup(params);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {overlay && <div className="overlay"></div>}
            <div className={classNames(`popup__${additClass}`, 'popup')} ref={popupRef}>
                <div className={classNames(`popup__wrapper-${additClass}`, 'popup__wrapper')}>
                    <div className="popup__header">
                        <h2 className="popup__header-title">{title}</h2>
                        <div className="popup__header-operations">
                            <button className="icon-btn__save icon-btn" form={idForm}>
                                Сохранить<span>&#10003;</span>
                            </button>
                            {onDelete ? (
                                <button className="icon-btn__delete icon-btn" onClick={() => setIsModalOpen(true)}>
                                    Удалить<span>&#128465;</span>
                                </button>
                            ) : null}
                            <button className="icon-btn__cancel icon-btn" onClick={onCancelClick}>
                                Отменить<span>&#10006;</span>
                            </button>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
            {isModalOpen ? (
                <ModalWindow
                    additClass="action-selection"
                    title={modalWindow?.title}
                    statePopup={isModalOpen}
                    actionRef={onDelete}
                    setStatePopup={setIsModalOpen}
                />
            ) : null}
        </>
    );
}
