import React, { useEffect, useState, useRef, Fragment, useMemo } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

// Импорт компонетов
import Card from '@generic/elements/cards/Card';
// import ActionSelectionPopup from '@generic/elements/popup/ActionSelectionPopup';

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
    console.log(`headerData: ${JSON.stringify(headerData, null, 4)}`);

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
    const { header, lenData, disclose, setDiscloseContent } = props;

    function onDiscloseContent(disclose) {
        setDiscloseContent({ disclose: true, ...header });
        // alert(`Header: ${JSON.stringify(header, null, 4)}`);
    }

    return (
        <div className="kanban__col-top">
            <div className="kanban__col-top-content">
                <button className="kanban__col-top-btn" onClick={disclose ? onDiscloseContent : null}>
                    <h2 className="kanban__col-top-title">{header?.title}</h2>
                    {disclose ? <img src="/img/expanding.svg" alt="" /> : null}
                </button>
                <p className="kanban__col-top-subtitle">{lenData + ' ' + 'карточек'}</p>
            </div>
        </div>
    );
}

// Элемент колонки
function ElementColumn(props) {
    const { index, data, style } = props;
    const { cards, partition, dataOperations, heightsCards, rowGap, setItemSize } = data;

    const elemRef = useRef(null);

    useEffect(() => {
        if (!elemRef.current) return;

        const observer = new ResizeObserver(entries => {
            entries.forEach(entry => {
                if (!entry?.contentRect) return;
                const newHeight = entry?.contentRect?.height;
                if (newHeight !== heightsCards[index]) setItemSize(index, newHeight);
            });
        });

        observer.observe(elemRef.current);

        return () => {
            observer.disconnect();
        };
    }, [index]);

    return (
        <div style={{ ...style, height: style?.height - rowGap, marginBottom: `25px` }}>
            <div ref={elemRef} className="card-wrapper">
                <Card
                    partition={partition}
                    key={`${cards[index]?.id}-${cards[index]?.contractNum}`}
                    data={cards[index]}
                    dataOperations={dataOperations}
                />
            </div>
        </div>
    );
}

function ColumnContent(props) {
    // console.log(`cardsData: ${JSON.stringify(cardsData, null, 4)}`);
    const { partition, header, cards, dataOperations, setDraggedItem, dropHandler } = props;
    // Отступы между элементами списка
    const rowGap = 25;

    // Высоты карточек
    // const heightsCards = useRef({}).current;
    const heightsCards = useRef({}).current;
    // Ссылка на список
    const listRef = useRef();

    // данные для передачи в ElementColumn
    const elemColumnData = {
        cards,
        partition,
        dataOperations,
        heightsCards,
        rowGap,
        setItemSize
    };

    // Получить высоту элемента
    function getItemSize(index) {
        return (heightsCards[index] || 50) + rowGap; // прибавляем еще и значение rowGap чтобы VariableSizeList знал об отступе
    }

    // Установить высоту элементу
    function setItemSize(index, newHeight) {
        // console.log(`index: ${index}\nnewHeight: ${newHeight}`);
        heightsCards[index] = newHeight;
        if (listRef.current) listRef.current.resetAfterIndex(index, true);
    }

    // console.log(`height cards: ${JSON.stringify(heightsCards, null, 4)}`);

    return (
        <div className="kanban__col-content">
            <AutoSizer className="kanban__col-list-cards-autosizer">
                {({ width, height }) => (
                    <VariableSizeList
                        ref={listRef}
                        className="kanban__col-list-cards"
                        width={width}
                        height={height}
                        itemCount={cards.length} // количество карточек
                        itemSize={getItemSize} // высота одной карточки
                        itemData={elemColumnData}
                    >
                        {ElementColumn}
                    </VariableSizeList>
                )}
            </AutoSizer>
        </div>
    );
}

function Column(props) {
    const { partition, filterVal, modeOption, cards, dataOperations, disclose, setDiscloseContent } = props;
    // console.log(`itemHeader = ${JSON.stringify(itemHeader, null, 4)}`);
    // console.log(`data: ${JSON.stringify(data, null, 4)}`);

    return (
        <div className="kanban__col-cards">
            <HeaderColumn
                key={`${filterVal?.title}-${cards.length}`}
                keyFilter={modeOption?.key}
                header={filterVal}
                lenData={cards.length}
                disclose={disclose}
                setDiscloseContent={setDiscloseContent}
            />
            <ColumnContent
                key={filterVal?.title}
                partition={partition}
                header={filterVal}
                cards={cards}
                dataOperations={dataOperations}
            />
        </div>
    );
}

