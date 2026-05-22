import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface IParams {
    interfaceId: any,
    key : string
    value: string,
    languageId : number,
  }


export class CreateOrUpdateTranslationsService extends CreateOrUpdateBaseService<IParams> {
  url = `${services.admin}/languages-translations/translations`;
}