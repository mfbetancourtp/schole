import {TimestampDto} from '../../../shared/dto/timestamp.dto';
import { UserDto } from './user.dto';

export interface SupervisorDto extends TimestampDto {
    id: number;
    academicPeriodGroupId: number;
    supervisorUserId: number;
    typeSupervisor?: any;
    user?: UserDto;
}