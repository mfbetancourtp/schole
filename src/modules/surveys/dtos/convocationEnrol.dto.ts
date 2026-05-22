export interface StatusStepDto {
  convocationStepName: string;
  convocationStepId: number;
  convocationEnrolId: number;
  status: string;
}

export interface convocationEnrolDto {
  convocationEnrolId: number;
  identification: string;
  nameEnrol: string;
  nameDegree: string;
  isPrevius: any;
  stateMatriculate: any;
  statusSteps: StatusStepDto[];
}
