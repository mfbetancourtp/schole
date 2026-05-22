import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';
import {CreateOrUpdateUserDto} from '../dtos/createOrUpdateUser.dto';

export class CreateOrUpdateUserService extends CreateOrUpdateBaseService<CreateOrUpdateUserDto> {
    url = `${services.users}/access/users`;
}