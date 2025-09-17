import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Импорт компонетов
import BgFillText from '../text/BgFillText';

// Импорт доп.функционала
import { isObject, isArray, findNestedObj } from '@helpers/helper';
import { getDateFromString } from '@helpers/calendar';

// Импорт контекста
import { useHistoryContext } from '../../../../contexts/history.context';

// Импорт стилей
import './card.css';

function HeaderCard({ data }) {
    return data && Object.keys(data).length !== 0 ? (
        <div className="kanban-card__header">
            <BgFillText className="kanban-card__header-title" type="p" text={data?.title || 'Нет данных'} />
            <BgFillText
                className="kanban-card__header-stage"
                type="p"
                text={data?.condition?.title || 'Нет данных'}
                bgColor={data?.condition?.color}
            />
        </div>
    ) : null;
}

function FigcaptionImage({ partition, data }) {
    const refFigcapTitle = useRef(null);
    const refFigcapFullname = useRef(null);

    const PARTITION_CONF = {
        department: () => {
            return data && Object.keys(data).length !== 0 ? (
                <>
                    <div className="kanban-card__figcaption-left">
                        {/* Изменить */}
                        {data?.contacts && Object.keys(data?.contacts).length !== 0 ? (
                            <>
                                <h2
                                    className="kanban-card__figcaption-title"
                                    ref={refFigcapTitle}
                                    onMouseLeave={() => refFigcapTitle?.current.scrollTo(0, 0)}
                                >
                                    {data?.company || 'Нет данных'}
                                </h2>
                                {data?.contacts && data?.contacts.length !== 0
                                    ? data?.contacts?.map(contact => (
                                          <li
                                              key={`${data?.company}-${contact?.fullName}`}
                                              className="kanban-card__figcaption-info-item"
                                          >
                                              <span
                                                  className="kanban-card__figcaption-fullname"
                                                  ref={refFigcapFullname}
                                                  onMouseLeave={() => refFigcapFullname?.current.scrollTo(0, 0)}
                                              >
                                                  {contact?.fullName || 'Нет данных'}
                                              </span>
                                              <p className="kanban-card__figcaption-phones">
                                                  {contact?.phone && contact?.phone?.length !== 0 ? (
                                                      <span className="kanban-card__figcaption-phone">
                                                          {contact?.phone.map(item => item)}
                                                      </span>
                                                  ) : (
                                                      'Нет данных'
                                                  )}
                                              </p>
                                          </li>
                                      ))
                                    : String.fromCharCode(8195)}
                            </>
                        ) : (
                            'Нет данных'
                        )}
                    </div>
                    <div className="kanban-card__figcaption-right">
                        <p className="kanban-card__figcaption-subtitle">
                            {data?.date && Object.keys(data?.date).length !== 0
                                ? `${data?.date?.title}: ${
                                      data?.date?.value ? data?.date?.value : String.fromCharCode(8212)
                                  }`
                                : null}
                        </p>
                    </div>
                </>
            ) : null;
        },
        equipment: () => {
            if (data.dates) {
                if (isArray(data.dates) && data.dates.length !== 0) {
                    const sortedDates = data.dates.sort((dateA, dateB) => {
                        return new Date(getDateFromString(dateB?.end)) - new Date(getDateFromString(dateA?.end));
                    });

                    console.log(`sortedDates: ${JSON.stringify(sortedDates, null, 4)}`);

                    const dateLastVerf = sortedDates[1]?.end ?? 'Нет данных';
                    const dateNextVerf = sortedDates[0]?.end ?? 'Нет данных';

                    return (
                        <ul className={`kanban-card__figcaption-list_${partition} kanban-card__figcaption-list`}>
                            <li className="kanban-card__figcaption-list-item">
                                <h3>Дата последней поверки:</h3>
                                <p className="kanban-card__figcaption-date">{dateLastVerf}</p>
                            </li>
                            <li className="kanban-card__figcaption-list-item">
                                <h3>Дата следующей поверки:</h3>
                                <p className="kanban-card__figcaption-date kanban-card__figcaption-date_next">
                                    {dateNextVerf}
                                </p>
                            </li>
                        </ul>
                    );
                }
            }
        }
    };

    return (
        <figcaption className={`${partition ? `kanban-card__figcaption_${partition}` : null} kanban-card__figcaption`}>
            {partition ? PARTITION_CONF[partition]() : null}
        </figcaption>
    );
}

