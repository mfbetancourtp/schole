import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface SurchargeDto extends TimestampDto{
    id: number;
    institutionId: number;
    defaultCode?: any;
    title: string;
    description: string;
    name: string;
    value: number;
    isPercent: number;
    linkedProductId?: any;
}