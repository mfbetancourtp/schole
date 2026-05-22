import { ActivityCategoryDto } from './activityCategory.dto';
import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface TeacherActivityDto extends TimestampDto {
  id: number;
  institutionId: number;
  courseId: number;
  activityCategoryId: any;
  topicId: number;
  periodId: number;
  name: string;
  description: string;
  attachmentUrl: string;
  dateSince: string;
  dateUntil: string;
  rowOrder: any;
  isPublish: number;
  periodName: string;
  planningWeekId?: number;
  lmsActivityId: any;
  deliveryMaxNumberFiles: any;
  deliveryFormatFiles: any;
  activityCategory: ActivityCategoryDto;
  qualityDeliveries: number;
  notQualityDeliveries: number;
  notDeliveries: number;
}
