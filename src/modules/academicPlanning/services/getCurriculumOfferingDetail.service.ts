import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface EvaluationBreakDto {
  id: number;
  name: string;
  percentage: number;
  startDate: string | null;
  endDate: string | null;
  gradeLoadStartDate: string | null;
  gradeLoadEndDate: string | null;
  order: number;
}

export interface CurriculumOfferingDetailDto {
  id: number;
  academicPeriodId: number;
  campusId: number;
  campusName: string;
  programId: number;
  programName: string;
  programCurriculumId: number;
  programTypeName?: string;
  facultieName?: string;
  departmentName?: string;
  directorProgramName?: string;
  minCapacity: number;
  maxCapacity: number;
  periodValue: number;
  totalCuts: number;
  operationalShemeId?: number;
  evaluationBreaks: EvaluationBreakDto[];
}

export class GetCurriculumOfferingDetailService {
  async run(id: number): Promise<CurriculumOfferingDetailDto> {
    const response = await axios.get(`${services.academic}/planning/curriculum-offerings/${id}`);
    const data = response.data?.data || response.data;

    // Map backend fields to frontend structure
    // Ordenar los cortes consistentemente por ID para mantener el orden
    const sortedBreaks = (data.curriculumOfferingBreaks || []).sort((a: any, b: any) => a.id - b.id);

    return {
      id: data.id,
      academicPeriodId: data.academicPeriodId,
      campusId: data.campusId,
      campusName: data.campus?.name || 'Sin sede',
      programId: data.programId,
      programName: data.programName || '',
      programCurriculumId: data.programCurriculumId || 0,
      programTypeName: data.programTypeName,
      facultieName: data.facultieName,
      departmentName: data.departmentName,
      directorProgramName: data.directorProgramName,
      minCapacity: data.minCapacity || 0,
      maxCapacity: data.maxCapacity || 0,
      periodValue: data.periodValue || 0,
      totalCuts: data.curriculumOfferingBreaks?.length || 0,
      operationalShemeId: data.operationalShemeId,
      evaluationBreaks: sortedBreaks.map((breakItem: any, index: number) => ({
        id: breakItem.id,
        name: breakItem.name,
        percentage: breakItem.percent || 0,
        startDate: breakItem.startDate,
        endDate: breakItem.endDate,
        gradeLoadStartDate: breakItem.uploadStartDate,
        gradeLoadEndDate: breakItem.uploadEndDate,
        order: breakItem.order || index + 1,
      })),
    };
  }
}
