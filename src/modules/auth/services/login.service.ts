import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { LoginDto, ParamsFormLoginDto } from '../dtos/login.dto';

import { TokenService } from '../../../shared/services/token.service';
import { SignOutService } from '../../../shared/services/signOut.service';
import { AuthenticatedUserService } from '../../../shared/services/authenticatedUser.service';
import { SessionIdService } from '../../../shared/services/sessionId.service';

export class LoginService {
  private readonly authenticatedUserService = new AuthenticatedUserService();
  private readonly sessionIdService = new SessionIdService();
  private readonly signOutService = new SignOutService();
  private readonly tokenService = new TokenService();

  async run(data: ParamsFormLoginDto): Promise<LoginDto> {
    this.signOutService.run();

    const loginUrl = `${services.users}/access/users/login`;
    const response = await axios.post<LoginDto>(loginUrl, data);

    this.tokenService.set(response.data.token);
    this.sessionIdService.set(response.data.sessionId);
    this.authenticatedUserService.set(response.data.user);

    return response.data;
  }
}
