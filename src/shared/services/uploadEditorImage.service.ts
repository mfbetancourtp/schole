import axios from '../utils/axios';

export class UploadEditorImageService {
  /**
   * Sube una imagen al endpoint indicado y devuelve el formato que CKEditor espera: { default: url }
   * @param file  Archivo a subir
   * @param uploadUrl  URL completa del endpoint (ej: `${services.structure}/document-templates/upload-image`)
   */
  run(file: File, uploadUrl: string): Promise<{ default: string }> {
    const formData = new FormData();
    formData.append('upload', file);
    return axios
      .post<{ url: string }>(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => ({ default: r.data.url }));
  }
}
