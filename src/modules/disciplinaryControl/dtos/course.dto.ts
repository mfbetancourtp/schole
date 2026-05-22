import { RecentActivityDto } from './recentActivity.dto';

export interface CourseDto {
  id: number;
  institutionId: number;
  ownerUserId: number;
  subjectAssignmentId: number;
  code: string;
  name: string;
  description: string;
  degreeId: number;
  createdAt?: any;
  updatedAt?: any;
  recentActivities: RecentActivityDto[];
  type?: string;
}
