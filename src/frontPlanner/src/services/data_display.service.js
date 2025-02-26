// Импорт доп.функционала
import { dataLoader, findNestedObj } from '@helpers/helper';

// Импорт конфигураций
import {
    DATA_CONVERSION_MAP,
    DEPARTMENT_DATA_CONF,
    EQUIPMENT_DATA_CONF,
    COMPANY_DATA_CONF
} from '@config/department.config';

//
import EMPLOYEES from '@data/usersData.json';

const formData = (data, partition, key) => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            return data && data.length !== 0
                ? data?.map(item => {
                      const newItem = {};
                      Object.keys(item).map(key => {
                          newItem[key] = DATA_CONVERSION_MAP[key] ? DATA_CONVERSION_MAP[key](item[key]) : item[key];
                      });
                      return newItem;
                  })
                : [];
        },
        // Оборудование
        equipment: () => {
            return data && data.length !== 0
                ? data?.map(item => {
                      const newItem = {};
                      Object.keys(item).map(key => {
                          newItem[key] = DATA_CONVERSION_MAP[key] ? DATA_CONVERSION_MAP[key](item[key]) : item[key];
                      });
                      return newItem;
                  })
                : [];
        },
        // Компания
        company: () => {
            const COMPANY_CONF = {
                // Структура компании
                structure: () => {},
                // Сотрудники компании
                employees: () => {
                    let newItem, newData;
                    newData = data.map(item => {
                        if (item && Object.keys(item).length !== 0) {
                            newItem = {};
                            newItem['id'] = item?.id;
                            newItem['responsible'] = {
                                fullName: item?.fullName,
                                post: item?.post,
                                photo: '/img/user.svg'
                            };
                            newItem['subsection'] = item?.subsection;
                            newItem['phone'] = item?.phone;
                            newItem['email'] = item?.email;
                        }
                        return newItem;
                    });
                    // console.log(`newData: ${JSON.stringify(newData, null, 4)}`);
                    return newData;
                }
            };
            return key ? COMPANY_CONF[key]() : [];
        }
    };
    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение отдела
const getSection = () => {
    if (localStorage.getItem('section')) return JSON.parse(localStorage.getItem('section'));
    else return { title: 'Нет данных' };
};

// Получение подразделения
const getSubsection = () => {
    if (localStorage.getItem('subsection')) return JSON.parse(localStorage.getItem('subsection'));
    else return { title: 'Нет данных' };
};

const loadData = async partition => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: async () => {
            // return formData(await dataLoader(`${window.location.origin}/contracts.json`), partition, null);
            // return formData(await dataLoader('http://10.199.254.28:3000/api/'), partition, null);
            return formData(await dataLoader(`${window.location.origin}/api/`), partition, null);
        },
        // Оборудование
        equipment: async () => {
            return formData(await dataLoader(`${window.location.origin}/equipment.json`), partition, null);
        },
        // Компания
        company: async () => {
            return {
                structure: await dataLoader(`${window.location.origin}/structure_company.json`),
                employees: formData(await dataLoader(`${window.location.origin}/api/employee/`), partition, 'employees')
                // employees: formData(EMPLOYEES, partition, 'employees')
            };
        }
    };

    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение всех отделов
const getSections = partition => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            return DEPARTMENT_DATA_CONF.map(item => ({ title: item?.title }));
        },
        // Оборудование
        equipment: () => {
            return EQUIPMENT_DATA_CONF.map(item => ({ title: item?.title }));
        },
        // Компания
        company: () => {
            return COMPANY_DATA_CONF.map(item => ({ title: item?.title }));
        }
    };

    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение всех подразделений отдела
const getSubsections = (partition, section) => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            // console.log(
            //     `Производственный департамент - getSubsections: ${JSON.stringify({ section: section }, null, 4)}`
            // );
            if (section && Object.keys(section).length !== 0) {
                const subsections = findNestedObj(DEPARTMENT_DATA_CONF, 'title', section?.title)?.subsections;
                return subsections && subsections.length !== 0 ? subsections.map(item => ({ title: item?.title })) : [];
            }
        },
        // Оборудование
        equipment: () => {
            // console.log(`Оборудование - getSubsections: ${JSON.stringify({ section: section }, null, 4)}`);
            if (section && Object.keys(section).length !== 0) {
                const subsections = findNestedObj(EQUIPMENT_DATA_CONF, 'title', section?.title)?.subsections;
                return subsections && subsections.length !== 0 ? subsections.map(item => ({ title: item?.title })) : [];
            }
        },
        // Компания
        company: () => {
            // console.log(`Компания - getSubsections: ${JSON.stringify({ section: section }, null, 4)}`);
            if (section && Object.keys(section).length !== 0) {
                const subsections = findNestedObj(COMPANY_DATA_CONF, 'title', section?.title)?.subsections;
                return subsections && subsections.length !== 0 ? subsections.map(item => ({ title: item?.title })) : [];
            }
        }
    };

    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение режимов отображения
