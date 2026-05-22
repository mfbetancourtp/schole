import { TimestampDto } from "../../../shared/dto/timestamp.dto";

export interface IdentificationTypeDto extends TimestampDto {
    id: number;
    institutionId: number;
    name: string;
    abbreviation: string;
}
