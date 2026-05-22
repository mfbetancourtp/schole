import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
interface IParams  {
  convocationId: number;
  user: {
    userToken: string;
    password: string;
    passwordConfirmation: string;
  };
  people: {
    identification: string;
    email: string;
    firstName: string;
    secondName: string;
    firstLastname: string;
    secondLastname: string;
  };
}
export class InscripcionConvocationUnregisteredUserService {
  async run(institutionId: number, data: IParams) {
    return await axios.post(`${services.academic}/academic-planning/register-convocations-enrolls?institutionId=${institutionId}`, data);
  }
}