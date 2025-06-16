import classNames from 'classnames';

// Импорт компонетов
import IconButton from '../buttons/IcButton';

// Импорт кастомных хуков
import { usePopup } from '@hooks/usePopup';

// Импорт стилей
import './popup_window.css';

export default function Popup(props) {
    const { children, additClass, overlay, statePopup, setStatePopup, icon } = props;
    const { popupRef } = usePopup(statePopup, setStatePopup);

    // Закрыть окно
    function onClosePopup() {
        setStatePopup(false);
    }

    return (
        <>
            {overlay && <div className="overlay"></div>}
            <div className={classNames(`popup__${additClass}`, 'popup')} ref={popupRef}>
                <div className={classNames(additClass, 'popup__wrapper')}>
                    {icon ? (
                        <button className="popup__btn-close-popup btn-close-popup" onClick={onClosePopup}>
                            &#10006;
                        </button>
                    ) : // <IconButton
                    //     nameClass="popup__btn-close-popup btn-close-popup"
                    //     icon={icon}
                    //     onClick={() => setStatePopup(false)}
                    // />
                    null}
                    {children}
                </div>
            </div>
        </>
    );
}
