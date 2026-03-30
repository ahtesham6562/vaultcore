import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const authService = {
    login: async (username, password) => {
        const response = await axios.post(`${API_URL}/login`, {
            username,
            password
        });
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    register: async (username, email, password, phone) => {
        const response = await axios.post(`${API_URL}/register`, {
            username,
            email,
            password,
            phone
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    getToken: () => {
        return localStorage.getItem('accessToken');
    }
};

export default authService;