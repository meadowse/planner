import { DATA_FORM_CONF } from '@config/data_form.config';

const getOptions = key => {
    return DATA_FORM_CONF[key];
};

const DataFormService = { getOptions };

export default DataFormService;
