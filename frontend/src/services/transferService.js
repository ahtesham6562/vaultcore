import axios from 'axios';

const API_URL = 'http://localhost:8080/api/transfer';

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
});

const transferService = {
    getBalance: async () => {
        const response = await axios.get(`${API_URL}/balance`, getAuthHeader());
        return response.data;
    },

    sendMoney: async (toAccountNo, amount, description) => {
        const response = await axios.post(
            `${API_URL}/send`,
            { toAccountNo, amount, description },
            getAuthHeader()
        );
        return response.data;
    },

    getHistory: async () => {
        const response = await axios.get(`${API_URL}/history`, getAuthHeader());
        return response.data;
    }
};

export default transferService;