const getDisplayModes = (partition, section, subsection) => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            // console.log(
            //     `Производственный департамент - getDisplayModes: ${JSON.stringify(
            //         { section: section, subsection: subsection || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (section && subsection) {
                if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                    const subsections = findNestedObj(DEPARTMENT_DATA_CONF, 'title', section?.title)?.subsections;
                    const displayModes = findNestedObj(subsections, 'title', subsection?.title)?.displayModes;
                    return displayModes && displayModes.length !== 0 ? displayModes : [];
                }
            }
        },
        // Оборудование
        equipment: () => {
            // console.log(
            //     `Оборудование - getDisplayModes: ${JSON.stringify(
            //         { section: section, subsection: subsection || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (section && subsection) {
                //
            } else if (section && !subsection) {
                const displayModes = findNestedObj(EQUIPMENT_DATA_CONF, 'title', section?.title)?.displayModes;
                return displayModes && displayModes.length !== 0 ? displayModes : [];
            }
        },
        // Компания
        company: () => {
            // console.log(
            //     `Компания - getDisplayModes: ${JSON.stringify(
            //         { section: section, subsection: subsection || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (section && subsection) {
                if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                    const subsections = findNestedObj(COMPANY_DATA_CONF, 'title', section?.title)?.subsections;
                    const displayModes = findNestedObj(subsections, 'title', subsection?.title)?.displayModes;
                    return displayModes && displayModes.length !== 0 ? displayModes : [];
                }
            } else if (section && !subsection) {
                if (Object.keys(section).length !== 0) {
                    const displayModes = findNestedObj(COMPANY_DATA_CONF, 'title', section?.title)?.displayModes;
                    return displayModes && displayModes.length !== 0 ? displayModes : [];
                }
            }
        }
    };
    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение опций режима отображения
const getModeOptions = (partition, section, subsection, mode) => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            // console.log(
            //     `Производственный департамент - getModeOptions: ${JSON.stringify(
            //         { section: section, subsection: subsection || {}, mode: mode || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                        const displayModes = getDisplayModes(partition, section, subsection);
                        if (displayModes && displayModes.length !== 0)
                            return findNestedObj(displayModes, 'keyMode', mode?.key)?.modeOptions || [];
                    }
                }
            }
            return [];
        },
        // Оборудование
        equipment: () => {
            // console.log(
            //     `Оборудование - getModeOptions: ${JSON.stringify(
            //         { section: section, subsection: subsection || {}, mode: mode || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    //
                } else if (section && !subsection) {
                    if (Object.keys(section).length !== 0) {
                        const displayModes = getDisplayModes(partition, section, subsection);
                        if (displayModes && displayModes.length !== 0)
                            return findNestedObj(displayModes, 'keyMode', mode?.key)?.modeOptions || [];
                    }
                }
            }
            return [];
        },
        // Компания
        company: () => {
            // console.log(
            //     `Компания - getModeOptions: ${JSON.stringify(
            //         { section: section, subsection: subsection || {}, mode: mode || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                        const displayModes = getDisplayModes(partition, section, subsection);
                        if (displayModes && displayModes.length !== 0)
                            return findNestedObj(displayModes, 'keyMode', mode?.key)?.modeOptions || [];
                    }
                } else if (section && !subsection) {
                    if (Object.keys(section).length !== 0) {
                        const displayModes = getDisplayModes(partition, section, subsection);
                        if (displayModes && displayModes.length !== 0)
                            return findNestedObj(displayModes, 'keyMode', mode?.key)?.modeOptions || [];
                    }
                }
            }
            return [];
        }
    };
    // console.log(`partition: ${JSON.stringify(partition, null, 4)}`);
    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение определенной опции режима отображения
