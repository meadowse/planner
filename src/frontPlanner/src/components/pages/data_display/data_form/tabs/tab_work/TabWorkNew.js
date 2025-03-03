import { useEffect, useState } from 'react';
import axios from 'axios';

// Импорт компонентов
import ListMode from '../../../display_modes/table/ListMode';

// Импорт сервиосв
import DataFormService from '@services/data_form.service';

// Импорт стилей
import './tab_worknew.css';

export default function TabWorkNew({ idContract, partition, tab }) {
    const [works, setWorks] = useState([]);
    const [tasks, setTasks] = useState([]);

    // async function loadData() {
    //     await axios.post(`${window.location.origin}/api/getTypesWork`, { contractId: idContract }).then(response => {
    //         if (response?.status === 200) {
    //             if (response?.data && response?.data.length !== 0) setWorks(response?.data);
    //         }
    //     });

    //     await axios
    //         .post(`${window.location.origin}/api/getTasksContracts`, { contractId: idContract })
    //         .then(response => {
    //             if (response?.status === 200) {
    //                 if (response?.data && response?.data.length !== 0) setTasks(response?.data);
    //             }
    //         });
    // }

    // useEffect(() => {
    //     loadData();
    // }, []);

    useEffect(async () => {
        const data = await DataFormService.loadData(tab, { contractId: idContract });
        console.log(`data: ${JSON.stringify(data, null, 4)}`);
        if (data && Object.keys(data).length !== 0) {
            if (data?.works && data?.works.length !== 0) setWorks(data?.works);
            if (data?.tasks && data?.tasks.length !== 0) setTasks(data?.tasks);
        }
    }, []);

    return (
        <div className="tab-work section__tab">
            <div className="tab-work__main">
                <ListMode
                    partition={partition}
                    keys={['number', 'typeWork', 'deadline', 'dateDone', 'done']}
                    testData={works}
                    dataOperations={[]}
                />
                <ListMode
                    partition={partition}
                    keys={['task', 'director', 'executor', 'deadlineTask', 'done']}
                    testData={tasks}
                    dataOperations={[]}
                />
            </div>
        </div>
    );
}
