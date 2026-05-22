import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface OwnerPeopleSummaryDto extends TimestampDto {
  peopleId: number;
  userId: number;
  fullName: string;
  email: string;
}
export interface OwnerPeopleDto extends TimestampDto {
  id: number;
  institutionId: number;
  userId: number;
  lmsUserKey: string;
  identification: string;
  identificationTypeId: number;
  firstName: string;
  secondName: string;
  names: string;
  firstLastname: string;
  secondLastname: string;
  lastnames: string;
  mobile: string;
  homePhone: string;
  workPhone: string;
  email: string;
  homeMunicipalityId: number;
  direction: string;
  birthDate: string;
  birthMunicipalityId: number;
  nationality: string;
  genderId: number;
  religion: string;
  primaryLanguage: string;
}

export interface AttachmentDto extends TimestampDto {
  id: number;
  institutionId: number;
  messageId: number;
  name: string;
  urlAttachmentFile: string;
  weightKB?: any;
}

export interface MessageDto extends TimestampDto {
  id: number;
  institutionId: number;
  parentMessageId: number;
  title: string;
  body: string;
  ownerUserId: number;
  roleId: number;
  isDraft: number;
  sendDatetime: string;
  attachments: AttachmentDto[];
}

export interface MessageQueueDto extends MessageDto {
  ownerPeople: OwnerPeopleDto;
  nameStudent: string;
  nameDegree: string;
}

export interface MessageReceiverDto {
  receiverName: string;
  nameDegree: string | null;
  nameStudent: string | null;
  roles: string;
  openAt: string;
}

// getOfficialsReceivers.service

export interface UserDto {
  peopleId: number;
  userId: number;
  fullName: string;
  email: string;
  roleId: number;
}

export interface OfficialsReceiverDto {
  id: number;
  name: string;
  users: UserDto[];
}
