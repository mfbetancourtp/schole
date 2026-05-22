
export interface Subject {
    createdAt?: any;
    updatedAt?: any;
    id: number;
    institutionId: number;
    thumbnail?: any;
    areaId: number;
    name: string;
    lmsTemplateCode?: any;
    abbreviation?: any;
}

export interface Content {
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
    productId: number;
}

export interface ContentPlan {
    id: number;
    institutionId: number;
    slug: string;
    thumbnail: string;
    title: string;
    levelId: number;
    degreeId: number;
    subjectId: number;
    description?: any;
    index: string;
    productTypeId: number;
    defaultUnitValue: number;
    validityPeriod: number;
    createdAt?: any;
    updatedAt: string;
    subject: Subject;
    contents: Content[];
}