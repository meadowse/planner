import axios from 'axios';

const getTasksContract = async idContract => {
    let result = [];
    await axios
        .post(`${window.location.origin}/api/getTasksContracts`, { contractId: idContract })
        .then(response => {
            if (response.status === 200) {
                if (response.data && response.data.length !== 0) {
                    result = response.data;
                    return result;
                }
            }
        })
        .catch(error => {
            if (error.response) {
                console.log('server responded');
            } else if (error.request) {
                console.log('network error');
            } else {
                console.log(error);
            }
        });
    return result;
};

const GanttService = {
    getTasksContract
};

export default GanttService;
