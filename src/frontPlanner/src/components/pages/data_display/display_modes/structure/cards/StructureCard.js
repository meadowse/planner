import { useState } from 'react';
import classNames from 'classnames';

// Импорт стилей
import './structure_card.css';

function MainImage({ showUsers, structData }) {
    return !showUsers ? (
        <figure className="card-struct__img-figure">
            <img className="card-struct__section-img" src={structData?.photoSection} alt="" />
            <figcaption className="card-struct__section-img-caption">{structData?.titleSection}</figcaption>
        </figure>
    ) : null;
}

function User({ userData }) {
    return (
        <>
            <img className="card-struct-user__img" src={userData?.photo} alt="" />
            <div className="card-struct-user__info">
                <h2 className="card-struct-user__fullname">{userData?.fullName}</h2>
                <p className="card-struct-user__post">{userData?.post}</p>
            </div>
        </>
    );
}

function DirectorInfo({ showUsers, structData }) {
    return (
        <>
            <div className="card-struct__director card-struct-user">
                <User userData={structData.director} />
            </div>
            {showUsers && structData?.subordinates.length !== 0 ? (
                <div className="card-struct__users-wrapper">
                    <ul className="card-struct__users">
                        {structData?.subordinates.map((user, index) => (
                            <li
                                className="card-struct__employee card-struct-user"
                                style={{
                                    animation: `show-users ${(index + 1) / 2.222}s ease`
                                }}
                            >
                                <User userData={user} />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </>
    );
}

function InfoSection(props) {
    const { showUsers, countEmployees, countSubsections } = props;

    return !showUsers ? (
        <ul className="card-struct__info-company">
            <li className="card-struct__info-employees card-struct-info-item">
                <h3 className="card-struct-info-item__title">{countEmployees}</h3>
                сотрудников
            </li>
            <li className="card-struct__info-subsections card-struct-info-item">
                <h3 className="card-struct-info-item__title">{countSubsections}</h3>
                подразделений
            </li>
        </ul>
    ) : null;
}

function SidebarCard(props) {
    const { onMouseEnter, onMouseLeave, setShowInfoCard, onExpandBranch } = props;

    function onShowInfoCard(usersMode, subsectionsMode, generalMode) {
        setShowInfoCard({ general: generalMode, users: usersMode, subsections: subsectionsMode });
    }

    return (
        <ul className="card-struct__sidebar" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <li className="card-struct__sidebar-item">
                <button
                    className="card-struct__btn-employees card-struct__btn"
                    onClick={() => onShowInfoCard(true, false, false)}
                >
                    <img src="/img/employees.svg" alt="" />
                    <span className="card-struct__btn-text">Сотрудники</span>
                </button>
            </li>
            <li className="card-struct__sidebar-item">
                <button className="card-struct__btn-subsections card-struct__btn" onClick={onExpandBranch}>
                    <img src="/img/subsections.svg" alt="" />
                    <span className="card-struct__btn-text">Подразделения</span>
                </button>
            </li>
            <li className="card-struct__sidebar-item">
                <button
                    className="card-struct__btn-card card-struct__btn"
                    onClick={() => onShowInfoCard(false, false, true)}
                >
                    <img src="/img/card.svg" alt="" />
                    <span className="card-struct__btn-text">К карточке</span>
                </button>
            </li>
        </ul>
    );
}

export default function CardStructure(props) {
    const { data, isVisible, onExpandBranch } = props;

    const [showOverlay, setShowOverlay] = useState(false);
    const [showInfoCard, setShowInfoCard] = useState({ users: false, subsections: false, general: false });

    function onMouseEnterHandler() {
        setShowOverlay(true);
    }
    function onMouseLeaveHandler() {
        setShowOverlay(false);
    }

    return (
        <div
            className={classNames(
                'card-struct',
                { 'card-struct_users': showInfoCard.users },
                {
                    'card-struct_active': isVisible && data?.subsectionsData?.length > 0
                }
            )}
        >
            <div className={classNames('card-struct__content', { 'card-struct__content-users': showInfoCard.users })}>
                <div className={classNames('card-struct__overlay', { 'card-struct__overlay_show': showOverlay })}></div>
                <MainImage
                    showUsers={showInfoCard.users}
                    structData={{
                        photoSection: data?.photo,
                        titleSection: data?.section,
                        director: data?.director
                    }}
                />
                <DirectorInfo
                    showUsers={showInfoCard.users}
                    structData={{ director: data?.director, subordinates: data?.subordinates }}
                />
                <InfoSection
                    showUsers={showInfoCard.users}
                    countEmployees={data?.subordinates?.length}
                    countSubsections={data?.subsectionsData?.length}
                />
            </div>
            <SidebarCard
                onMouseEnter={onMouseEnterHandler}
                onMouseLeave={onMouseLeaveHandler}
                setShowInfoCard={setShowInfoCard}
                onExpandBranch={onExpandBranch}
            />
        </div>
    );
}
