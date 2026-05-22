interface Institution {
    identification: string;
    name: string;
    active: number;
    phone: string;
    email: string;
    municipalityId: number;
    secretKey: string;
    publicKey: string;
    lmsUrlApiRest: string;
    isClient: number;
}

interface User {
    id: number;
    userToken: string;
    password: string;
}

export interface InstitutionDto {
    institution: Institution;
    user: User;
}