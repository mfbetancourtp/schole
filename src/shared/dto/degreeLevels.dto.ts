import { TimestampDto } from "./timestamp.dto";

export interface DegreeLevelsDto extends TimestampDto {
    id: number;
    institutionId: number;
    thumbnail?: any;
    levelId: number;
    name: string;
    abbreviation: string;
    maxCredits: string;
    minCredits: string;
    createdAt: string;
    updatedAt: string;
}
