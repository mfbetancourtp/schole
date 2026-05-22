export type RegistrationExamState = 'initial' | 'active' | 'completed';

export type RegistrationExamBackendStatus = 'No iniciado' | 'En progreso' | 'Entregado' | 'En revisión' | 'Aprobado' | 'Rechazado';

export type RegistrationExamQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'checkbox_group'
  | 'boolean'
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'email'
  | 'date'
  | 'datetime'
  | 'file'
  | 'signature';

export interface RegistrationExamOption {
  id: string;
  text: string;
  helperText?: string;
  score?: number;
}

export interface RegistrationExamQuestion {
  id: number;
  code?: string;
  question: string;
  description?: string;
  category?: string;
  categoryId?: number;
  questionType: RegistrationExamQuestionType;
  responseTypeId?: number;
  responseTypeLabel?: string;
  options?: RegistrationExamOption[];
  answered: boolean;
  selectedOption?: string | null;
  selectedOptions?: string[];
  answerText?: string;
  answerBoolean?: boolean | null;
  answerSignature?: string;
  answerFile?: File | null;
  answerFileName?: string;
  answerFileUrl?: string;
  answerFileMimeType?: string;
  placeholder?: string;
  required?: boolean;
  requiredOptionIds?: string[];
  parentQuestionId?: number | null;
  dependsOnOptionIds?: string[];
  order?: number;
  editable?: boolean;
  readonly?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  minFiles?: number | null;
  maxFiles?: number | null;
  flagged?: boolean;
  maxScore?: number;
}

export interface RegistrationExamProgress {
  examState: RegistrationExamState;
  questions: RegistrationExamQuestion[];
  currentQuestionIndex: number;
  currentQuestionId?: number | null;
  timeRemaining: number;
}

export const REGISTRATION_EXAM_DURATION_SECONDS = 60 * 60;

const DEFAULT_EXAM_QUESTIONS: RegistrationExamQuestion[] = [
  {
    id: 1,
    category: 'Razonamiento lógico',
    questionType: 'single_choice',
    question: '¿Cuál es el resultado de 15 + 27?',
    description: 'Selecciona la opción correcta entre las alternativas disponibles.',
    options: [
      { id: 'a', text: '32' },
      { id: 'b', text: '42' },
      { id: 'c', text: '52' },
      { id: 'd', text: '62' },
    ],
    answered: false,
  },
  {
    id: 2,
    category: 'Pensamiento computacional',
    questionType: 'multiple_choice',
    question: 'Selecciona dos tecnologías que se usan para construir interfaces web.',
    description: 'Puedes elegir más de una respuesta.',
    options: [
      { id: 'a', text: 'CSS', helperText: 'Da estilo visual a las páginas.' },
      {
        id: 'b',
        text: 'HTML',
        helperText: 'Define la estructura del contenido.',
      },
      { id: 'c', text: 'SMTP', helperText: 'Se usa para correo electrónico.' },
      {
        id: 'd',
        text: 'FTP',
        helperText: 'Se usa para transferencia de archivos.',
      },
    ],
    answered: false,
  },
  {
    id: 3,
    category: 'Comprensión técnica',
    questionType: 'boolean',
    question: 'Un algoritmo de búsqueda binaria requiere que los datos estén ordenados.',
    description: 'Indica si la afirmación es verdadera o falsa.',
    answered: false,
  },
  {
    id: 4,
    category: 'Comunicación escrita',
    questionType: 'short_text',
    question: '¿Qué significa la sigla API?',
    description: 'Escribe la respuesta en una sola línea.',
    placeholder: 'Ejemplo: Application Programming Interface',
    answered: false,
  },
  {
    id: 5,
    category: 'Argumentación',
    questionType: 'long_text',
    question: 'Describe brevemente por qué quieres ingresar a este programa académico.',
    description: 'Usa un texto claro y estructurado. Puedes escribir varias líneas.',
    placeholder: 'Comparte tu motivación, intereses y expectativas.',
    answered: false,
  },
  {
    id: 6,
    category: 'Pensamiento numérico',
    questionType: 'number',
    question: '¿Cuántos bits tiene un byte?',
    description: 'Ingresa únicamente el valor numérico.',
    placeholder: 'Ejemplo: 8',
    answered: false,
  },
  {
    id: 7,
    category: 'Contacto',
    questionType: 'email',
    question: 'Escribe un correo electrónico válido para recibir el resultado del examen.',
    description: 'Debe ser un correo activo y correctamente escrito.',
    placeholder: 'nombre@correo.com',
    answered: false,
  },
  {
    id: 8,
    category: 'Agenda',
    questionType: 'date',
    question: 'Selecciona la fecha en la que podrías asistir a la jornada de inducción.',
    description: 'Elige una fecha disponible en tu calendario.',
    answered: false,
  },
  {
    id: 9,
    category: 'Disponibilidad',
    questionType: 'datetime',
    question: 'Selecciona una fecha y hora tentativa para una entrevista de seguimiento.',
    description: 'Esta información nos ayuda a planificar la siguiente fase del proceso.',
    answered: false,
  },
];

