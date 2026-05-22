import { PeriodDto } from "../../../shared/dto/period.dto";
import { SubjectDto } from "../../../shared/dto/subject.dto";

export interface MatriculateSubjectDto {
    id: number;
    institutionId: number;
    matriculateId: number;
    curriculumSubjectId: number;
    finalQuality?: any;
    finalRetrieval?: any;
    isApproved: number;
    createdAt: string;
    updatedAt?: any;
    academicPeriodId: number;
    subject: SubjectDto;
    periods: PeriodDto[];
}
