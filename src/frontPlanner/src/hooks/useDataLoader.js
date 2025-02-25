import { useState, useEffect } from 'react';
import axios from 'axios';

export const useDataLoader = path => {
    const [data, setData] = useState([]);

    useEffect(() => {
        console.log(`path:${path}`);
        async function fetchData() {
            await axios
                .get(path, {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response.status === 200) setData(response.data);
                })
                .catch(err => console.error('Failed to fetch', err));
        }
        fetchData();
    }, []);

    return data;
};
