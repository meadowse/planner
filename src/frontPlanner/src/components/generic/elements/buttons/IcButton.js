// Импорт стилей
import './ic_button.css';

export default function IconButton(props) {
    const { nameClass, type, idForm, text, icon, spanColor, disabled, onClick } = props;
    return (
        <button className={nameClass} type={type} form={idForm} disabled={disabled} onClick={onClick}>
            <img className="icon-btn__image" src={'/img/' + icon} alt="" />
            {text && (
                <span className="icon-btn__span" style={{ backgroundColor: spanColor }}>
                    {text}
                </span>
            )}
        </button>
    );
}
