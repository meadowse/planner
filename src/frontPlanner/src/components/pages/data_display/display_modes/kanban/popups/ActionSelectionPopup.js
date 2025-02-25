// Импорт компонетов
import Popup from '@generic/elements/popup/Popup';

// Импорт стилей
import './action_selection_popup.css';

export default function ActionSelectionPopup(props) {
    const { additClass, statePopup, functionRef, setStatePopup } = props;

    function onConfirmAction() {
        if (functionRef.current) {
            functionRef.current();
            setStatePopup(false);
        }
    }

    function onCancelAction() {
        setStatePopup(false);
    }

    return (
        <Popup
            additClass={additClass}
            overlay={true}
            statePopup={statePopup}
            setStatePopup={setStatePopup}
            icon={'cancel_bl.svg'}
        >
            <div className="popup__content-action-selection popup-content">
                <h2 className="popup-content__title">Вы уверенны, что хотите внести изменения в выбранную карточку?</h2>
                <div className="popup-content__actions">
                    <button className="popup__btn-action-yes btn-action" onClick={onConfirmAction}>
                        Да
                    </button>
                    <button className="popup__btn-action-no btn-action" onClick={onCancelAction}>
                        Нет
                    </button>
                </div>
            </div>
        </Popup>
    );
}
