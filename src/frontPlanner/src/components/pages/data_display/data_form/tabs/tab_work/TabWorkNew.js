import { useEffect, useState } from 'react';
import axios from 'axios';

// Импорт компонентов
import ListMode from '../../../display_modes/table/ListMode';

// Импорт сервиосв
import DataFormService from '@services/data_form.service';

// Импорт стилей
import './tab_worknew.css';

export default function TabWorkNew(props) {
    const { idContract, partition, tab } = props;

    const [works, setWorks] = useState([]);
    const [tasks, setTasks] = useState([]);

    // Загрузка данных
    async function loadData() {
        const data = await DataFormService.loadData(tab, { contractId: idContract });
        console.log(`data: ${JSON.stringify(data, null, 4)}`);
        if (data && Object.keys(data).length !== 0) {
            if (data?.works && data?.works.length !== 0) setWorks(data?.works);
            if (data?.tasks && data?.tasks.length !== 0) setTasks(data?.tasks);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="tab-work section__tab">
            <div className="tab-work__main">
                <ListMode
                    testData={works}
                    modeConfig={{
                        keys: ['number', 'typeWork', 'deadline', 'dateDone', 'done'],
                        partition: partition,
                        dataOperations: [],
                        idContract: idContract
                    }}
                />
                <ListMode
                    testData={tasks}
                    modeConfig={{
                        keys: ['task', 'director', 'executor', 'deadlineTask', 'done'],
                        partition: partition,
                        dataOperations: [],
                        idContract: idContract
                    }}
                />
            </div>
        </div>
    );
}
