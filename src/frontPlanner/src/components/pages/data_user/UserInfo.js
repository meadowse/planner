import { Link, useParams } from 'react-router-dom';

// Импорт компонентов
import CardSubordination from './user_info/CardSubordination';
import CardGroup from './user_info/CardGroup';
import CardProfile from './user_info/CardProfile';
import CardInfo from './user_info/CardInfo';

// Импорт кастомных хуков
import { useDataLoader } from '@hooks/useDataLoader';

// Импорт стилей
import './user_info.css';

export default function UserInfo() {
    const { id } = useParams();

    // https://rasilka.ru/planner/employee/17/ /getUser
    // let userInfo = useDataLoader(`https://rasilka.ru/planner/employee/${id}/`);
    let userInfo = useDataLoader(`http://localhost:5000/employee/${id}/`);

    // console.log(`id user: ${id}`);
    // console.log(`userInfo: ${JSON.stringify(userInfo, null, 4)}`);

    const {
        birthday,
        post,
        personal_phone,
        mail,
        work_phone,
        internal_phone,
        telegramm,
        skype,
        division,
        personal_photo,
        full_name,
        _group_
    } = userInfo;

    return userInfo && userInfo.length !== 0 ? (
        <div className="user__card" id={id}>
            <div className="card__top">
                <div className="card__top-text">Просмотр аккаунта</div>
                <div className="card__line">&nbsp;</div>
                <div className="card__text grey fw-600">Изменить</div>
                <Link className="card__text fw-600 card__close" to={'/'}>
                    Закрыть <span>&nbsp;</span>
                </Link>
            </div>
            <div className="card__bottom">
                <CardProfile personal_photo={personal_photo} full_name={full_name} />
                <div className="card__about about">
                    <CardInfo
                        post={post}
                        personal_phone={personal_phone}
                        mail={mail}
                        work_phone={work_phone}
                        internal_phone={internal_phone}
                        telegramm={telegramm}
                        skype={skype}
                        division={division}
                        birthday={birthday}
                    />
                    <div className="about__box">
                        <CardGroup group={_group_} />
                        <CardSubordination data={userInfo} />
                    </div>
                </div>
            </div>
        </div>
    ) : null;
}
