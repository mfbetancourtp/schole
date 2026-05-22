import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface UploadPhotoResponseDto {
  photoUrl: string;
  url?: string;
}

export class UploadScholarshipSettingPhotoService {
  run(imagen: File, id?: number): Promise<UploadPhotoResponseDto> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    if (id !== undefined && id !== null) {
      formData.append('id', String(id));
    }
    return axios.post<UploadPhotoResponseDto>(`${services.structure}/scholarship-settings/photo`, formData).then((r) => r.data);
  }
}
