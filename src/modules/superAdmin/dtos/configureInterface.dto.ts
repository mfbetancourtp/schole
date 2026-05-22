export interface InterfacesDto {
    id: number,
    moduleId: number,
    title: string,
    description: string,
    urlImageBase: string,
    numberLabels: number,
    translations: TranslationsDto[],
}
export interface TranslationsDto {
    languageName: string,
    number: number,
}
