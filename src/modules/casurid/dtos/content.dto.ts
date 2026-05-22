export interface ContentDto {
    id: number;
    levelId: number;
    degreeId: number;
    subjectId: number;
    title: string;
    description: string;
    index?: any;
    contentTypeId: number;
    urlLocation: string;
    duration: number;
    createdAt?: any;
    updatedAt?: any;
    checked: boolean;
}