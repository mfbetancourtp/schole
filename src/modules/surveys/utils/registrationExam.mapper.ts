import type { RegistrationExamApiCategoryDto, RegistrationExamApiOptionDto, RegistrationExamApiQuestionDto, RegistrationExamDto } from '../dtos/registrationExam.dto';
import type { ChecklistResponseTypeDto } from '../dtos/checklist.dto';
import type { RegistrationExamOption, RegistrationExamQuestion, RegistrationExamQuestionType } from './registrationExam.utils';

export interface RegistrationExamSection {
  id: number;
  title: string;
  note?: string;
}

export interface RegistrationExamDefinition {
  id: number;
  title: string;
  version?: string;
  sections: RegistrationExamSection[];
  questions: RegistrationExamQuestion[];
  hasScoring: boolean;
  totalMaxScore: number;
}

const sortByOrder = <T extends { orden?: number | null; id: number }>(items: T[] = []) =>
  [...items].sort((left, right) => {
    const leftOrder = typeof left.orden === 'number' ? left.orden : Number.MAX_SAFE_INTEGER;
    const rightOrder = typeof right.orden === 'number' ? right.orden : Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    return left.id - right.id;
  });

const normalizeText = (value?: string | null) =>
  String(value ?? '')
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const DEFAULT_RESPONSE_TYPE_LABELS: Record<number, string> = {
  1: 'Abierta',
  2: 'Fecha',
  3: 'Multiple',
  4: 'Seleccion unica',
  5: 'Checkbox',
  6: 'Canvas',
  7: 'Numerico',
  9: 'Archivo',
};

const mapOption = (option: RegistrationExamApiOptionDto): RegistrationExamOption => ({
  id: String(option.id),
  text: option.descripcion,
  score: !option.noAplicaPuntaje && option.puntaje > 0 ? option.puntaje : undefined,
});

const isBooleanQuestion = (question: RegistrationExamApiQuestionDto) => {
  if (question.opcionesRespuesta.length !== 2) return false;

  const optionLabels = question.opcionesRespuesta.map((option) => normalizeText(option.descripcion));
  const booleanSets = [
    ['si', 'no'],
    ['sí', 'no'],
    ['verdadero', 'falso'],
    ['true', 'false'],
  ];

  return booleanSets.some((set) => set.every((label) => optionLabels.includes(normalizeText(label))));
};

const buildResponseTypeMap = (responseTypes: ChecklistResponseTypeDto[] = []) => new Map(responseTypes.map((responseType) => [responseType.id, responseType.descripcion]));

const resolveResponseTypeLabel = (question: RegistrationExamApiQuestionDto, responseTypesMap: Map<number, string>) =>
  responseTypesMap.get(question.tipoRespuestaId) ?? DEFAULT_RESPONSE_TYPE_LABELS[question.tipoRespuestaId] ?? `Tipo ${question.tipoRespuestaId}`;

const resolveQuestionType = (question: RegistrationExamApiQuestionDto, responseTypeLabel: string): RegistrationExamQuestionType => {
  const normalizedResponseType = normalizeText(responseTypeLabel);
  const hasOptions = question.opcionesRespuesta.length > 0;
  const isBoolean = isBooleanQuestion(question);

  if (normalizedResponseType.includes('abierta')) {
    if (question.maxLongitud && question.maxLongitud <= 120) return 'short_text';

    return 'long_text';
  }

  if (normalizedResponseType.includes('fecha')) return 'date';

  if (normalizedResponseType.includes('numerico')) return 'number';

  if (normalizedResponseType.includes('canvas')) return 'signature';

  if (normalizedResponseType.includes('archivo')) return 'file';

  if (normalizedResponseType.includes('seleccion unica')) {
    if (isBoolean) return 'boolean';

    return 'single_choice';
  }

  if (normalizedResponseType.includes('checkbox')) {
    if (!hasOptions) return 'boolean';
    if (isBoolean) return 'boolean';

    return 'checkbox_group';
  }

  if (normalizedResponseType.includes('multiple')) {
    if (isBoolean) return 'boolean';

    return hasOptions ? 'multiple_choice' : 'short_text';
  }

  if (question.tipoRespuestaId === 7) return 'number';

  if (question.tipoRespuestaId === 6) return 'signature';

  if (question.tipoRespuestaId === 2) return 'date';

  if (question.tipoRespuestaId === 1) {
    if (question.maxLongitud && question.maxLongitud <= 120) return 'short_text';

    return 'long_text';
  }

  if (hasOptions && isBoolean) return 'boolean';

  if (question.idsOpcionRespuestaObligatoria?.length > 1) return 'multiple_choice';

  if (hasOptions) return 'single_choice';

  return 'short_text';
};

