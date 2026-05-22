export interface AgreementTypeSectionDto {
  sectionsId?: number | string;
  name: string;
  visible: number | boolean;
  required: number | boolean;
  agreementsTypesId: number | string;
  displayComponentTypeId?: number;
}

export interface CreateAgreementTypeSectionDto {
  sectionsId?: number | string;
  name: string;
  visible?: number | boolean;
  required?: number | boolean;
  agreementsTypesId?: number | string;
  displayComponentTypeId?: number;
}
