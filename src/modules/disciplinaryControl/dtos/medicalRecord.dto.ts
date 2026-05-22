export interface ParamsFormMedicalRecordDto {
  userId: number;
  annotations: string;
  consultationDate: string | null;
  wellnessAreaId: number | null;
}
