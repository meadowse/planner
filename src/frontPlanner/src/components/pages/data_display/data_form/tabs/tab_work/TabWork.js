import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

// Импорт компонентов
import IconButton from '@components/generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';

import AddServicePopup from './popups/service/AddServicePopup';
import SubtaskDepartPopup from './popups/subtask_departament/SubtaskDepartPopup';
import SubtaskGroupPopup from './popups/subtask_group/SubtaskGroupPopup';
import WorksFiltersPopup from './popups/filters/WorksFiltersPopup';

// Импорт стилей
import './tab_work.css';

// Импорт данных
import worksData from '@data/constans/WORKS_DATA.json';

function TreeHeader() {
    return (
        <ul className="tab-work-tree__header">
            <li className="tab-work-tree__header-item"></li>
            <li className="tab-work-tree__header-item">Название</li>
            <li className="tab-work-tree__header-item">Ответственный</li>
            <li className="tab-work-tree__header-item">Стадия</li>
            <li className="tab-work-tree__header-item">Срок</li>
        </ul>
    );
}

// Подзадача
function Subtask({ label, relationship }) {
    const [subtaskDepartState, setSubtaskDepartState] = useState(false);
    const [subtaskGroupState, setSubtaskGroupState] = useState(false);

    const navigate = useNavigate();

    function changeLink() {
        navigate('/dataform');
    }

    return (
        <li className="tab-work-tree__node-subtask tab-work-tree__branch-node">
            {label ? (
                <>
                    <p className="tab-work-tree__subtask-title">{label}</p>
                    <button
                        className="tab-work-tree__subtask-btn"
                        onClick={
                            relationship === 'Отдел'
                                ? () => setSubtaskDepartState(!subtaskDepartState)
                                : relationship === 'Группа'
                                ? () => setSubtaskGroupState(!subtaskGroupState)
                                : null
                        }
                    >
                        +
                    </button>
                    <div className="tab-work-tree__subtask-hint">
                        {relationship === 'Отдел' && (
                            <p className="tab-work-tree__subtask-hint-title">Добавить подзадачу группе</p>
                        )}
                        {relationship === 'Группа' && (
                            <p className="tab-work-tree__subtask-hint-title">Добавить подзадачу</p>
                        )}
                    </div>
                </>
            ) : null}
            {subtaskDepartState
                ? createPortal(
                      <SubtaskDepartPopup
                          title="Новая подзадача в отделе"
                          additClass="sub-task-depart"
                          addSubtaskDepart={subtaskDepartState}
                          setAddSubtaskDepart={setSubtaskDepartState}
                          changeLink={changeLink}
                      />,
                      document.getElementById('portal')
                  )
                : null}
            {subtaskGroupState
                ? createPortal(
                      <SubtaskGroupPopup
                          title="Новая подзадача в группе"
                          additClass="sub-task-group"
                          addSubtaskDepart={subtaskGroupState}
                          setAddSubtaskDepart={setSubtaskGroupState}
                          changeLink={changeLink}
                      />,
                      document.getElementById('portal')
                  )
                : null}
        </li>
    );
}

// Название
function Title(props) {
    const { id, title, indentLeft, children, displayChildren, setDisplayChildren } = props;

    return (
        <li
            className="tab-work-tree__node-name tab-work-tree__branch-node"
            style={{ marginLeft: `${indentLeft}px` }}
            onClick={() => setDisplayChildren({ ...displayChildren, [id]: !displayChildren[id] })}
        >
            {children && children.length !== 0 ? (
                <button className="tab-work-tree__name-btn">
                    <img src="/img/arrow_down_sm.svg" alt="" />
                    {title}
                </button>
            ) : (
                <p className="tab-work-tree__title">{title}</p>
            )}
        </li>
    );
}

// Ответственный
function Responsible({ id, responsible }) {
    return (
        <li className="tab-work-tree__node-responsible tab-work-tree__branch-node">
            <img className="tab-work-tree__responsible-img" src={responsible.photo} alt="#" />
            <p className="tab-work-tree__responsible-fullName">{responsible.fullName}</p>
        </li>
    );
}

// Стадия в виде выпадающего списка
function StageDropdown({ id, value }) {
    function onClickItemStage(value) {
        // console.log(`selected item dropdownmenu: ${value}`);
    }

    return (
        <li key={id} className="tab-work-tree__node-stage tab-work-tree__branch-node">
            <DropdownMenu
                additClass="stage"
                icon="arrow_down_sm.svg"
                nameMenu="Статус"
                specifiedVal={value}
                onItemClick={onClickItemStage}
            />
        </li>
    );
}

// Стадия в виде чекбокса
function StageCheckBox({ id }) {
    const [checked, setChecked] = useState(false);

    function onChange() {
        console.log(`id elem: ${id}`);
        setChecked(!checked);
    }

    return (
        <li key={id} className="tab-work-tree__node-checkbox tab-work-tree__branch-node">
            <div className="tab-work-tree__checkbox-wrapper">
                <input className="tab-work-tree__inpt-checkbox" type="checkbox" onChange={() => onChange()} />
                <span className="tab-work-tree__custom-checkbox"></span>
            </div>
        </li>
    );
}

