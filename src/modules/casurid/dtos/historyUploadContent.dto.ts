import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface JsonResponseDTO {
    levelId: number;
    degreeId: number;
    subjectId?: number;
    level: string;
    degree: string;
    subject: string;
    content: string;
    urlContent: string;
    existIndex: boolean;
    existPreviewImage: boolean;
    status: string;
}

export interface HistoryUploadContentDto extends TimestampDto {
    id: number;
    institutionId: number;
    dateUpload: string;
    status: string;
    jsonResponse: JsonResponseDTO[];
    totalContentsOk: number;
    totalContentsOkUploaded: number;
    pathContents: string;
}
