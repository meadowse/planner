export default function CardProfile(props) {
    const { personal_photo, full_name, telegramm, skype } = props;

    return (
        <div className="card__profile">
            <div className="card__profile__left">
                <div className="card__photo">
                    <img src={personal_photo} alt="" />
                </div>
                <div className="card__profile__links">
                    <a href="" class="btn__link chats" rel="noreferrer" target={'_blank'}>
                        <p>Написать в чат</p>
                        <div className="ic_image">
                            <img src="/img/side_menu/chats_active.svg" alt="" />
                        </div>
                    </a>
                    <a href={`//t.me/${telegramm}`} class="btn__link telegram" rel="noreferrer" target={'_blank'}>
                        <p>Написать</p>
                        <div className="ic_image">
                            <img src="/img/telegram.svg" alt="" />
                        </div>
                    </a>
                    <a href={`skype:${skype}`} class="btn__link skype" rel="noreferrer" target={'_blank'}>
                        <p>Позвонить</p>
                        <div className="ic_image">
                            <img src="/img/skype.svg" alt="" />
                        </div>
                    </a>
                </div>
            </div>
            <div className="card__profile__right">
                <p className="card__name">{full_name}</p>
            </div>
        </div>
    );
}

{
    /* <div className="card__profile">
    <div className="card__profile__top">
        <div className="card__photo">
            <img src={personal_photo} alt="" />
        </div>
        <div className="card__name">{full_name}</div>
    </div>
</div>; */
}

{
    /* <div className="card__profile__bottom">
    <a href="" class="btn" rel="noreferrer" target={'_blank'}>
        Переход по ссылке
    </a>
    <a href="" class="btn">
        Переход по ссылке
    </a>
    <a href="" class="btn">
        Переход по ссылке
    </a>
</div>; */
}
