export interface ResponsePaginationDto<Data> {
    data: Data[];
    page: number;
    perPage: number;
    total: number;
}