import { UserInstitutionDto } from './userInstitution.dto';
import { UserRoleDto } from './userRole.dto';
import { ItemDto } from './item.dto';
import { UserDto } from './user.dto';
import { LanguageDto } from './language.dto';
import { PeopleDto } from './people.dto';

export interface PendingEvaluationsDto {
  required: number;
  optional: number;
  total: number;
}

export interface InitDataDto {
  userInstitutions: UserInstitutionDto[];
  userRoles: UserRoleDto[];
  items: ItemDto[];
  user: UserDto;
  languages: LanguageDto[];
  people: PeopleDto;
  matriculates: any;
  pendingEvaluations?: PendingEvaluationsDto;
}
