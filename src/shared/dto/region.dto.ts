import {CountryDto} from './country.dto';

export interface RegionDto {
    id: number;
    countryId: number;
    code?: any;
    name: string;
    country: CountryDto;
}