const buildPlaceholder = (question: RegistrationExamApiQuestionDto, questionType: RegistrationExamQuestionType) => {
  if (question.minLongitud || question.maxLongitud) {
    const bounds = [question.minLongitud ? `mínimo ${question.minLongitud}` : '', question.maxLongitud ? `máximo ${question.maxLongitud}` : ''].filter(Boolean).join(', ');

    if (bounds) return `Respuesta ${bounds}`;
  }

  switch (questionType) {
    case 'number':
      return 'Escribe un valor numérico';
    case 'signature':
      return 'Firma dentro del recuadro';
    case 'file':
      return 'Adjunta el archivo solicitado';
    case 'short_text':
      return 'Escribe tu respuesta';
    case 'long_text':
      return 'Desarrolla tu respuesta';
    default:
      return '';
  }
};

const mapDependencyIds = (value: RegistrationExamApiQuestionDto['idOpcionRespuestaDependiente']) => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === 'number') return [String(value)];

  return [];
};

const mapQuestion = (
  question: RegistrationExamApiQuestionDto,
  section: RegistrationExamApiCategoryDto,
  responseTypesMap: Map<number, string>,
  parentQuestionId?: number | null
): RegistrationExamQuestion[] => {
  const responseTypeLabel = resolveResponseTypeLabel(question, responseTypesMap);
  const questionType = resolveQuestionType(question, responseTypeLabel);
  const currentQuestion: RegistrationExamQuestion = {
    id: question.id,
    code: question.codigo,
    question: question.pregunta,
    description: question.observacion ?? undefined,
    category: section.descripcion,
    categoryId: section.id,
    questionType,
    responseTypeId: question.tipoRespuestaId,
    responseTypeLabel,
    options: sortByOrder(question.opcionesRespuesta).map(mapOption),
    answered: false,
    placeholder: buildPlaceholder(question, questionType),
    required: question.obligatoria === 1,
    requiredOptionIds: (question.idsOpcionRespuestaObligatoria ?? []).map((item) => String(item)),
    parentQuestionId: parentQuestionId ?? null,
    dependsOnOptionIds: mapDependencyIds(question.idOpcionRespuestaDependiente),
    order: question.orden ?? undefined,
    maxScore: question.puntaje > 0 ? question.puntaje : undefined,
    editable: question.editable === 1,
    readonly: question.soloLectura === 1,
    minLength: question.minLongitud,
    maxLength: question.maxLongitud,
    minFiles: question.minFotos,
    maxFiles: question.maxFotos,
  };

  const dependentQuestions = sortByOrder(question.preguntasDependientes ?? []).flatMap((dependentQuestion) => mapQuestion(dependentQuestion, section, responseTypesMap, question.id));

  return [currentQuestion, ...dependentQuestions];
};

export const normalizeRegistrationExamDefinition = (definition: RegistrationExamDto, responseTypes: ChecklistResponseTypeDto[] = []): RegistrationExamDefinition => {
  const orderedSections = sortByOrder(definition.categorias ?? []).filter((category) => Array.isArray(category.preguntas) && category.preguntas.length > 0);
  const responseTypesMap = buildResponseTypeMap(responseTypes);
  const questions = orderedSections.flatMap((section) => sortByOrder(section.preguntas).flatMap((question) => mapQuestion(question, section, responseTypesMap)));
  const totalMaxScore = Math.round(questions.reduce((sum, q) => sum + (q.maxScore ?? 0), 0) * 100) / 100;

  return {
    id: definition.id,
    title: definition.titulo,
    version: definition.version,
    hasScoring: definition.calculaPeso === 1 && totalMaxScore > 0,
    totalMaxScore,
    sections: orderedSections.map((section) => ({
      id: section.id,
      title: section.descripcion,
      note: section.observacion || undefined,
    })),
    questions,
  };
};
