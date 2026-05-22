import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface NotificationDto extends TimestampDto {
    id: number;
    institutionId: number;
    collectionStepId: number;
    title: string;
    message: string;
    numberDay: number;
    channel: string;
    configReceiver: string;
    chanelName: string;
    configReceiverName: string;
}

export interface CollectionStepDto extends TimestampDto {
    id: number;
    institutionId: number;
    name: string;
    startNumberDay: number;
    endNumberDay: number;
    lockCompletion: string;
    active: number;
    surchargeIds: any[];
    notifications: NotificationDto[];
}