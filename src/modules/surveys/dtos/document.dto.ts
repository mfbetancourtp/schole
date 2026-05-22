import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface AdditionalFieldDto {
    name: string;
    label: string;
    required: boolean;
}

export interface SignerDto {
    id: number;
    additionalFields: AdditionalFieldDto[];
    code: string;
}

export interface FieldDto {
    sectionId: number;
    keyField: string;
    keyField2: string;
    label: string;
}

export interface FormDto {
    id: number;
    sectionForm: string;
    predefinedFormId?: any;
    isMatriz: number;
    fields: FieldDto[];
}

export interface KeyDto {
    keyField: string;
    label: string;
}
export interface ConceptDto {
    name: string;
    type: string;
    keyName: KeyDto;
    keyNumberValue: KeyDto;
    keyLettersValue: KeyDto;
}

export interface FormulaDto extends TimestampDto {
    id: number;
    documentId: number;
    name: string;
    formula: string;
    keyField: string;
    keyNumberValue: KeyDto;
    keyLettersValue: KeyDto;
}

export interface AllFieldDto {
    title: string;
    fields: KeyDto[];
}

export interface DocumentDto extends TimestampDto {
    id: number;
    institutionId: number;
    title: string;
    description: string;
    documentBody: string;
    active: number;
    prefix?: any;
    numberStar: number;
    numberEnd: number;
    sizeConsecutive: number;
    lastNumber: number;
    urlTemplate: string;
    signers: SignerDto[];
    forms: FormDto[];
    concepts: ConceptDto[];
    defualtFields: KeyDto[];
    formulas: FormulaDto[];
    allFields: AllFieldDto[];
}
