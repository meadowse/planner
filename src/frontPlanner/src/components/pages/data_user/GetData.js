import { useState, useEffect } from 'react';

export default function GetData(path) {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(path)
            .then(response => response.json())
            .then(data => {
                setData(data);
            })
            .catch(err => console.error('Failed to fetch', err));
    }, []);

    return data;
}
