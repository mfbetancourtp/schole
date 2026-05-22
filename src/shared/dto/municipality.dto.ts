import {RegionDto} from './region.dto';

export interface MunicipalityDto {
    id: number;
    regionId: number;
    code?: any;
    name: string;
    region: RegionDto;
}