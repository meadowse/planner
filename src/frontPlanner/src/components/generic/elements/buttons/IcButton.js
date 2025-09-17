// Импорт стилей
import './ic_button.css';

export default function IconButton(props) {
    const { nameClass, idForm, type, text, icon, spanColor, disabled, onClick, onMouseDown } = props;
    return (
        <button
            className={nameClass}
            type={type ?? 'button'}
            form={idForm ?? null}
            disabled={disabled}
            onClick={onClick}
            onMouseDown={onMouseDown}
        >
            <img className="icon-btn__image" src={'/img/' + icon} alt="" />
            {text && (
                <p className="icon-btn__text">
                    <span className="icon-btn__span" style={{ backgroundColor: spanColor }}>
                        {text}
                    </span>
                </p>
            )}
        </button>
    );
}
