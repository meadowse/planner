import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Импорт компонентов
import IconButton from '@components/generic/elements/buttons/IcButton';
import DropdownMenu from '@generic/elements/dropdown_menu/DropdownMenu';
import Preloader from '../../../../../auxiliary_pages/loader/Preloader';

// Импорт стилей
import './tab_worknew.css';



export default function TabWorkNew({ idContract }) {
    const [works, setWorks] = useState([]);
    const [isLoading, setLoading] = useState(true);

    async function loadData() {
        await axios.post(`${window.location.origin}/api/getTypesWork`, { contractId: idContract }).then(response => {
            if (response?.status === 200) {
                if (response?.data && response?.data.length !== 0) {
                    setWorks(response?.data);
                    setLoading(false);
                }
            }
        })
    }

    useEffect(() => {
        loadData();
        console.log(`works: ${JSON.stringify(works, null, 4)}`);
    }, [])


    return <div className="tab-work section__tab">
        {isLoading ? (
            <Preloader />
        ) : <p></p>}
    </div>;
}