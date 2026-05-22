import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface ColumnDto {
    id?: number;
    entityId: number;
    exportTableEntityColumnId: number;
    defaultHeader: string;
    showColumn: boolean;
    renameHeader: string;
    order: number;
}

export interface TemplatesEnabledDto extends TimestampDto{
    id: number;
    processKey: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt?: any;
    columns: ColumnDto[];
}