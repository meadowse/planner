import { useEffect, useState } from 'react';
import { useLoaderData, useOutletContext } from 'react-router-dom';

// Импорт компонентов
import ListMode from '@components/pages/data_display/display_modes/table/ListMode';
import Preloader from '../../../../../auxiliary_pages/loader/Preloader';

{
    /* <div className="tab-general-row-wrapper" data-error={companyError ? companyError.message : null}>
    <div className="tab-general-row__company tab-general-row">
        <h2 className="tab-general-row__title">Компания</h2>
        <div className="tab-general__company tab-general-row-field">
            <input
                className="tab-general-row__input"
                name="company"
                type="text"
                value={company}
                disabled={disabledElem}
                onChange={e => onChangeCompany(e)}
            />
        </div>
    </div>
</div>; */
}

// Название проекта
function Name() {
    return <div></div>;
}

// Название проекта
function Stage() {
    return <div></div>;
}

// Ответсвенный
function Responsible() {
    return <div></div>;
}

// Описание
function Description() {
    return <div></div>;
}

// Дата добавления
function DateAdded() {
    return <div></div>;
}

// Дедлайн
function Deadline() {
    return <div></div>;
}

// Путь к папке
function PathToFolder() {
    return <div></div>;
}

function ProjectInfo() {
    return <div></div>;
}

export default function TabInnerProject() {
    const { idProject, partition, popupConf } = useOutletContext();

    const [loading, setLoading] = useState(false);

    return (
        <div className="tab-project section__tab">
            {loading ? (
                <Preloader />
            ) : (
                <div className="tab-project__main">
                    <ProjectInfo />
                    <ListMode
                        key={`${partition}-table-tasks`}
                        testData={[]}
                        modeConfig={{
                            keys: ['task', 'status', 'director', 'executor', 'deadlineTask'],
                            mode: {
                                key: 'listTasksProject'
                            },
                            partition: 'dataform',
                            path: `${window.location.pathname}`,
                            dataOperations: [],
                            popupConf,
                            idProject
                        }}
                    />
                </div>
            )}
        </div>
    );
}
