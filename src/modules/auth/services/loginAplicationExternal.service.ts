import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

import { LoginDto, ParamsFormLoginDto } from '../dtos/login.dto';

export class LoginAplicationExternalService {
  async run(data: ParamsFormLoginDto): Promise<LoginDto> {
    const loginUrl = `${services.users}/access/users/login`;
    const response = await axios.post<LoginDto>(loginUrl, data);

    localStorage.setItem('token', response.data.token);

    return response.data;
  }
}
