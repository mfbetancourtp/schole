import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { AttachmentValidationPaginationDto, AttachmentValidationRecordDto, AttachmentValidationResponseDto, AttachmentValidationStatus } from '../dtos/attachmentValidation.dto';

export interface GetAttachmentValidationWithPaginationParams {
  sort?: string;
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  page?: number;
  perPage?: number;
  search?: string;
  status?: AttachmentValidationStatus;
}

export interface GetAttachmentValidationWithPaginationResult {
  data: AttachmentValidationRecordDto[];
  total: number;
  page: number;
  pagination: AttachmentValidationPaginationDto;
}

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const mapOverallStatus = (status: string): AttachmentValidationStatus => {
  const normalizedStatus = normalizeText(status);

  if (normalizedStatus.includes('aprob')) {
    return 'approved';
  }

  if (normalizedStatus.includes('rechaz')) {
    return 'rejected';
  }

  return 'pending';
};

const buildFullName = (names: string, lastnames: string) => [names, lastnames].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

export class GetAttachmentValidationWithPaginationService {
  async run(params?: GetAttachmentValidationWithPaginationParams): Promise<GetAttachmentValidationWithPaginationResult> {
    const response = await axios.get<AttachmentValidationResponseDto>(`${services.structure}/cv-validation`, {
      params: {
        ...params,
        order: params?.order ? params.order.toUpperCase() : undefined,
      },
    });

    return {
      data: response.data.data.map((item) => {
        const fullName = buildFullName(item.names, item.lastnames);
        const status = mapOverallStatus(item.overallStatus);

        return {
          id: String(item.peopleId),
          peopleId: item.peopleId,
          fullName,
          teacherName: fullName,
          teacherPosition: `ID docente: ${item.peopleId}`,
          totalDocuments: item.totalDocuments,
          documentsCount: item.totalDocuments,
          lastUpdate: item.lastUpdate,
          createdDate: item.lastUpdate,
          overallStatus: item.overallStatus,
          status,
          recordTitle: 'Validación general de hoja de vida',
        };
      }),
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      pagination: response.data.pagination,
    };
  }
}
