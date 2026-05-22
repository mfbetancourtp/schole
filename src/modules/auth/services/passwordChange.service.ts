import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IPasswordChangeService {
  token: string;
  oldPassword?: string;
  password: string;
  passwordConfirmation: string;
  userAgent?: string;
  deviceType?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
}

export class PasswordChangeProfileService {
  async run(data: IPasswordChangeService) {
    const deviceInfo = this.getDeviceInfo();

    const requestData = {
      ...data,
      ...deviceInfo,
    };

    await axios.post(`${services.users}/access/change-password`, requestData);
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }

    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }

    return 'desktop';
  }
}
