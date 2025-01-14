import { UserStore } from '../stores/user-store';
import { IRegisterRequest } from '../types/register-request';
import { ILoginRequest } from '../types/login-request';
import HttpService from './http.service';

interface ILoginResponse {
    access_token: string;
}

interface IAuthResponse {
    authorizationCode: string;
    redirectUrl: string;
    sid: string | null;
}

export default class AuthenticationService extends HttpService {
    private tokenUrl = `${__UT4UU_API_URL}/account/api/oauth/token`;
    private authUrl = `${__UT4UU_API_URL}/account/api/oauth/auth`;
    private registerUrl = `${__UT4UU_API_URL}/account/api/create/account`;

    async logIn(request: ILoginRequest) {
        const session = await this.post<ILoginResponse, ILoginRequest>(this.tokenUrl, {
            body: request,
            headers: {
                'Authorization': 'basic MzRhMDJjZjhmNDQxNGUyOWIxNTkyMTg3NmRhMzZmOWE6ZGFhZmJjY2M3Mzc3NDUwMzlkZmZlNTNkOTRmYzc2Y2Y='
            }
        });
        console.debug('Token response JSON: ', session);

        const token = session.access_token;
        UserStore.authToken = token;
        
        const authResponse = await this.get<IAuthResponse>(this.authUrl);
        console.debug('Auth response JSON: ', authResponse);
        UserStore.authCode = authResponse.authorizationCode;
        UserStore.username = request.username;

        return authResponse;
    }

    async register(request: IRegisterRequest) {
        UserStore.saveUsername = true;
        UserStore.username = request.username;
        return await this.post<unknown, IRegisterRequest>(this.registerUrl, { body: request });
    }
}
