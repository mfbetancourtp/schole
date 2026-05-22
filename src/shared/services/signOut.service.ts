import axios from '../utils/axios';

import { services } from '../constant/services';

import { TokenService } from './token.service';
import { SessionIdService } from './sessionId.service';
import { SetCurrentStudentParentService } from '../../modules/administration/services/setCurrentStudentParent.service';

export class SignOutService {
  constructor(private tokenService = new TokenService(), private sessionIdService = new SessionIdService(), private setCurrentStudentParentService = new SetCurrentStudentParentService()) {}

  async run() {
    const url = `${services.users}/access/logout`;
    const sessionId = this.sessionIdService.get();

    try {
      const data = {
        sessionId,
      };

      if (sessionId) await axios.post(url, data);
    } catch (error) {
      console.log(error);
    }

    this.tokenService.delete();
    this.sessionIdService.delete();
    this.setCurrentStudentParentService.delete();

    localStorage.clear();
  }
}
