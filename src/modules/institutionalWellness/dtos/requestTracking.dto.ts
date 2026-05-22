export type RequestStatus = 'pending' | 'completed' | 'cancelled';

export interface StudentInfo {
  name: string;
  initials: string;
  code: string;
  email: string;
  program: string;
}

export interface RequestTrackingRow {
  id: number;
  student: StudentInfo;
  service: string;
  date: string;
  time: string;
  status: RequestStatus;
  statusLabel: string;
  requestDate: string;
  reason: string;
  requirements: string[];
  sessionNotes: string;
}
