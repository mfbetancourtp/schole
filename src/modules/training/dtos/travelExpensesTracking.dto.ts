export interface TravelExpensesTrackingDto {
  id: number;
  planningWeekId: number;
  courseInscriptionId: number;
  departureDate: string;
  originMunicipalityId: number;
  destinationMunicipalityId: number;
  returnDate: string;
  departureValue: number;
  returnValue: number;
  isApproved: number;
  transportType: string;
  hotelUnitValue: number;
  numberDays: number;
  employeeContribution: number;
  companyContribution: number;
  finalCompanyContribution: number;
  urlConsolidateEvidence: string;
  updatedAt: string;
  userId: number;
  employee: string;
  nameOriginMunicipality: string;
}
