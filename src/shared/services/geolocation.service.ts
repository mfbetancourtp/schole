import axios from '../utils/axios';

export interface LocationInfo {
  city?: string;
  country?: string;
  ip?: string;
}

export class GeolocationService {
  async getPublicIP(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (err) {
      console.error('Error obteniendo IP:', err);
      return 'No disponible';
    }
  }

  async getLocationInfo(lat: number, lon: number): Promise<LocationInfo> {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = response.data;

      return {
        city: data.address?.city,
        country: data.address?.country,
      };
    } catch (err) {
      console.error('Error obteniendo información de ubicación:', err);
      return {};
    }
  }

  async getCityAndCountry(lat: number, lon: number): Promise<LocationInfo> {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = response.data;

      return {
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country,
      };
    } catch (err) {
      console.error('Error obteniendo ciudad y país:', err);
      return {};
    }
  }
}
