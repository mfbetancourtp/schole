import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface DetailDto extends TimestampDto {
    id: number;
    institutionId: number;
    title: string;
    description?: any;
    urlTemplate?: any;
    enrolAttachment?: any;
}

export interface StepTypeAdjuntoDto extends TimestampDto {
    id: number;
    institutionId: number;
    title: string;
    convocationId: number;
    convocationStepTypeId: number;
    surveyId?: any;
    order: number;
    allowQuotes?: any;
    maxQuotes: number;
    minInitialQuoteValue: number;
    requiresApproval: number;
    detail: DetailDto[];
}