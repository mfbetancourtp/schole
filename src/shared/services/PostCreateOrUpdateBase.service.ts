import axios from '../utils/axios';
import { JsonToFormDataService } from './jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class PostBaseService<IPostContentService> {
  url = '';
  isFormData = false;
  params = {};

  async run(data: IPostContentService): Promise<any> {
    let newData: any = data;

    if (this.isFormData) {
      newData = jsonToFormDataService.run(data);
    }

    return await this.create(newData);
  }

  private async create(data: any): Promise<any> {
    return axios
      .post(this.url, data, {
        params: this.params,
      })
      .then((response) => response.data);
  }
}
