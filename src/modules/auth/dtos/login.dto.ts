import { UserDto } from '../../../shared/dto/user.dto';

export interface ParamsFormLoginDto {
  username: string;
  password: string;

  userAgent?: string;
  deviceType?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
}

export interface LoginDto {
  message: string;
  token: string;
  sessionId: string;
  user: UserDto;
}
