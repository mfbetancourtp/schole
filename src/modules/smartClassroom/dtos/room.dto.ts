export interface Room {
  _id: string;
  name: string;
  code?: string;
  building?: string;
  floor?: number;
  capacity?: number;
  type?: string;
  equipment?: string[];
}