// Срок
function Term({ id, term }) {
    return (
        <li className="tab-work-tree__node-term tab-work-tree__branch-node">
            <p className="tab-work-tree__term">{term}</p>
        </li>
    );
}

function Tree({ additClass, indentLeft = 15, testData }) {
    const [displayChildren, setDisplayChildren] = useState({});

    let data = [...testData];
    let indent = indentLeft;
    // console.log(`item[${itemKey}]: ${JSON.stringify(item[itemKey], null, 4)}`);

    useEffect(() => {
        console.log(`displayChildren: ${JSON.stringify(displayChildren, null, 4)}`);
    }, [displayChildren]);

    return (
        <ul
            className="tab-work-tree__main"
            style={{ gridTemplateRows: `repeat(${testData.length}, max-content)`, rowGap: '1vw' }}
        >
            {data && data.length !== 0
                ? data.map((item, indItem) => (
                      <li key={indItem} className="tab-work-tree__branch">
                          {Object.keys(item).map((itemKey, indItemKey) => {
                              if (
                                  typeof item[itemKey] === 'object' &&
                                  !Array.isArray(item[itemKey]) &&
                                  item[itemKey] !== null
                              ) {
                                  return (
                                      <ul
                                          key={indItemKey}
                                          className="tab-work-tree__branch-nodes"
                                          style={{
                                              gridTemplateColumns: `repeat(${
                                                  Object.keys(item[itemKey]).length + 1
                                              }, 1fr)`
                                          }}
                                      >
                                          <Subtask label={item.label} relationship={item.relationship} />
                                          {Object.keys(item[itemKey]).map(itemData => {
                                              switch (itemData) {
                                                  case 'title':
                                                      return (
                                                          <Title
                                                              id={item.id}
                                                              title={item.values[itemData]}
                                                              indentLeft={indent}
                                                              children={item.children}
                                                              displayChildren={displayChildren}
                                                              setDisplayChildren={setDisplayChildren}
                                                          />
                                                      );

                                                  case 'responsible':
                                                      return (
                                                          <Responsible
                                                              id={item.id}
                                                              responsible={item.values[itemData]}
                                                          />
                                                      );

                                                  case 'stage':
                                                      return (
                                                          <StageDropdown id={item.id} value={item.values[itemData]} />
                                                      );

                                                  case 'checkbox':
                                                      return <StageCheckBox id={item.id} />;

                                                  case 'term':
                                                      return <Term id={item.id} term={item.values[itemData]} />;
                                              }
                                              // console.log(
                                              //     `id = ${item.id}\nisOpen = ${item.isOpen}\nitemData = ${itemData}`
                                              // );
                                          })}
                                      </ul>
                                  );
                              }
                              if (
                                  Object.prototype.toString.call(item[itemKey]) === '[object Array]' &&
                                  item[itemKey] !== null
                              ) {
                                  // console.log(
                                  //     `item[${itemKey}] is Array\nArray: ${JSON.stringify(item[itemKey], null, 4)}`
                                  // );
                                  return displayChildren[item.id] && item.children ? (
                                      <Tree additClass={additClass} indentLeft={indent * 2} testData={item[itemKey]} />
                                  ) : null;
                              }
                          })}
                      </li>
                  ))
                : null}
        </ul>
    );
}

export default function TabWork({ options }) {
    const [works, setWorks] = useState([...worksData]);
    const [addServiceState, setAddServiceState] = useState(false);
    const [filtersState, setFiltersState] = useState(false);

    // console.log(`Все данные:\ndata = ${JSON.stringify(works, null, 4)}`);

    return (
        <div className="tab-work section__tab">
            <div className="tab-work__header">
                <IconButton
                    nameClass="icon-btn__add-service icon-btn"
                    text="Добавить услугу"
                    icon="plus_wh.svg"
                    onClick={() => setAddServiceState(!addServiceState)}
                />
                <div className="tab-work__header-filters">
                    <IconButton
                        nameClass="icon-btn__filters-works icon-btn"
                        text="Фильтры"
                        icon="filters.svg"
                        onClick={() => setFiltersState(true)}
                    />
                    {filtersState && (
                        <WorksFiltersPopup
                            additClass="works"
                            options={options}
                            statePopup={filtersState}
                            setStatePopup={setFiltersState}
                        />
                    )}
                </div>
            </div>
            <div className="tab-work__wrapper">
                <div className="tab-work-tree">
                    <TreeHeader />
                    <Tree additClass="works" testData={works} />
                </div>
            </div>
            {addServiceState &&
                createPortal(
                    <AddServicePopup
                        title="Новая услуга"
                        additClass="add-service"
                        options={options}
                        addServiceState={addServiceState}
                        setAddServiceState={setAddServiceState}
                    />,
                    document.getElementById('portal')
                )}
        </div>
    );
}
