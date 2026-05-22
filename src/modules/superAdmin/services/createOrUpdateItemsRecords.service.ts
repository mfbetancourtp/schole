import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface IParams {
    code: string,
    icon : string
    showMenu: number,
    isReport : number,
    itemParentId: number | null;
    moduleId: number | null,
    order : number | null,
    route: string,
    name : string | null,
  }


export class CreateOrUpdateItemsRecordsService extends CreateOrUpdateBaseService<IParams> {
  url = `${services.admin}/configure-menu/items`;
}