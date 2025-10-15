import { startTransition, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Await, useLocation, useNavigate, useParams } from 'react-router-dom';

import classNames from 'classnames';

// Импорт компонетов
import Preloader from '@components/auxiliary_pages/loader/Preloader';

// Импорт контекста
import { useHistoryContext } from '../../../../../contexts/history.context';

// Импорт стилей
import './company_sections.css';

function Section(props) {
    const { index, indSelectedSection, item, refDetails, onClickUser } = props;

    const director = item?.employees?.find(item => item?.director);
    const employees = [...item?.employees].sort((a, b) => a?.fullName?.localeCompare(b?.fullName));

    // console.log(`index[${index}] === indSelectedSection[${indSelectedSection}]`);

    useEffect(() => {
        if (refDetails.current) refDetails.current?.scrollIntoView({ behavior: 'smooth' });
    }, [indSelectedSection]);

    return (
        <details
            key={`${item?.department}_${index}`}
            ref={index === indSelectedSection ? refDetails : null}
            className="sections-details-list-item"
            open={index === indSelectedSection}
        >
            <summary className="details__title">
                <p>
                    {item?.department}
                    &ensp;
                    <span>(Всего: {employees.length})</span>
                </p>
                <span>&#9658;</span>
            </summary>
            <div className="details__content">
                <div className="details__content-header">
                    <h2 className="details__content-title">Руководитель отдела</h2>
                    <div className="details__content-list-director" onClick={() => onClickUser(director)}>
                        <div className="details__director-img-wrapper">
                            <img className="details__director-img" src={director?.photo} alt="" />
                        </div>
                        <div className="details__director-info">
                            <h3>{director?.fullName}</h3>
                            <p>{director?.post}</p>
                        </div>
                    </div>
                </div>
                <div className="details__wrapper">
                    <h3 className="details__wrapper-title">Сотрудники</h3>
                    {employees && item?.employees.length > 0 && (
                        <ul className="details__content-list">
                            {employees.map(employee => {
                                const refPost = useRef(null);
                                return (
                                    <li className="details__content-list-item" onClick={() => onClickUser(employee)}>
                                        <div className="details__content-list-employee">
                                            <img className="details__employee-photo" src={employee?.photo} alt="" />
                                            <div className="details__employee-info">
                                                <h3>{employee?.fullName}</h3>
                                                <p ref={refPost} onMouseLeave={() => refPost?.current.scrollTo(0, 0)}>
                                                    <span>{employee?.post}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </details>
    );
}

function SectionsData({ selectedSection, sectionsData }) {
    const indSelectedSection = sectionsData.findIndex(item => item?.department === selectedSection);

    const navigate = useNavigate();
    const { addToHistory } = useHistoryContext();
    const refDetails = useRef(null);

    // Переход к профилю пользователя
    function onClickUser(employee) {
        startTransition(() => {
            addToHistory(`${window.location.pathname}`);
            navigate(`../../user/${employee?.mmId}/profile/profile/`, {
                state: { idEmployee: employee?.mmId, path: `${window.location.pathname}` }
            });
        });
    }

    return (
        <div className="sections-details-wrapper">
            <div className="sections-details-list">
                {sectionsData.map(
                    (section, index) =>
                        section.employees &&
                        section.employees.length > 0 && (
                            <Section
                                index={index}
                                indSelectedSection={indSelectedSection}
                                item={section}
                                refDetails={refDetails}
                                onClickUser={onClickUser}
                            />
                        )
                )}
            </div>
        </div>
    );
}

export default function CompanySections({ uploadedData }) {
    const [selectedSection, setSelectedSection] = useState(null);
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state?.section) {
            setSelectedSection(location.state?.section);
        }
    }, [location.state]);

    return (
        <Suspense fallback={<Preloader />}>
            <Await resolve={uploadedData}>
                {resolvedData => {
                    // console.log(`CompanySections resolvedData: ${JSON.stringify(resolvedData?.sections, null, 4)}`);
                    const sortedData =
                        resolvedData?.sections && resolvedData?.sections.length > 0
                            ? [...resolvedData?.sections].sort((a, b) => a?.department?.localeCompare(b?.department))
                            : resolvedData?.sections;
                    return (
                        <div
                            className={classNames('page__sections', {
                                'page__sections_empty': sortedData.length === 0
                            })}
                        >
                            {sortedData && sortedData?.length > 0 ? (
                                <SectionsData selectedSection={selectedSection} sectionsData={sortedData} />
                            ) : (
                                <h2>Данные отсутствуют</h2>
                            )}
                        </div>
                    );
                }}
            </Await>
        </Suspense>
    );
}
