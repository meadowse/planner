import { useEffect, useRef } from 'react';

export const usePopup = (statePopup, setStatePopup) => {
    const popupRef = useRef();

    function onClickOutside(e) {
        if (!popupRef.current) return;
        if (!popupRef.current.contains(e.target)) setStatePopup(false);
    }

    useEffect(() => {
        if (!statePopup) return;
        document.addEventListener('mousedown', onClickOutside);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
        };
    }, []);

    return {
        popupRef,
        onClickOutside
    };
};
