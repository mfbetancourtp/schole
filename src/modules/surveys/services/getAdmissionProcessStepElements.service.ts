import type { AdmissionElementOption, AdmissionProcessStepType } from '../dtos/admissionProcess.dto';

import { GetActiveCustomFormsService } from './getActiveCustomForms.service';
import { GetActiveDocumentsService } from './getActiveDocuments.service';
import { GetAttachmentsService } from './getAttachments.service';
import { SearchConceptsService } from './searchConcepts.service';
import { GetChecklistsService } from './checklist/getChecklists.service';

const getActiveCustomFormsService = new GetActiveCustomFormsService();
const getActiveDocumentsService = new GetActiveDocumentsService();
const getAttachmentsService = new GetAttachmentsService();
const searchConceptsService = new SearchConceptsService();
const getChecklistsService = new GetChecklistsService();

export class GetAdmissionProcessStepElementsService {
  async run(stepType: AdmissionProcessStepType, search = ''): Promise<AdmissionElementOption[]> {
    switch (stepType) {
      case 'formulario': {
        const forms = await getActiveCustomFormsService.run();
        return forms.map((form) => ({
          id: String(form.id),
          name: form.title,
        }));
      }

      case 'documento': {
        const documents = await getActiveDocumentsService.run();
        return documents.map((document) => ({
          id: String(document.id),
          name: document.title,
        }));
      }

      case 'adjunto': {
        const attachments = await getAttachmentsService.run();
        return attachments.map((attachment, index) => ({
          id: String(attachment.id ?? `attachment-${index}`),
          name: attachment.title,
        }));
      }

      case 'cobro': {
        if (search.trim().length < 2) return [];

        const response = await searchConceptsService.run({
          search,
          perPage: 20,
        });

        const products = Array.isArray(response?.data) ? response.data : [];
        return products.map((product: any) => ({
          id: String(product.id),
          name: product.title ?? product.name ?? product.code ?? 'Concepto',
        }));
      }

      case 'examen de evaluación': {
        const checklists = await getChecklistsService.run();
        return checklists.map((checklist) => ({
          id: String(checklist.id),
          name: checklist.titulo,
        }));
      }

      default:
        return [];
    }
  }
}
