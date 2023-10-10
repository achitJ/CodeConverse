import { userApi } from '@/api';

class UserApi {
    static async login(email: string, password: string) {
        const response = await userApi.post('/login', {
            email,
            password,
        });
        return response.data;
    }

    static async register(name: string, email: string, password: string) {
        const response = await userApi.post('/register', {
            name,
            email,
            password,
        });
        return response.data;
    }

    static async logout() {
        const response = await userApi.delete('/logout');
        return response.data;
    }

    static async getUserDetails() {
        const response = await userApi.get('/me');
        return response.data;
    }
};

export default UserApi;