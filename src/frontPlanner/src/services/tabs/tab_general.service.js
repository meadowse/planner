import { DEFAULT_VALUES, TAB_GENERAL_CONF } from '@config/tabs/tab_general.config';

const getOptions = key => {
    return TAB_GENERAL_CONF[key];
};

const changeContactData = (key, event, indContact, prevContact, setContactData, onChangeByInd) => {
    const CONTACT_CONF = {
        fullName: () => {
            setContactData({
                fullName: event.target.value,
                post: prevContact?.post,
                phone: prevContact?.phone,
                email: prevContact?.email
            });
            onChangeByInd(event, 'contacts', indContact);
        },
        post: () => {
            setContactData({
                fullName: prevContact.fullName,
                post: event.target.value,
                phone: prevContact.phone,
                email: prevContact.email
            });
            onChangeByInd(event, 'contacts', indContact);
        },
        phone: () => {
            setContactData({
                fullName: prevContact.fullName,
                post: prevContact.post,
                phone: event.target.value,
                email: prevContact.email
            });
            onChangeByInd(event, 'contacts', indContact);
        },
        email: () => {
            setContactData({
                fullName: prevContact.fullName,
                post: prevContact.post,
                phone: prevContact.phone,
                email: event.target.value
            });
            onChangeByInd(event, 'contacts', indContact);
        }
    };
    return CONTACT_CONF[key]();
};

const getGeneralData = (data, disabledFields) => {
    const dataConf = {};

    if (data && Object.keys(data).length !== 0) {
        if (disabledFields && Object.keys(disabledFields).length !== 0) {
            Object.keys(data).map(key =>
                DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined && !disabledFields[key]
                    ? (dataConf[key] = DEFAULT_VALUES[key](data[key]))
                    : null
            );
        } else if (disabledFields && Object.keys(disabledFields).length === 0) {
            Object.keys(data).map(key =>
                DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined
                    ? (dataConf[key] = DEFAULT_VALUES[key](data[key]))
                    : null
            );
        }
    } else {
        Object.keys(DEFAULT_VALUES).map(key =>
            DEFAULT_VALUES[key] && DEFAULT_VALUES[key] !== undefined ? (dataConf[key] = DEFAULT_VALUES[key]()) : null
        );
    }

    // console.log(`dataConf: ${JSON.stringify(dataConf, null, 4)}`);

    return dataConf;
};

const TabGeneralService = {
    getOptions,
    getGeneralData,
    changeContactData
};

export default TabGeneralService;
