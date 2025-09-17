import { useEffect, useRef } from 'react';

export const useInputDataPopup = params => {
    const { statePopup, changeLink, setStatePopup } = params;
    const popupRef = useRef();

    function onItemClick(value) {}

    function onSaveData() {
        setStatePopup(false);
        if (changeLink) changeLink();
    }

    function onDelete() {
        setStatePopup(false);
        if (changeLink) changeLink();
    }

    function onCancelClick() {
        setStatePopup(false);
        if (changeLink) changeLink();
    }

    function onClickOutside(e) {
        if (!popupRef.current) return;
        if (!popupRef.current.contains(e.target)) {
            setStatePopup(false);
            if (changeLink) changeLink();
        }
    }

    useEffect(() => {
        // Пересмортеть логику клика вне области окна
        // if (!statePopup) return;
        // document.addEventListener('mousedown', onClickOutside);
        // return () => {
        //     document.removeEventListener('mousedown', onClickOutside);
        // };
    }, []);

    return { popupRef, onSaveData, onDelete, onCancelClick, onItemClick };
};
