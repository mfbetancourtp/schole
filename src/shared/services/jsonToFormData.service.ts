export class JsonToFormDataService {
  run(data: any): FormData {
    const formData = new FormData();
    const keysFormData = Object.keys(data);

    keysFormData.forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key].forEach((d: any, index: number) => {
          formData.append(`${key}[${index}]`, d);
        });
      } else if (data[key] === null || data[key] === 'null') {
        // Enviar la cadena "null" para representar un valor nulo.
        formData.append(key, 'null');
      } else {
        formData.append(key, data[key]);
      }
    });

    return formData;
  }
}
