import axios from 'axios';

export function isObject(obj) {
    return typeof obj === 'object' && !Array.isArray(obj) && !(obj instanceof Array);
}

export function isArray(arr) {
    return arr instanceof Array;
}

export function isString(value) {
    return typeof value === 'string';
}

export function isDate(value) {
    return typeof value === 'string' ? !isNaN(parseInt(value)) : !isNaN(value);
}

// Функция получения ключа по значению
export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

// Функция получения объекта по ключу
export function getObjectByValue(data, key, value) {
    return data.filter(obj => {
        return obj[key] === value;
    })[0];
}

export function getObjectByValueWithInd(data, key, value) {
    let ind = -1;
    let newData = data.filter((obj, indObj) => {
        if (obj[key] === value) {
            ind = indObj;
            return true;
        }
    });
    newData.push(ind);
    return newData;
}

export function findNestedObj(entireObj, keyToFind, valToFind) {
    let foundObj;
    JSON.stringify(entireObj, (_, nestedValue) => {
        if (nestedValue && nestedValue[keyToFind] === valToFind) {
            foundObj = nestedValue;
        }
        return nestedValue;
    });
    return foundObj;
}

// Функция фильтрации данных
export function getFilteredData(data, selectedItem, option) {
    console.log(`selectedItem: ${JSON.stringify(selectedItem, null, 4)}\noption: ${JSON.stringify(option, null, 4)}`);
    const filteredData =
        data && data.length !== 0
            ? data?.filter(item => {
                  if (item) {
                      if (
                          item[option?.key] &&
                          typeof item[option?.key] === 'object' &&
                          !Array.isArray(item[option?.key])
                      ) {
                          const values =
                              item[option?.key] && Object.keys(item[option?.key]).length !== 0
                                  ? Object.values(item[option?.key])
                                  : [];
                          if (values && values.length !== 0 && values.includes(selectedItem)) return true;
                      }
                      if (item[option?.key] && isArray(item[option?.key]) && item[option?.key].length !== 0) {
                          const values = [];
                          simplifyData(item[option?.key]).forEach(value => {
                              value.forEach(val => values.push(val));
                          });
                          if (values && values.length !== 0 && values.includes(selectedItem)) return true;
                          // console.log(`is Arr values; ${JSON.stringify(values, null, 4)}`);
                      }
                      return item[option?.key] === selectedItem ? true : false;
                  }
                  return false;
              })
            : [];

    // console.log(`filteredData: ${JSON.stringify(filteredData, null, 4)}`);

    return filteredData;
}

function simplifyItem(item, newItem = []) {
    let newData = newItem;

    if (isObject(item) && Object.keys(item).length !== 0) {
        Object.keys(item).forEach(key => {
            if (item[key]) {
                if (isObject(item[key]) && Object.keys(item[key]).length !== 0) {
                    Object.values(item[key]).forEach(elem => elem && newData.push(elem));
                } else if (isArray(item[key]) && item[key].length !== 0)
                    item[key].map(subitem => subitem && simplifyItem(subitem, newData));
                else if (!isObject(item[key]) && !isArray(item[key])) newData.push(item[key]);
            }
        });
    } else newData.push(item);

    return newData;
}

// Функция для преобразования сложной структуры данных в более упрощенную
export function simplifyData(data) {
    const newData = [];
    let newItem = [];

    if (data && isArray(data) && data.length !== 0) {
        data?.forEach(item => {
            if (isObject(item) && Object.keys(item).length !== 0) {
                newData.push(simplifyItem(item, newItem));
                newItem = [];
            }
        });
        // console.log(`simplifyData newData: ${JSON.stringify(newData, null, 4)}`);
    }

    return newData;
}

// Функция для получения уникальных данных
export function getUniqueDataOld(data, prop) {
    return Array.from(
        new Set(
            data.map(item => {
                if (item) {
                    if (Array.isArray(item[prop])) return item[prop].map(subItem => JSON.stringify(subItem));
                    else return JSON.stringify(item[prop]);
                }
            })
        )
    )
        .map(item => item && JSON.parse(item))
        .filter(item => {
            if (item) {
                if (typeof item === 'object' && !Array.isArray(item)) {
                    if (Object.keys(item).length === 0) return false;
                }
                if (typeof item === 'string') {
                    if (item.length === 0) return false;
                }
                return true;
            }
        });
}

export function getUniqueData(data, option) {
    let newData;

    const isPropValuesEqual = (item, foundItem) => {
        if (item && foundItem) {
            if (isObject(item) && Object.keys(item).length !== 0)
                return item[option?.uniqueness] === foundItem[option?.uniqueness];
            else if (isArray(item) && item.length !== 0) return JSON.stringify(item) === JSON.stringify(foundItem);
            else return item === foundItem;
        }
    };

    newData =
        data && data.length !== 0
            ? option && Object.keys(option).length !== 0
                ? data.filter((item, index, array) => {
                      return (
                          index ===
                          array.findIndex(foundItem => isPropValuesEqual(item[option?.key], foundItem[option?.key]))
                      );
                  })
                : null
            : null;

    // console.log(`UniqueData: ${JSON.stringify(newData, null, 4)}`);

    return newData;
}

// Извлечение данных из массива объектов
// или просто объекта по свойствам
export const extractSampleData = (data, keys) => {
    if (data) {
        if (data instanceof Array) {
            if (!keys || keys.length === 0) return data;
            else if (keys && keys.length === 0) return data;
            else {
                const newData = [];

                data.map(item => {
                    let obj = {};
                    keys.map(key => (item[key] !== undefined ? (obj[key] = item[key]) : null));
                    newData.push(obj);
                });
                // console.log(`newData: ${JSON.stringify(newData, null, 4)}`);
                return newData;
            }
        } else if (typeof data === 'object' && !Array.isArray(data)) {
            if (!keys || keys.length === 0) return data;
            else if (keys && keys.length !== 0) {
                const newData = {};
                keys.map(key => (data[key] !== undefined ? (newData[key] = data[key]) : null));
                // console.log(`newData: ${JSON.stringify(newData, null, 4)}`);
                return newData;
            }
        }
    } else return [];
};

// Функция загрузки данных
// export const dataLoader = async path => {
//     return await fetch(path)
//         .then(response => {
//             return response.json();
//         })
//         .catch(err => console.error('Failed to fetch', err));
// };

export const dataLoader = async path => {
    const config = {
        // timeout: 120000,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const response = await axios.get(path, config).catch(error => {
        if (error.response) {
            console.log('server responded');
        } else if (error.request) {
            console.log('network error');
        } else {
            console.log(error);
        }
    });
    return response.data || [];
};

// Функция поиска данных внутри объекта
export const objectSearch = (obj, val) => {
    return Object.keys(obj).some(function (key) {
        if (Array.isArray(obj[key]) || (typeof obj[key] === 'object' && obj[key] !== null)) {
            return objectSearch(obj[key], val);
        }
        return obj[key] === val;
    });
};

// Функция для получения всех значений по ключу
export function getAllValuesByKey(data, searchKey, res = []) {
    let result = res;

    data.map(item => {
        Object.keys(item).map(key => {
            if (item[key] instanceof Array) return getAllValuesByKey(item[key], searchKey, result);
            if (key === searchKey) result.push(item[key]);
        });
    });
    return result;
}
