import { useEffect, useState } from 'react';
import { useLocation, useLoaderData, useOutletContext } from 'react-router-dom';

// Импорт компонентов
import ListMode from '@components/pages/data_display/display_modes/table/ListMode';
import Preloader from '../../../../../auxiliary_pages/loader/Preloader';

// Импорт стилей
import './tab_worknew.css';

export default function TabWorkNew() {
    const { idContract, partition } = useOutletContext();
    const { uploadedData } = useLoaderData();

    const [works, setWorks] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log(`loaded data: ${JSON.stringify(uploadedData, null, 4)}`);
        if (uploadedData && Object.keys(uploadedData).length !== 0) {
            setWorks(uploadedData?.works);
            setTasks(uploadedData?.tasks);
            setLoading(false);
        }
    }, [uploadedData]);

    return (
        <div className="tab-work section__tab">
            {loading ? (
                <Preloader />
            ) : (
                <div className="tab-work__main">
                    <ListMode
                        key={`${partition}-table-works`}
                        testData={works.sort((a, b) => parseInt(a?.number) - parseInt(b?.number))}
                        modeConfig={{
                            keys: ['number', 'typeWork', 'deadline', 'dateDone', 'done'],
                            partition: partition,
                            dataOperations: [],
                            idContract: idContract
                        }}
                    />
                    <ListMode
                        key={`${partition}-table-tasks`}
                        testData={tasks.sort((a, b) => parseInt(a?.id) - parseInt(b?.id))}
                        modeConfig={{
                            keys: ['task', 'director', 'executor', 'deadlineTask', 'done'],
                            partition: partition,
                            dataOperations: [],
                            idContract: idContract
                        }}
                    />
                </div>
            )}
        </div>
    );
}

{
    /* {works && works.length !== 0 ? (
                    <ListMode
                        key={`${partition}-table-works`}
                        testData={works.sort((a, b) => parseInt(b?.number) - parseInt(a?.number))}
                        modeConfig={{
                            keys: ['number', 'typeWork', 'deadline', 'dateDone', 'done'],
                            partition: partition,
                            dataOperations: [],
                            idContract: idContract
                        }}
                    />
                ) : null} */
}
{
    /* {tasks && tasks.length !== 0 ? (
                    <ListMode
                        key={`${partition}-table-tasks`}
                        testData={tasks.sort((a, b) => parseInt(b?.id) - parseInt(a?.id))}
                        modeConfig={{
                            keys: ['task', 'director', 'executor', 'deadlineTask', 'done'],
                            partition: partition,
                            dataOperations: [],
                            idContract: idContract
                        }}
                    />
                ) : null} */
}
