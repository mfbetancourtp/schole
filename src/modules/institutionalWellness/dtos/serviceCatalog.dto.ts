export type ServiceAvailability = 'today' | 'tomorrow' | 'open';

export interface WellnessService {
  id: number;
  icon: string;
  name: string;
  description: string;
  availability: ServiceAvailability;
  availabilityLabel: string;
  requirements: string[];
}

export interface ServiceRequestForm {
  date: string;
  time: string;
  reason: string;
}
