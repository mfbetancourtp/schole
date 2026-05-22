import axios from '../utils/axios';

export class PostVirtualAssistantService {
  async run(text: string) {
    const response = await axios.post('https://whatsapp-test.kamilainnovation.co/model-response-ai', { query: text });
    return response.data;
  }
}
