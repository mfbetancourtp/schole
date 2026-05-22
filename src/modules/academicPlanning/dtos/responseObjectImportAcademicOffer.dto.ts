export interface ResultValidateJourneyer {
    countJourneysCreated: number;
}

export interface ResultValidateLevels {
    countLevelsCreated: number;
}

export interface Degree {
    codigo: string;
    descripcion: string;
    codigo_nivel: string;
}

export interface NorExistLevel {
    level: string;
    degree: Degree;
}

export interface ResultValidateDegrees {
    norExistLevels: NorExistLevel[];
    countDegreesCreated: number;
}

export interface ResultValidateGroups {
    newRecordGroup: number;
}

export interface Error {
    codeJourney: string;
    codeDegree: string;
    codeGroup: string;
    observations: string[];
}

export interface ResultValidateCourses {
    errors: Error[];
    countCoursesCreated: number;
}

export interface ResObjtImportAcademicOfferDto {
    resultValidateJourneyer: ResultValidateJourneyer;
    resultValidateLevels: ResultValidateLevels;
    resultValidateDegrees: ResultValidateDegrees;
    resultValidateGroups: ResultValidateGroups;
    resultValidateCourses: ResultValidateCourses;
}