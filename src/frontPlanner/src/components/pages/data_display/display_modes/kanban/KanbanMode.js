import { useEffect, useState, useRef, memo, Fragment } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

// Импорт компонетов
import Card from '@generic/elements/cards/Card';
import ActionSelectionPopup from '@generic/elements/popup/ActionSelectionPopup';

// Импорт конфигураций
import { FILTERS_CONF_MAP, DRAG_AND_DROP_CONF_MAP } from '@config/kanban.config';
import { WEEK_DAYS } from '@config/calendar.config';

// Импорт доп.функционала
import { getUniqueData } from '@helpers/helper';
import { getWeek } from '@helpers/calendar';

// Импорт стилей
import './kanban_mode.css';

function getConfigKanban(modeOption, data) {
    // console.log(`modeOption: ${JSON.stringify(modeOption, null, 4)}`);
    if (data && data.length !== 0) {
        if (modeOption && Object.keys(modeOption).length !== 0) {
            return {
                filter: modeOption?.value,
                nameFilter: modeOption?.key,
                data:
                    modeOption?.key === 'date'
                        ? getWeek(new Date()).map(item => {
                              let dayOfWeek = item.toLocaleString('en-US', { weekday: 'long' });
                              return { title: WEEK_DAYS[dayOfWeek] };
                          })
                        : data && data.length !== 0
                        ? getUniqueData(data, { key: modeOption?.key, uniqueness: modeOption?.uniqueness }).map(
                              item => {
                                  if (modeOption && Object.keys(modeOption).length !== 0) {
                                      if (modeOption?.key) {
                                          if (item !== null && typeof item === 'object' && !Array.isArray(item))
                                              return { title: item[modeOption?.key][modeOption?.uniqueness] };
                                          else return { title: item[modeOption?.key] };
                                      }
                                  }
                              }
                          )
                        : []
            };
        }
    }
    return {};
}

// Функция инициализации данных для режима отображения Канбан
function initKanbanData(headerData, data) {
    // console.log(`headerData: ${JSON.stringify(headerData, null, 4)}`);

    if (Object.keys(headerData).length !== 0 && headerData?.data.length !== 0) {
        const newData = {};

        headerData?.data.forEach((item, i) => {
            newData[item?.title] = FILTERS_CONF_MAP[headerData.nameFilter]
                ? FILTERS_CONF_MAP[headerData.nameFilter](headerData?.data[i], data)
                : FILTERS_CONF_MAP.getData(headerData?.data[i], data);
        });

        return newData;
    }
    return {};
}

function DropArea(props) {
    const { position, header, onDrop } = props;
    const [showDrop, setShowDrop] = useState(false);

    function dropHandler(e) {
        onDrop(e, position, header);
        setShowDrop(false);
    }

    return (
        <li
            className={classNames(showDrop ? 'kanban__drop-area' : 'kanban__drop-area_hide', {
                'kanban__drop-area_first': position === 0
            })}
            onDragOver={e => e.preventDefault()}
            onDragEnter={() => setShowDrop(true)}
            onDragLeave={() => setShowDrop(false)}
            onDrop={e => dropHandler(e)}
        >
            Вставить сюда
        </li>
    );
}

function HeaderColumn(props) {
    const { keyFilter, header, lenData } = props;

    const COLUMN_CONTENT_MAP = {
        user: (header, lenData) => {
            return (
                <>
                    <div className="kanban__col-top-info">
                        <img className="kanban__col-top-img" src={header?.photo} alt="" />
                        <h2 className="kanban__col-top-title">{header?.title}</h2>
                    </div>
                    <p className="kanban__col-top-subtitle">{lenData + ' ' + 'карточек'}</p>
                </>
            );
        },
        car: (header, lenData) => {
            return (
                <>
                    <h2 className="header_col_title">{header?.stamp + ' ' + header?.numCar}</h2>
                    <p className="kanban__col-top-subtitle">{lenData + ' ' + 'карточек'}</p>
                </>
            );
        }
    };

    return (
        <div className="kanban__col-top">
            <div className="kanban__col-top-content">
                {COLUMN_CONTENT_MAP[keyFilter] ? (
                    COLUMN_CONTENT_MAP[keyFilter](header, lenData)
                ) : (
                    <>
                        <h2 className="kanban__col-top-title">{header?.title}</h2>
                        <p className="kanban__col-top-subtitle">{lenData + ' ' + 'карточек'}</p>
                    </>
                )}
            </div>
        </div>
    );
}