const normalizeText = (value?: string | null) =>
  String(value ?? '')
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const normalizeRegistrationExamBackendStatus = (value?: string | null): RegistrationExamBackendStatus => {
  const normalizedValue = normalizeText(value);

  if (normalizedValue === 'en progreso') return 'En progreso';
  if (normalizedValue === 'entregado' || normalizedValue === 'ntregado') return 'Entregado';
  if (normalizedValue === 'en revision') return 'En revisión';
  if (normalizedValue === 'aprobado') return 'Aprobado';
  if (normalizedValue === 'rechazado') return 'Rechazado';

  return 'No iniciado';
};

export const mapRegistrationExamBackendStatusToState = (status?: string | null): RegistrationExamState => {
  const normalizedStatus = normalizeRegistrationExamBackendStatus(status);

  if (normalizedStatus === 'En progreso') return 'active';
  if (normalizedStatus === 'No iniciado') return 'initial';

  return 'completed';
};

export const parseRegistrationExamDurationSeconds = (duration?: string | null, fallbackSeconds = REGISTRATION_EXAM_DURATION_SECONDS) => {
  const normalizedDuration = String(duration ?? '').trim();

  if (!normalizedDuration) return fallbackSeconds;

  const parts = normalizedDuration.split(':').map((part) => Number.parseInt(part, 10));

  if (parts.some((part) => Number.isNaN(part) || part < 0)) return fallbackSeconds;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;

    return Math.max(hours * 3600 + minutes * 60 + seconds, 1);
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;

    return Math.max(minutes * 60 + seconds, 1);
  }

  if (parts.length === 1) {
    return Math.max(parts[0] * 60, 1);
  }

  return fallbackSeconds;
};

