import classNames from 'classnames';

// Импорт компонетов
import IconButton from '../buttons/IcButton';
import DropdownMenu from '../dropdown_menu/DropdownMenu';

// Импорт кастомных хуков
import { useInputDataPopup } from '@hooks/useInputDataPopup';

// Импорт стилей
import './input_data_popup.css';

export default function InputDataPopup(props) {
    const { children, title, additClass, overlay, statePopup, setStatePopup, changeLink } = props;
    const params = { statePopup, changeLink, setStatePopup };
    const { popupRef, onSaveData, onCancelClick, onItemClick } = useInputDataPopup(params);

    return (
        <>
            {overlay && <div className="overlay"></div>}
            <div className={classNames(`popup__${additClass}`, 'popup')} ref={popupRef}>
                <div className={classNames(`popup__wrapper-${additClass}`, 'popup__wrapper')}>
                    <div className="popup__header">
                        <h2 className="popup__header-title">{title}</h2>
                        <div className="popup__header-operations">
                            <DropdownMenu
                                additClass="action"
                                icon="arrow_down_sm.svg"
                                keyMenu="actions"
                                nameMenu="Действие"
                                onItemClick={onItemClick}
                            />
                            <IconButton
                                nameClass="icon-btn__save icon-btn"
                                text="Сохранить"
                                icon="check_mark.svg"
                                onClick={onSaveData}
                            />
                            <IconButton
                                nameClass="icon-btn__operation icon-btn"
                                text="Отменить"
                                icon="cancel.svg"
                                onClick={onCancelClick}
                            />
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </>
    );
}
