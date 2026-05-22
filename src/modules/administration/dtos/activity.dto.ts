import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface ActivityDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  activityCategoryId: number;
  topicId?: any;
  periodId: number;
  name: string;
  description: string;
  attachmentUrl?: any;
  dateSince: string;
  dateUntil: string;
  rowOrder: number;
  deliveryMaxNumberFiles: number;
  deliveryFormatFiles?: any;
  isPublish?: any;
  lmsActivityId?: any;
  delivery: any;
  courseName: string;
  status: string;
  dayName: string;
}

export interface ActivityDetailDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  activityCategoryId: number;
  topicId: number;
  periodId: number;
  name: string;
  description: string;
  attachmentUrl: string;
  dateSince: string;
  dateUntil: string;
  rowOrder: any;
  deliveryMaxNumberFiles: number;
  deliveryFormatFiles: any;
  lmsActivityId: any;
  planningWeekId: number;
  isPublish: number;
  topicIds: number[];
  learningOutcomesIds: number[];
}
