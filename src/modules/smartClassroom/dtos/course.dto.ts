export interface Course {
  _id: string;
  code?: string;
  name: string;
  description?: string;
  credits?: number;
  department?: string;
  semester?: number;
}
