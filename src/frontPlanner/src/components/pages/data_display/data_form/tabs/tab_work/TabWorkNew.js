import { useContext, useEffect, useState } from 'react';
import { useLocation, useLoaderData, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';

// Импорт компонентов
import ListMode from '@components/pages/data_display/display_modes/table/ListMode';
import AddTaskToast from '@generic/elements/notifications/AddTaskToast';
import Preloader from '../../../../../auxiliary_pages/loader/Preloader';

// Импорт контекста
// import { SocketContext } from '../../../../../../contexts/socket.context';

// Импорт стилей
import './tab_worknew.css';

export default function TabWorkNew() {
    // const socket = useContext(SocketContext);
    const { idContract, partition } = useOutletContext();
    const { uploadedData } = useLoaderData();

    const [works, setWorks] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     socket.on('taskAssigned', taskData => {
    //         toast.info(<AddTaskToast task={taskData} />, { className: 'toast', position: 'bottom-right', icon: false });
    //         // alert(` Вам назначена новая задача: "${taskData.task}"`);
    //     });

    //     return () => {
    //         socket.off('taskAssigned');
    //     };
    // }, []);

    useEffect(() => {
        // console.log(`loaded data: ${JSON.stringify(uploadedData, null, 4)}`);
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
                            path: `${window.location.pathname}`,
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
                            path: `${window.location.pathname}`,
                            dataOperations: [],
                            idContract: idContract
                        }}
                    />
                </div>
            )}
        </div>
    );
}
