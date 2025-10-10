// Импорт доп.функционала
import { isObject, isArray } from '@helpers/helper';

//
const compareData = (newData, storageData) => {
    console.log(`newData: ${JSON.stringify(newData, null, 4)} \n storageData: ${JSON.stringify(storageData, null, 4)}`);
    const difference = JSON.stringify(newData) !== JSON.stringify(storageData);

    console.log(`compareData: ${difference}`);
    return difference;
};

const LocalStorageService = {
    compareData
};

export default LocalStorageService;
