// Импорт компонетов
import Popup from '@generic/elements/popup/Popup';

// Импорт стилей
import './modal_window.css';

export default function ModalWindow(props) {
    const { additClass, modalWindowConf, statePopup, setStatePopup } = props;

    console.log(`ModalWindow modalWindowConf: ${JSON.stringify(modalWindowConf, null, 4)}`);

    const TYPES_WINDOW_CONF = {
        confirm: () => {
            const { title } = modalWindowConf;

            return (
                <div className="popup__content-action-selection popup-content">
                    <h2 className="popup-content__title">{title}</h2>
                    <div className="popup-content__actions">
                        <button className="popup__btn-action-yes btn-action" onClick={onConfirmAction}>
                            Да
                        </button>
                        <button className="popup__btn-action-no btn-action" onClick={() => setStatePopup(false)}>
                            Нет
                        </button>
                    </div>
                </div>
            );
        },
        info: () => {
            const { title } = modalWindowConf;

            return (
                <div
                    className=""
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: '0.5vw',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <h2 className="popup-content__title">{title}</h2>
                    <button className="btn-action" onClick={() => setStatePopup(false)}>
                        Закрыть
                    </button>
                </div>
            );
        }
    };

    function onConfirmAction() {
        // if (functionRef.current) {
        //     functionRef.current();
        //     setStatePopup(false);
        // }
        if (modalWindowConf?.onDelete) {
            modalWindowConf.onDelete();
            setStatePopup(false);
        }
    }

    return (
        <Popup
            additClass={additClass}
            overlay={true}
            statePopup={statePopup}
            setStatePopup={setStatePopup}
            icon="cancel_bl.svg"
        >
            {modalWindowConf?.type in TYPES_WINDOW_CONF ? TYPES_WINDOW_CONF[modalWindowConf?.type]() : null}
            {/* <div className="popup__content-action-selection popup-content">
                <h2 className="popup-content__title">{title}</h2>
                <div className="popup-content__actions">
                    <button className="popup__btn-action-yes btn-action" onClick={onConfirmAction}>
                        Да
                    </button>
                    <button className="popup__btn-action-no btn-action" onClick={() => setStatePopup(false)}>
                        Нет
                    </button>
                </div>
            </div> */}
        </Popup>
    );
}
