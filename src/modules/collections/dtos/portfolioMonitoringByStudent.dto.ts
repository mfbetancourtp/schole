import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface StudentDto {
    id: number;
    institutionId: number;
    userId: number;
    lmsUserKey?: any;
    identification: string;
    identificationTypeId: number;
    identificationMunicipalityId: number;
    firstName: string;
    secondName: string;
    firstLastname: string;
    secondLastname: string;
    names: string;
    lastnames: string;
    mobile: string;
    homePhone: string;
    workPhone?: any;
    email: string;
    homeMunicipalityId: number;
    direction: string;
    birthDate: string;
    birthMunicipalityId: number;
    nationality: string;
    genderId: number;
    religion?: any;
    primaryLanguage?: any;
    createdAt: string;
    updatedAt: string;
}

export interface ConvocationEnrolDocumentDto {
    id: number;
    institutionId: number;
    code: string;
    documentId: number;
    convocationEnrolId: number;
    convocationEnrolStepId: number;
    urlDocument: string;
    isAccept?: number;
    urlSignedDocument: string;
    urlDocumentWithSigners: string;
    documentKey: string;
    processKey: string;
    createdAt: string;
    updatedAt: string;
    titleDocument: string;
}

export interface ConvocationEnrolAttachmentDto {
    id: number;
    institutionId: number;
    convocationEnrolId: number;
    convocationEnrolStepId: number;
    requirementId: number;
    urlAttachment: string;
    isAccept: number;
    createdAt: string;
    updatedAt: string;
    titleRequirement: string;
}

export interface PortfolioMonitoringByStudentDto {
    student: StudentDto;
    convocationEnrolDocuments: ConvocationEnrolDocumentDto[];
    convocationEnrolAttachments: ConvocationEnrolAttachmentDto[];
}