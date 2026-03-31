import axios from 'axios';

const API_URL = 'http://localhost:8080/api/stocks';

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
});

const stockService = {
    getAllPrices: async () => {
        const response = await axios.get(`${API_URL}/prices`);
        return response.data;
    },

    getPrice: async (symbol) => {
        const response = await axios.get(`${API_URL}/price/${symbol}`);
        return response.data;
    },

    buyStock: async (symbol, quantity) => {
        const response = await axios.post(
            `${API_URL}/buy`,
            { symbol, quantity },
            getAuthHeader()
        );
        return response.data;
    },

    sellStock: async (symbol, quantity) => {
        const response = await axios.post(
            `${API_URL}/sell`,
            { symbol, quantity },
            getAuthHeader()
        );
        return response.data;
    },

    getPortfolio: async () => {
        const response = await axios.get(
            `${API_URL}/portfolio`,
            getAuthHeader()
        );
        return response.data;
    }
};

export default stockService;