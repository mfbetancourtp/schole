import { TimestampDto } from "../../../shared/dto/timestamp.dto";

export interface MedicalInformationDto extends TimestampDto {
    createdAt?: any;
    updatedAt?: any;
    id?: any | undefined;
    institutionId?: any;
    studentId?: any;
    rh?: any;
    doctorName?: any;
    doctorPhone?: any;
    doctorAddress?: any;
    hospitalName?: any;
    hospitalPhone?: any;
    hospitalAddress?: any;
    knowSwim?: any;
    haveDiabetes?: any;
    allergies?: any;
    medicalConditions?: any;
    surgicalOperations?: any;
    medicines?: any;
    additionalNotes?: any;
}