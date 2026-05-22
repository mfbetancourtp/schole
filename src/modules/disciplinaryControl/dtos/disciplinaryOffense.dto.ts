//import { AnyTxtRecord } from 'dns';
import { TimestampDto } from '../../../shared/dto/timestamp.dto';
import { StudentDto } from './studentDisciplinaryControl.dto';

export interface DisciplinaryOffenseDto extends TimestampDto {
  id: number;
  institutionId: number;
  userId: number;
  userAdviserId: number;
  courseId?: any;
  course?: any;
  playTimeId?: any;
  playTime?: any;
  dateTimeOffense: string;
  offenseTemplateId: number;
  levelOffenseId: number;
  description: string;
  isSentParents: number;
  createdAt: string;
  updatedAt?: any;
  student: StudentDto;
  scenery: any;
}

// disciplinaryOffenseId: number
//   academicPeriodId: number
//   userAdviserId: number
//   avatar: string
//   adviser: string
//   isSentParents: number
//   dateTimeOffense: string
//   levelOffenseId: number
//   levelOffenseName: string
//   levelOffenseColor?: string
//   offenseTemplateId: number
//   offenseTemplateCode: string
//   offenseTemplateName: string
//   description: string
//   courseId?: number
//   courseCode: any
//   courseName?: string
//   playTimeId: any
//   playTimeName: any
//   playTimeTimeSince: any
//   playTimeTimeUntil: any
//   scenery?: string
