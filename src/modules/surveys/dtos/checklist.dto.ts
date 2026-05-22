export interface ChecklistDto {
  id: number;
  titulo: string;
  version: string;
  calculaPeso: number;
  tipoCalculoPeso: string;
  activo: number;
  categoriaChecklistId: number;
  categoriaChecklistNombre?: string;
}

export interface ChecklistCategoryDto {
  id: number;
  checklistId: number;
  categoriaPreguntaId?: number;
  descripcion: string;
  activo: number;
  preguntas?: ChecklistQuestionDto[];
}

export interface ChecklistQuestionDto {
  id: number;
  categoriaPreguntaId: number;
  tipoRespuestaId: number;
  tipoRespuestaNombre?: string;
  codigo: string;
  orden: number;
  puntaje: number;
  obligatoria: number;
  pregunta: string;
  editable: number;
  soloLectura: number;
  activo: number;
  opciones?: ChecklistAnswerOptionDto[];
  /**
   * Opciones devueltas por el endpoint `/forms/checklist/:id/tree`. Mismo
   * contenido que `opciones`, pero con el nombre real del backend.
   */
  opcionesRespuesta?: ChecklistAnswerOptionDto[];
  /**
   * IDs de opciones del PADRE que disparan la visibilidad de esta pregunta
   * (solo presente en las preguntas hijas dependientes devueltas por el tree).
   */
  idOpcionRespuestaDependiente?: number[] | null;
  /**
   * En el tree endpoint este campo contiene las preguntas HIJAS que dependen
   * de alguna opción de esta pregunta (estructura anidada). No confundir con
   * el DTO `ChecklistDependentQuestionDto` que se usa en el CRUD plano.
   */
  preguntasDependientes?: ChecklistQuestionDto[];
}

export interface ChecklistAnswerOptionDto {
  id: number;
  preguntaId: number;
  descripcion: string;
  valor: string;
  puntaje: number;
  noAplicaPuntaje: number;
  activo: number;
  orden: number;
}

export interface ChecklistDependentQuestionDto {
  id: number;
  preguntaHijaId: number;
  opcionRespuestaId: number;
  preguntaPrincipalId: number;
  activo: number;
  preguntaHijaNombre?: string;
  opcionRespuestaNombre?: string;
}

export interface ChecklistResponseTypeDto {
  id: number;
  descripcion: string;
  activo: number;
}

export interface ChecklistTreeDto extends ChecklistDto {
  categorias: ChecklistCategoryTreeDto[];
}

export interface ChecklistCategoryTreeDto extends ChecklistCategoryDto {
  preguntas: ChecklistQuestionDto[];
}
