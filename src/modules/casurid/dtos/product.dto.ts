export interface ProductDto {
    id: number;
    institutionId: number;
    slug: string;
    thumbnail?: any;
    title: string;
    levelId: number;
    degreeId: number;
    subjectId: number;
    description?: any;
    index?: any;
    productTypeId: number;
    defaultUnitValue: number;
    validityPeriod: number;
    createdAt: string;
    updatedAt: string;
    subjectName: string;
}