// return (
//     <div className="kanban-card__figcaption-list-wrapper">
//         <ul className={`kanban-card__figcaption-list_${partition}s kanban-card__figcaption-list`}>
//             {data.dates.map(date => (
//                 <li className="kanban-card__figcaption-date">{date}</li>
//             ))}
//         </ul>
//     </div>
// );

// if (isObject(data.dates) && Object.keys(data.dates).length !== 0) {
//     return (
//         <ul className={`kanban-card__figcaption-list_${partition} kanban-card__figcaption-list`}>
//             <li className="kanban-card__figcaption-list-item">
//                 <h3>Дата последней поверки:</h3>
//                 <p className="kanban-card__figcaption-date">{data.dates?.start || 'Нет данных'}</p>
//             </li>
//             <li className="kanban-card__figcaption-list-item">
//                 <h3>Дата следующей поверки:</h3>
//                 <p className="kanban-card__figcaption-date kanban-card__figcaption-date_next">
//                     {data.dates?.end || 'Нет данных'}
//                 </p>
//             </li>
//         </ul>
//     );
// }

// Изображение карточки
function ImageCard(props) {
    const { partition, contractNum, company, contacts, date, dates } = props;
    const extensions = ['jpg', 'jpeg', 'png', 'gif'];

    const [image, setImage] = useState(null);

    const PARTITION_CONF = {
        department: () => {
            const data = { image: image, company: company, contacts: contacts, date: date };
            return <FigcaptionImage partition={partition} data={data} />;
        },
        equipment: () => {
            const data = { dates: dates };
            return <FigcaptionImage partition={partition} data={data} />;
        }
    };

    // useEffect(() => {
    //     for (let extension in extensions) {
    //         const path = `N:/6. Технологии/11. Изображения для карточек договоров/${contractNum}.${extension}`;
    //         if (
    //             require
    //                 .context(
    //                     'N:/6. Технологии/11. Изображения для карточек договоров/',
    //                     false,
    //                     new RegExp(`^\.${path}$`)
    //                 )
    //                 .keys()
    //                 .includes(`./${path}`)
    //         ) {
    //             setImage(path);
    //             break;
    //         }
    //     }
    // }, []);

    return (
        <figure className="kanban-card__figure">
            <div className="kanban-card__figure-image">
                {/* {image && <img className="kanban-card__image" src={image} alt="" />} */}
                {image && (
                    <img
                        className="kanban-card__image"
                        src={'N:/6. Технологии/11. Изображения для карточек договоров/2025-06-375-РНС.JPEG'}
                        alt=""
                    />
                )}
                {/* {image && image.length !== 0 && typeof image === 'string' && (
                    <img className="kanban-card__image" src={image} alt="" />
                )} */}
            </div>
            {partition ? PARTITION_CONF[partition]() : null}
        </figure>
    );
}

function MainContentCard({ partition, data }) {
    // console.log(`headlines: ${JSON.stringify(data.headlines, null, 4)}`);
    const refMainTxt = useRef(null);
    // console.log(`MainContentCard data: ${JSON.stringify(data, null, 4)}`);

    return data && Object.keys(data).length !== 0 ? (
        <div className="kanban-card__main">
            {isObject(data?.subtitle) && Object.keys(data?.subtitle).length !== 0 ? (
                <BgFillText
                    className="kanban-card__main-title"
                    type="h2"
                    text={data?.subtitle?.title || 'Нет данных'}
                />
            ) : null}
            {!isObject(data?.subtitle) ? (
                <BgFillText className="kanban-card__main-title" type="h2" text={data?.subtitle || 'Нет данных'} />
            ) : null}
            <p className="kanban-card__main-subtitle">{data.way}</p>
            <ImageCard
                partition={partition}
                contractNum={data.contractNum}
                company={data.company}
                contacts={data.contacts}
                date={data.date}
                dates={data.dates}
            />
            <p
                className="kanban-card__main-text"
                ref={refMainTxt}
                onMouseLeave={() => refMainTxt?.current.scrollTo(0, 0)}
            >
                <span>{data.address}</span>
            </p>
        </div>
    ) : null;
}

// Ответственный
function Responsible({ responsible }) {
    // console.log(`user: ${JSON.stringify(user, null, 4)}`);

    return responsible && Object.keys(responsible).length !== 0 ? (
        <div className="kanban-card__footer-user">
            <img
                className="kanban-card__footer-user-img"
                src={
                    typeof responsible?.photo === 'string'
                        ? responsible?.photo
                        : URL.createObjectURL(responsible?.photo)
                }
                alt=""
            />
            <div className="kanban-card__footer-user-info">
                <h2 className="kanban-card__footer-user-title">Ответственный</h2>
                <p className="kanban-card__footer-user-fullname">{responsible?.fullName || 'Нет данных'}</p>
            </div>
        </div>
    ) : null;
}

