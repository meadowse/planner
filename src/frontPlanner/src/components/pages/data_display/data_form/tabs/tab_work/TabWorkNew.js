import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

// Импорт компонентов
import ListMode from '../../../display_modes/table/ListMode';

// Импорт сервиосв
import DataFormService from '@services/data_form.service';

// Импорт стилей
import './tab_worknew.css';

export default function TabWorkNew({ tab, partition }) {
    const [works, setWorks] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const data = DataFormService.loadData(tab, null);
        // console.log(`tab: ${tab}\ndata: ${JSON.stringify(data, null, 4)}`)
        if (data && Object.keys(data).length !== 0) {
            setWorks(data?.works);
            setTasks(data?.tasks);
        }
    }, [])


    return <div className="tab-work section__tab">
        <div className='tab-work__main'>
            <ListMode
                partition={partition}
                keys={["number", "typeWork", "deadline", "dateDone", "done"]}
                testData={works}
                dataOperations={[]}
            />
            <ListMode
                partition={partition}
                keys={["task", "director", "executor", "dateDone",]}
                testData={tasks}
                dataOperations={[]}
            />
        </div>
    </div>;
}