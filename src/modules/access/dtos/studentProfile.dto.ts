import { TimestampDto } from "../../../shared/dto/timestamp.dto";
import { MedicalInformationDto } from "./medicalInformation.dto";

export interface StudentDto extends TimestampDto {
    id: number;
    institutionId: number;
    peopleId: number;
    code: string;
    codeMEN: string;
    medicalInformation: MedicalInformationDto;
}