const getModeOption = (partition, section, subsection, mode) => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            // console.log(
            //     `Производственный департамент - getModeOptions: ${JSON.stringify(
            //         { section: section, subsection: subsection || {}, mode: mode || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                        const modeOptions = getModeOptions(section, subsection, mode);
                        if (modeOptions && modeOptions.length !== 0) return modeOptions[0];
                    }
                }
            }
            return {};
        },
        // Оборудование
        equipment: () => {
            // console.log(
            //     `Оборудование - getModeOptions: ${JSON.stringify(
            //         { section: section, subsection: subsection || {}, mode: mode || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    //
                } else if (section && !subsection) {
                    if (Object.keys(section).length !== 0) {
                        const modeOptions = getModeOptions(section, subsection, mode);
                        if (modeOptions && modeOptions.length !== 0) return modeOptions[0];
                    }
                }
            }
            return {};
        },
        // Компания
        company: () => {
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                        const modeOptions = getModeOptions(section, subsection, mode);
                        if (modeOptions && modeOptions.length !== 0) return modeOptions[0];
                    }
                } else if (section && !subsection) {
                    if (Object.keys(section).length !== 0) {
                        const modeOptions = getModeOptions(section, subsection, mode);
                        if (modeOptions && modeOptions.length !== 0) return modeOptions[0];
                    }
                }
            }
            return {};
        }
    };
    return partition ? PARTITION_CONF[partition]() : {};
};

// Получение данных для отображения
const getValuesToDisplay = (partition, section, subsection, mode) => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            // console.log(
            //     `Производственный департамент - getValuesToDisplay: ${JSON.stringify(
            //         { section: section, subsection: subsection || {}, mode: mode || {} },
            //         null,
            //         4
            //     )}`
            // );
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                        const displayModes = getDisplayModes(partition, section, subsection);
                        if (displayModes && displayModes.length !== 0)
                            return findNestedObj(displayModes, 'keyMode', mode?.key)?.keys || [];
                    }
                }
            }
            return [];
        },
        // Оборудование
        equipment: () => {
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    //
                } else if (section && !subsection) {
                    if (Object.keys(section).length !== 0) {
                        const displayModes = getDisplayModes(partition, section, subsection);
                        if (displayModes && displayModes.length !== 0)
                            return findNestedObj(displayModes, 'keyMode', mode?.key)?.keys || [];
                    }
                }
            }
            return [];
        },
        // Компания
        company: () => {
            if (mode && Object.keys(mode).length !== 0) {
                if (section && subsection) {
                    if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                        const displayModes = getDisplayModes(partition, section, subsection);
                        if (displayModes && displayModes.length !== 0)
                            return findNestedObj(displayModes, 'keyMode', mode?.key)?.keys || [];
                    }
                } else if (section && !subsection) {
                    if (Object.keys(section).length !== 0) {
                        const displayModes = getDisplayModes(partition, section, subsection);
                        if (displayModes && displayModes.length !== 0)
                            return findNestedObj(displayModes, 'keyMode', mode?.key)?.keys || [];
                    }
                }
            }
            return [];
        }
    };
    return partition ? PARTITION_CONF[partition]() : [];
};

// Получение операций с данными
const getDataOperations = (partition, section, subsection) => {
    const PARTITION_CONF = {
        // Производственный департамент
        department: () => {
            if (section && subsection) {
                if (Object.keys(section).length !== 0 && Object.keys(subsection).length !== 0) {
                    const subsections = findNestedObj(DEPARTMENT_DATA_CONF, 'title', section?.title)?.subsections;
                    const dataOperations = findNestedObj(subsections, 'title', subsection?.title)?.dataOperations;
                    return dataOperations && dataOperations.length !== 0 ? dataOperations : [];
                }
            }
        },
        // Оборудование
        equipment: () => {},
        // Компания
        company: () => {}
    };
    return partition ? PARTITION_CONF[partition]() : [];
};

// Сеттеры
const setSection = section => {
    localStorage.setItem('section', JSON.stringify(section));
};

const setSubsection = subsection => {
    localStorage.setItem('subsection', JSON.stringify(subsection));
};

// const PARTITION_CONF = {
//     // Производственный департамент
//     department: () => {
//     },
//     // Оборудование
//     equipment: () => {},
//     // Компания
//     company: () => {}
// };

const DataDisplayService = {
    loadData,
    getSections,
    getSection,
    getSubsections,
    getSubsection,
    getDisplayModes,
    getModeOptions,
    getModeOption,
    getValuesToDisplay,
    getDataOperations,
    setSection,
    setSubsection
};

export default DataDisplayService;
