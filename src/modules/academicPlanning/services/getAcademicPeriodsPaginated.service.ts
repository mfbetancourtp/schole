import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface AcademicPeriodsPaginatedParams {
  order?: 'ASC' | 'DESC';
  page?: number;
  noPag?: string;
  perPage?: number;
  search?: string;
  institutionId?: number;
  active?: number;
  programTypeId?: number;
}

export interface ProgramTypeDto {
  id: number;
  name: string;
  code?: string;
}

export interface ProgramDto {
  id: number;
  name: string;
  code?: string;
}

export interface AcademicPeriodItemDto {
  id: number;
  code: string;
  name: string;
  programTypeId: number;
  programType?: ProgramTypeDto;
  active: number;
  startDate: string;
  endDate: string;
  programIds?: number[];
  programs?: ProgramDto[];
  programsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicPeriodsPaginatedResponse {
  data: AcademicPeriodItemDto[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export class GetAcademicPeriodsPaginatedService {
  async run(params: AcademicPeriodsPaginatedParams = {}): Promise<AcademicPeriodsPaginatedResponse> {
    return axios.get(`${services.academic}/planning/academic-periods`, { params }).then((response) => response.data);
  }
}