function ColumnContent(props) {
    // console.log(`cardsData: ${JSON.stringify(cardsData, null, 4)}`);
    const { partition, header, cards, dataOperations, setDraggedItem, dropHandler } = props;

    return (
        <div className="kanban__col-content">
            <ul
                className={classNames('kanban__col-list-cards', {
                    'kanban__col-list-cards_empty': !cards ? true : cards.length === 0 ? true : false
                })}
            >
                <DropArea key={`${header?.title}-0-Область`} position={0} header={header} onDrop={dropHandler} />
                {cards && cards.length !== 0 ? (
                    cards.map((item, index) => (
                        <Fragment key={`${item.id}-${item.contractNum}-fragment`}>
                            <li
                                className="kanban__card-wrapper"
                                draggable="true"
                                onDragStart={() => setDraggedItem({ id: item.id, nameColOut: header.title })}
                            >
                                <Card
                                    partition={partition}
                                    key={`${item?.id}-${item?.contractNum}`}
                                    data={item}
                                    dataOperations={dataOperations}
                                />
                            </li>
                            <DropArea
                                key={`${header?.title}-${index + 1}-Область`}
                                position={index + 1}
                                header={header}
                                onDrop={dropHandler}
                            />
                        </Fragment>
                    ))
                ) : (
                    <li className="kanban__col-list-cards-message">Данные отсутствуют</li>
                )}
            </ul>
        </div>
    );
}

function Column(props) {
    const { partition, filterVal, modeOption, cards, dataOperations, setDraggedItem, dropHandler } = props;
    // console.log(`itemHeader = ${JSON.stringify(itemHeader, null, 4)}`);
    // console.log(`data: ${JSON.stringify(data, null, 4)}`);

    return (
        <div className="kanban__col-cards">
            <HeaderColumn
                key={`${filterVal?.title}-${cards.length}`}
                keyFilter={modeOption?.key}
                header={filterVal}
                lenData={cards.length}
            />
            <ColumnContent
                key={filterVal?.title}
                partition={partition}
                header={filterVal}
                cards={cards}
                dataOperations={dataOperations}
                setDraggedItem={setDraggedItem}
                dropHandler={dropHandler}
            />
        </div>
    );
}

export default function KanbanMode(props) {
    const { partition, data, modeOption, dataOperations } = props;
    // console.log(`KanbanMode modeOption: ${JSON.stringify(modeOption, null, 4)}`);
    // console.log(`data: ${JSON.stringify(data, null, 4)}`);

    const [boardCards, setBoardCards] = useState({});
    const [configKanban, setConfigKanban] = useState({});

    const [stateActionSelectionPopup, setStateActionSelectionPopup] = useState(false);
    const [draggedItem, setDraggedItem] = useState({ id: -1, nameColOut: null });
    const dropHandlerRef = useRef(null);

    function dropHandler(e, position, nameColIn) {
        e.preventDefault();
        e.stopPropagation();

        setStateActionSelectionPopup(true);
        // dropHandlerRef.current = () => {
        //     if (draggedItem) {
        //         const tempData = { ...boardCards };

        //         let indDraggedItem = tempData[draggedItem.nameColOut].map(item => item.id).indexOf(draggedItem.id);
        //         let changeableItem = tempData[draggedItem.nameColOut][indDraggedItem];
        //         let editedItem = DRAG_AND_DROP_CONF_MAP[headerData.nameFilter](nameColIn, changeableItem);

        //         tempData[nameColIn.title].splice(position, 0, editedItem);
        //         tempData[draggedItem.nameColOut].splice(indDraggedItem, 1);

        //         setBoardCards(tempData);
        //     }
        // };
    }

    // console.log(
    //     `changeableItem: ${JSON.stringify(changeableItem, null, 4)}\neditedItem: ${JSON.stringify(
    //         editedItem,
    //         null,
    //         4
    //     )}`
    // );

    useEffect(() => {
        const confKanban = getConfigKanban(modeOption, data);

        setConfigKanban(confKanban);
        setBoardCards(initKanbanData(confKanban, data));
    }, [data, modeOption]);

    return (
        <div className="kanban">
            <div
                className={classNames('kanban__wrapper', {
                    'kanban__wrapper_empty': !boardCards || Object.keys(boardCards).length === 0
                })}
            >
                {boardCards && Object.keys(boardCards).length !== 0 ? (
                    Object.keys(boardCards).map((key, index) => {
                        return (
                            <Column
                                key={`${index}-${key}-${modeOption?.value}`}
                                partition={partition}
                                filterVal={configKanban?.data[index]}
                                modeOption={modeOption}
                                cards={boardCards[key]}
                                dataOperations={dataOperations}
                                setDraggedItem={setDraggedItem}
                                dropHandler={dropHandler}
                            />
                        );
                    })
                ) : (
                    <p className="kanban__info-message">Данные отсутствуют</p>
                )}
                {stateActionSelectionPopup
                    ? createPortal(
                          <ActionSelectionPopup
                              additClass="action-selection"
                              statePopup={stateActionSelectionPopup}
                              functionRef={dropHandlerRef}
                              setStatePopup={setStateActionSelectionPopup}
                          />,
                          document.getElementById('portal')
                      )
                    : null}
            </div>
        </div>
    );
}
