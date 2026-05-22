import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ParamsDTFutureAbsencesDto extends ParamsPaginationDto {
  matriculateId: number;
  dateSince: string;
  dateUntil: string;
}
export interface ParamsFormFutureAbsencesDto {
  matriculateId: number;
  startAbsence: string;
  endAbsence: string;
  sesionNumbers: number[];
  absenceTypeId: number;
  justificationAbsence: string;
  isJustificationAbsence: number;
}
export interface RelaDataFormFutureAbsencesDto {
  absenceTypes: AbsenceType[];
  sesiones: Sesione[];
}
interface AbsenceType extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
}
interface Sesione {
  name: string;
  value: number;
}

export interface DTFutureAbsencesDto extends TimestampDto {
  id: number;
  matriculateId: number;
  startAbsence: string;
  endAbsence: string;
  sesionNumbers: string;
  absenceTypeId: number;
  justificationAbsence: string;
  isJustificationAbsence: number;
  attachmentAbsenceUrl?: string;
  absenceType: string;
}
