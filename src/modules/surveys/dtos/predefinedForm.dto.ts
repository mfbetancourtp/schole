import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface PredefinedFormDto extends TimestampDto {
    id: number;
    process: string;
    previousProcedure?: any;
    saveProcedure?: any;
    getProcedure?: any;
    signerTags?: any;
    checked?: boolean;
}