export default function CardInfo({
    post,
    personal_phone,
    mail,
    work_phone,
    internal_phone,
    telegramm,
    skype,
    division,
    birthday
}) {
    return (
        <ul className="card__block info">
            <li className="card__row">
                <h2 className="card__text grey fw-600">Должность</h2>
                <p className="card__text">{post}</p>
            </li>
            <li className="card__row">
                <h2 className="card__text grey fw-600">Личный телефон</h2>
                <p className="card__text fw-600">
                    <a href={`tel:${personal_phone}`}>{personal_phone}</a>
                </p>
            </li>
            <li className="card__row">
                <h2 className="card__text grey fw-600">Почта</h2>
                <p className="card__text fw-600">
                    <a href={`mailto:${mail}`}>{mail}</a>
                </p>
            </li>
            <li className="card__row">
                <h2 className="card__text grey fw-600">Рабочий телефон</h2>
                <p className="card__text">{work_phone}</p>
            </li>
            <li className="card__row">
                <h2 className="card__text grey fw-600">Внутренний телефон</h2>
                <p className="card__text">{internal_phone}</p>
            </li>
            <li className="card__row">
                <h2 className="card__text grey fw-600">Telegram</h2>
                <p className="card__text">
                    <a href={`//t.me/${telegramm}`} rel="noreferrer" target={'_blank'}>
                        {telegramm}
                    </a>
                </p>
            </li>
            <li className="card__row">
                <h2 className="card__text grey fw-600">Skype</h2>
                <p className="card__text">
                    <a href={`skype:${skype}`}>{skype}</a>
                </p>
            </li>
            <li className="card__row">
                <h2 className="card__text grey fw-600">Подразделение</h2>
                <p className="card__text">{division}</p>
            </li>
            <li className="card__row">
                <h2 className="card__text grey fw-600">День рождения</h2>
                <p className="card__text">{birthday}</p>
            </li>
        </ul>
    );
}
