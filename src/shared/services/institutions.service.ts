import { InstitutionDto } from '../dto/institution.dto';
import InstitutionsStore from '../stores/institutions.store';

export class InstitutionsService {
  private institutionsKey = 'institutions';
  private selectedInstitutionKey = 'institutionId';

  getInstitutions(): InstitutionDto[] | [] {
    const institutions = localStorage.getItem(this.institutionsKey);

    if (institutions) {
      return JSON.parse(institutions);
    }

    return [];
  }

  setInstitutions(institutions: InstitutionDto[]) {
    localStorage.setItem(this.institutionsKey, JSON.stringify(institutions));
    this.setInstitutionsOnStore();
  }

  private setInstitutionsOnStore() {
    const institutions = this.getInstitutions();

    if (institutions) {
      InstitutionsStore.methods.setInstitutions(institutions);
    }
  }

  getSelectedInstitution(): InstitutionDto | null {
    const institutionId = localStorage.getItem(this.selectedInstitutionKey) ?? '';
    const institutions = this.getInstitutions();

    let institution = null;

    institutions.forEach((inst) => {
      if (parseInt(institutionId) === inst.id) {
        institution = inst;
      }
    });

    return institution;
  }

  setSelectedInstitutions(institution: InstitutionDto) {
    localStorage.setItem(this.selectedInstitutionKey, institution.id.toString());
    this.setSelectedInstitutionOnStore();
  }

  private setSelectedInstitutionOnStore() {
    const institution = this.getSelectedInstitution();

    if (institution) {
      InstitutionsStore.methods.setSelectedInstitution(institution);
    }
  }

  setDefaultSelectedInstitution() {
    const institution = this.getSelectedInstitution();

    if (institution) {
      return;
    }

    const institutions = this.getInstitutions();

    this.setSelectedInstitutions(institutions[0]);
  }
}