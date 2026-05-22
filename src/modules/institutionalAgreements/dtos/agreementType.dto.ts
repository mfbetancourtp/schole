// ============ Field Configuration ============

import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface FieldItemDto {
  id: number;
  sectionInstanceId?: number;
  name: string;
  visible: number | boolean;
  required: number | boolean;
}

export interface SectionDto {
  id: number;
  sectionInstanceId?: number;
  name: string;
  fields: FieldItemDto[];
  totalVisible: number;
  totalFields: number;
}

// ============ Attachments ============

export interface AttachmentDto {
  id: number;
  name: string;
  description: string;
  required: number | boolean;
  isActive: number | boolean;
}

// ============ Agreement Type ============

export interface AgreementTypeDto extends TimestampDto {
  id: number | string;
  code: string;
  name: string;
  description: string;
  isActive: number | boolean | string;
  activeSections: number;
  agreements?: number;
  sections: SectionDto[];
  attachments: AttachmentDto[];
}
