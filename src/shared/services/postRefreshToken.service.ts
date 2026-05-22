import axios from 'axios';
import { services } from '../constant/services';

interface Iparams {
  token: string;
}
export class PostRefreshTokenService {
  run(params: Iparams) {
    return axios.post(`${services.users}/access/refresh-token`, params).then((response) => response.data);
  }
}