function Kanban(props) {
    const { partition, configKanban, modeOption, boardCards, dataOperations, disclose, setDiscloseContent } = props;

    return (
        <div
            className={classNames('kanban__wrapper', {
                'kanban__wrapper_empty': !boardCards || Object.keys(boardCards).length === 0
            })}
        >
            {Object.keys(boardCards).map((key, index) => {
                return (
                    <Column
                        key={`${index}-${key}-${modeOption?.value}`}
                        partition={partition}
                        filterVal={configKanban?.data[index]}
                        modeOption={modeOption}
                        cards={boardCards[key]}
                        dataOperations={dataOperations}
                        disclose={disclose}
                        setDiscloseContent={setDiscloseContent}
                    />
                );
            })}
        </div>
    );
}

function DiscloseKanban(props) {
    const { partition, option, cards, dataOperations, discloseContent, setDiscloseContent } = props;

    const [configKanban, setConfigKanban] = useState({});
    const [boardCards, setBoardCards] = useState({});

    useEffect(() => {
        const confKanban = getConfigKanban(option, cards);

        setConfigKanban(confKanban);
        setBoardCards(initKanbanData(confKanban, cards));
    }, []);

    function onDiscloseContent() {
        setDiscloseContent(null);
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', rowGap: '20px' }}>
            <div className="kanban__row-top-content">
                <h2 className="kanban__row-top-title">{discloseContent?.title}</h2>
                {/* <p className="kanban__row-top-subtitle">{cards.length + ' ' + 'карточек'}</p> */}
                <button className="kanban__row-top-btn" onClick={onDiscloseContent}>
                    Скрыть содержимое
                </button>
            </div>
            <div className="kanban-disclose__cards">
                <Kanban
                    partition={partition}
                    configKanban={configKanban}
                    modeOption={option}
                    boardCards={boardCards}
                    dataOperations={dataOperations}
                    disclose={false}
                    setDiscloseContent={setDiscloseContent}
                />
            </div>
        </div>
    );
}

export default function KanbanMode(props) {
    const { partition, data, modeOption, dataOperations } = props;
    // console.log(`KanbanMode modeOption: ${JSON.stringify(modeOption, null, 4)}`);
    // console.log(`data: ${JSON.stringify(data, null, 4)}`);

    // Конфигурация доски Канбан
    const configKanban = useMemo(() => getConfigKanban(modeOption, data), [modeOption, data]);
    // const [configKanban, setConfigKanban] = useState({});

    // Данные доски Канбан
    const boardCards = useMemo(() => initKanbanData(configKanban, data), [data]);
    // const [boardCards, setBoardCards] = useState({});

    const [stateActionSelectionPopup, setStateActionSelectionPopup] = useState(false);

    // Перетаскиваемый элемент
    const [draggedItem, setDraggedItem] = useState({ id: -1, nameColOut: null });

    // Состояние раскрытости содержимого
    const [discloseContent, setDiscloseContent] = useState(null);

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

    // console.log(`boardCards: ${JSON.stringify(boardCards, null, 4)}`);

    useEffect(() => {
        // const confKanban = getConfigKanban(modeOption, data);

        // setConfigKanban(confKanban);
        setDiscloseContent(modeOption?.disclose);
        // setBoardCards(initKanbanData(confKanban, data));
    }, [data, modeOption]);

    return (
        <div className="kanban">
            {discloseContent && Object.keys(discloseContent).length !== 0 && discloseContent.disclose ? (
                <DiscloseKanban
                    partition={partition}
                    option={{
                        key: 'stage',
                        keyData: 'contracts',
                        keyMode: 'kanban',
                        uniqueness: 'title',
                        value: 'Стадии'
                    }}
                    cards={boardCards[discloseContent?.title]}
                    dataOperations={dataOperations}
                    discloseContent={discloseContent}
                    setDiscloseContent={setDiscloseContent}
                />
            ) : (
                <Kanban
                    partition={partition}
                    configKanban={configKanban}
                    modeOption={modeOption}
                    boardCards={boardCards}
                    dataOperations={dataOperations}
                    disclose={true}
                    setDiscloseContent={setDiscloseContent}
                />
            )}
        </div>
    );
}
