import axios from '../utils/axios';
import {JsonToFormDataService} from './jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class UpdateBaseNoneIdService<ICreateOrUpdateContentService> {
    url = '';
    isFormData = false;
    params = {};

    async run(data: ICreateOrUpdateContentService, id?: number): Promise<any> {
        let newData: any = data;

        if (this.isFormData) {
            newData = jsonToFormDataService.run(data);
        }

       
            return await this.update(newData);
       
    }

    private async create(data: any): Promise<any> {
        return axios.post(this.url, data, {
            params: this.params,
        }).then(response => response.data);
    }

    private async update(data: any): Promise<any> {
        return axios.put(this.url, data, {
            params: this.params,
        }).then(response => response.data);
    }


}