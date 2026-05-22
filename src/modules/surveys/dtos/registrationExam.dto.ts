export interface RegistrationExamApiOptionDto {
  id: number;
  descripcion: string;
  valor: string;
  puntaje: number;
  noAplicaPuntaje: number;
  orden: number | null;
}

export interface RegistrationExamApiQuestionDto {
  id: number;
  pregunta: string;
  codigo: string;
  orden: number | null;
  puntaje: number;
  obligatoria: number;
  tipoRespuestaId: number;
  preguntaPadreId: number | null;
  observacion: string | null;
  editable: number;
  soloLectura: number;
  minLongitud: number | null;
  maxLongitud: number | null;
  minFotos: number | null;
  maxFotos: number | null;
  idOpcionRespuestaDependiente: number[] | number | null;
  opcionesRespuesta: RegistrationExamApiOptionDto[];
  idsOpcionRespuestaObligatoria: number[];
  preguntasHijas: RegistrationExamApiQuestionDto[] | null;
  preguntasDependientes: RegistrationExamApiQuestionDto[];
}

export interface RegistrationExamApiCategoryDto {
  id: number;
  descripcion: string;
  orden: number | null;
  categoriaPreguntaId: number;
  observacion: string;
  preguntas: RegistrationExamApiQuestionDto[];
}

export interface RegistrationExamDto {
  id: number;
  titulo: string;
  facultadId: number;
  activo: number;
  calculaPeso: number;
  tipoCalculoPeso: string;
  version: string;
  duracion?: string | null;
  categorias: RegistrationExamApiCategoryDto[];
}