export const formatRegistrationExamDuration = (seconds: number) => {
  const safeSeconds = Math.max(Math.round(seconds), 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  const pieces = [
    hours ? `${hours} ${hours === 1 ? 'hora' : 'horas'}` : '',
    minutes ? `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}` : '',
    remainingSeconds ? `${remainingSeconds} ${remainingSeconds === 1 ? 'segundo' : 'segundos'}` : '',
  ].filter(Boolean);

  return pieces.join(' ') || '0 minutos';
};

export const calculateRegistrationExamRemainingSeconds = (startedAt?: string | null, durationSeconds = REGISTRATION_EXAM_DURATION_SECONDS) => {
  if (!startedAt) return durationSeconds;

  const startedAtTime = new Date(startedAt).getTime();

  if (Number.isNaN(startedAtTime)) return durationSeconds;

  const elapsedSeconds = Math.max(Math.floor((Date.now() - startedAtTime) / 1000), 0);

  return Math.max(durationSeconds - elapsedSeconds, 0);
};

const cloneRegistrationExamQuestion = (question: RegistrationExamQuestion): RegistrationExamQuestion => ({
  ...question,
  options: question.options?.map((option) => ({ ...option })),
  selectedOption: question.selectedOption ?? null,
  selectedOptions: [...(question.selectedOptions ?? [])],
  answerText: question.answerText ?? '',
  answerBoolean: typeof question.answerBoolean === 'boolean' ? question.answerBoolean : null,
  answerSignature: question.answerSignature ?? '',
  answerFile: question.answerFile ?? null,
  answerFileName: question.answerFileName ?? '',
  answerFileUrl: question.answerFileUrl ?? '',
  answerFileMimeType: question.answerFileMimeType ?? '',
  requiredOptionIds: [...(question.requiredOptionIds ?? [])],
  dependsOnOptionIds: [...(question.dependsOnOptionIds ?? [])],
  editable: question.editable ?? true,
  readonly: question.readonly ?? false,
  minLength: question.minLength ?? null,
  maxLength: question.maxLength ?? null,
  minFiles: question.minFiles ?? null,
  maxFiles: question.maxFiles ?? null,
  flagged: question.flagged ?? false,
});

export const hasRegistrationExamAnswer = (question: RegistrationExamQuestion) => {
  switch (question.questionType) {
    case 'single_choice':
    case 'boolean':
      return Boolean(question.selectedOption);
    case 'multiple_choice':
    case 'checkbox_group':
      return Boolean(question.selectedOptions?.length);
    case 'short_text':
    case 'long_text':
    case 'number':
    case 'email':
    case 'date':
    case 'datetime':
      return Boolean(String(question.answerText ?? '').trim());
    case 'signature':
      return Boolean(String(question.answerSignature ?? '').trim());
    case 'file':
      return Boolean(question.answerFile || question.answerFileUrl);
    default:
      return false;
  }
};

const normalizeStoredOptionId = (question: RegistrationExamQuestion, value: unknown) => {
  if (typeof value === 'string') {
    return question.options?.some((option) => option.id === value) ? value : null;
  }

  if (typeof value === 'number') {
    const stringValue = String(value);

    return question.options?.some((option) => option.id === stringValue) ? stringValue : question.options?.[value]?.id ?? null;
  }

  return null;
};

const normalizeStoredOptionIds = (question: RegistrationExamQuestion, value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value.map((currentValue) => normalizeStoredOptionId(question, currentValue)).filter((currentValue): currentValue is string => Boolean(currentValue));
};

const normalizeStoredQuestion = (fallbackQuestion: RegistrationExamQuestion, storedQuestion?: Partial<RegistrationExamQuestion> & { answer?: unknown }) => {
  const normalizedQuestion = cloneRegistrationExamQuestion(fallbackQuestion);

  normalizedQuestion.selectedOption = normalizeStoredOptionId(normalizedQuestion, storedQuestion?.selectedOption);
  normalizedQuestion.selectedOptions = normalizeStoredOptionIds(normalizedQuestion, storedQuestion?.selectedOptions);
  normalizedQuestion.flagged = Boolean(storedQuestion?.flagged);

  if (typeof storedQuestion?.answerBoolean === 'boolean') {
    normalizedQuestion.answerBoolean = storedQuestion.answerBoolean;
  } else if (normalizedQuestion.questionType === 'boolean' && typeof storedQuestion?.selectedOption !== 'undefined') {
    normalizedQuestion.answerBoolean = Boolean(normalizeStoredOptionId(normalizedQuestion, storedQuestion.selectedOption));
  }

  if (typeof storedQuestion?.answerText === 'string') {
    normalizedQuestion.answerText = storedQuestion.answerText;
  } else if (typeof storedQuestion?.answer === 'string' || typeof storedQuestion?.answer === 'number') {
    normalizedQuestion.answerText = String(storedQuestion.answer);
  }

  if (typeof storedQuestion?.answerSignature === 'string') {
    normalizedQuestion.answerSignature = storedQuestion.answerSignature;
  }

  if (typeof storedQuestion?.answerFileName === 'string') {
    normalizedQuestion.answerFileName = storedQuestion.answerFileName;
  }

  if (typeof storedQuestion?.answerFileUrl === 'string') {
    normalizedQuestion.answerFileUrl = storedQuestion.answerFileUrl;
  }

  if (typeof storedQuestion?.answerFileMimeType === 'string') {
    normalizedQuestion.answerFileMimeType = storedQuestion.answerFileMimeType;
  }

  normalizedQuestion.answerFile = null;

  normalizedQuestion.answered = hasRegistrationExamAnswer(normalizedQuestion);

  return normalizedQuestion;
};

export const createRegistrationExamQuestions = () => DEFAULT_EXAM_QUESTIONS.map((question) => cloneRegistrationExamQuestion(question));

export const buildRegistrationExamStorageKey = (convocationEnrolId: string | number, stepId: string | number) => `registration-modern-exam:${convocationEnrolId}:${stepId}`;

export const createDefaultRegistrationExamProgress = (questions: RegistrationExamQuestion[] = createRegistrationExamQuestions()): RegistrationExamProgress => ({
  examState: 'initial',
  questions,
  currentQuestionIndex: 0,
  currentQuestionId: questions[0]?.id ?? null,
  timeRemaining: REGISTRATION_EXAM_DURATION_SECONDS,
});

const resolveCurrentQuestionId = (parsed: Partial<RegistrationExamProgress>, questions: RegistrationExamQuestion[]) => {
  if (typeof parsed.currentQuestionId === 'number' && questions.some((question) => question.id === parsed.currentQuestionId)) {
    return parsed.currentQuestionId;
  }

  if (typeof parsed.currentQuestionIndex === 'number') {
    return questions[Math.max(Math.min(parsed.currentQuestionIndex, questions.length - 1), 0)]?.id ?? null;
  }

  return questions[0]?.id ?? null;
};

export const loadRegistrationExamProgress = (
  convocationEnrolId: string | number,
  stepId: string | number,
  fallbackQuestions: RegistrationExamQuestion[] = createRegistrationExamQuestions()
): RegistrationExamProgress => {
  const defaultQuestions = fallbackQuestions.map((question) => cloneRegistrationExamQuestion(question));

  if (typeof window === 'undefined') {
    return {
      ...createDefaultRegistrationExamProgress(defaultQuestions),
      questions: defaultQuestions,
    };
  }

  try {
    const raw = window.localStorage.getItem(buildRegistrationExamStorageKey(convocationEnrolId, stepId));

    if (!raw) {
      return {
        ...createDefaultRegistrationExamProgress(defaultQuestions),
        questions: defaultQuestions,
      };
    }

    const parsed = JSON.parse(raw) as Partial<RegistrationExamProgress>;
    const storedQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    const normalizedQuestions = defaultQuestions.map((question) =>
      normalizeStoredQuestion(
        question,
        storedQuestions.find((storedQuestion: any) => storedQuestion?.id === question.id)
      )
    );

    return {
      examState: parsed.examState === 'active' || parsed.examState === 'completed' ? parsed.examState : 'initial',
      questions: normalizedQuestions,
      currentQuestionIndex: typeof parsed.currentQuestionIndex === 'number' ? parsed.currentQuestionIndex : 0,
      currentQuestionId: resolveCurrentQuestionId(parsed, normalizedQuestions),
      timeRemaining: typeof parsed.timeRemaining === 'number' ? parsed.timeRemaining : REGISTRATION_EXAM_DURATION_SECONDS,
    };
  } catch {
    return {
      ...createDefaultRegistrationExamProgress(defaultQuestions),
      questions: defaultQuestions,
    };
  }
};

export const saveRegistrationExamProgress = (convocationEnrolId: string | number, stepId: string | number, progress: RegistrationExamProgress) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    buildRegistrationExamStorageKey(convocationEnrolId, stepId),
    JSON.stringify(progress, (key, value) => {
      if (key === 'answerFile') return undefined;

      return value;
    })
  );
};

export const isRegistrationExamStep = (step: {
  title?: string | null;
  description?: string | null;
  detail?: Array<{ title?: string | null; description?: string | null }> | { title?: string | null; description?: string | null } | null;
}) => {
  const detailText = Array.isArray(step.detail)
    ? step.detail.map((detail) => `${detail.title ?? ''} ${detail.description ?? ''}`).join(' ')
    : `${step.detail?.title ?? ''} ${step.detail?.description ?? ''}`;

  const fullText = normalizeText(`${step.title ?? ''} ${step.description ?? ''} ${detailText}`);

  return /examen\s+de\s+admision/.test(fullText) || /admision\s+.*\s+examen/.test(fullText) || /admission\s+exam/.test(fullText);
};