// Участники
function Participants({ participants }) {
    // console.log(`users: ${JSON.stringify(users, null, 4)}`);
    return participants && Object.keys(participants).length !== 0 ? (
        <ul
            className="kanban-card__footer-users"
            style={Object.keys(participants).length <= 5 ? { justifyContent: 'flex-start' } : {}}
        >
            {participants &&
                participants.length !== 0 &&
                participants.map((participant, index) => (
                    <li key={participant?.fullName} className="kanban-card__footer-users-item">
                        {participant?.photo ? (
                            <img key={index} className="kanban-card__footer-user-img" src={participant?.photo} alt="" />
                        ) : null}
                    </li>
                ))}
        </ul>
    ) : null;
}

function FooterCard({ data }) {
    return data && Object.keys(data).length !== 0 ? (
        <div className="kanban-card__footer">
            <Responsible responsible={data.responsible} />
            <Participants participants={data.participants} />
        </div>
    ) : null;
}

export default function Card(props) {
    // console.log(`card data: ${JSON.stringify(data, null, 4)}`);
    const { partition, data, dataOperations } = props;
    const { addToHistory } = useHistoryContext();
    const navigate = useNavigate();

    const cardData = {
        id: data?.id,
        headerContent: {
            title: data?.car?.numCar || data?.contractNum || data?.equipment?.title || null,
            condition: data?.stage || data?.status || null
        },
        mainContent: {
            contractNum: data?.contractNum || null,
            subtitle: data?.services || data?.equipment?.model || null,
            way: data?.pathToFolder || null,
            image: data?.imgBuilding || data?.equipment?.image || null,
            company: data?.company || null,
            contacts: data?.contacts || null,
            date: data?.dateOfEnding || null,
            dates: data?.dates || null,
            address: data?.address || null
        },
        footerContent: {
            manager: data?.manager || {},
            responsible: data?.responsible || {},
            participants: data?.participants || []
        }
    };

    // console.log(`cardData: ${JSON.stringify(cardData, null, 4)}`);

    function onShowInfoCard(event) {
        // console.log(`onShowInfoCard partition: ${partition}`);

        const NAV_CONF = {
            equipment: () => {
                // const navigationArg = {
                //     state: {
                //         partition: partition
                //     }
                // };
                // console.log(`equipment card data: ${JSON.stringify(data, null, 4)}`);
                // addToHistory(`${window.location.pathname}`);
                // navigate('../../dataform/tool/equipment/', navigationArg);
                // navigate('../../dataform/equipment/', navigationArg);
            },
            default: () => {
                const navigationArg = {
                    state: {
                        idContract: data?.contractId,
                        tabForm: { key: 'general', title: 'Общие' },
                        partition: partition,
                        path: `${window.location.pathname}`,
                        dataOperation: findNestedObj(dataOperations, 'key', 'update')
                    }
                };

                localStorage.setItem('selectedTab', JSON.stringify({ key: 'general', title: 'Общие' }));
                localStorage.setItem('idContract', JSON.stringify(data?.contractId));

                addToHistory(`${window.location.pathname}`);

                if (event && event.button === 1) {
                    // Открытие договора в новой вкладке
                    const url = `../../dataform/general?data=${encodeURIComponent(
                        JSON.stringify(navigationArg.state)
                    )}`;
                    window.open(url, '_blank');
                } else navigate('../../dataform/general/', navigationArg);

                // navigate('../../dataform/contract/general/', navigationArg);
                // navigate('../../dataform/general/', navigationArg);
            }
        };
        return NAV_CONF[partition] ? NAV_CONF[partition]() : NAV_CONF.default();
        // return NAV_CONF[partition]() ?? NAV_CONF.default();
    }

    return (
        <div
            className="kanban-card"
            style={{ borderLeftColor: data.color ? data.color : 'rgba(109, 109, 109, 0.745098)' }}
            onClick={onShowInfoCard}
            onMouseDown={e => onShowInfoCard(e)}
        >
            <HeaderCard data={cardData?.headerContent} />
            <MainContentCard partition={partition} data={cardData?.mainContent} />
            <FooterCard data={cardData?.footerContent} />
        </div>
    );
}
