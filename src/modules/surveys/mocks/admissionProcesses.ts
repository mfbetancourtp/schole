import type {
  AdmissionAcademicPeriod,
  AdmissionPaymentItem,
  AdmissionProcess,
  AdmissionProcessAppliesTo,
  AdmissionProcessAppliesToOption,
  AdmissionProcessReferenceData,
  AdmissionProcessStatus,
  AdmissionProcessStepType,
  AdmissionProcessStepTypeOption,
  AdmissionProgramPeriod,
  AdmissionSelectOption,
  AdmissionWorkflowStep,
} from '../dtos/admissionProcess.dto';
import type { DiscountDto } from '../dtos/discount.dto';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;

const clonePrograms = (programs: AdmissionProgramPeriod[]) =>
  programs.map((program) => ({
    ...program,
  }));

const cloneSteps = (steps: AdmissionWorkflowStep[]) =>
  steps.map((step) => ({
    ...step,
    appliesTo: [...step.appliesTo],
    discountIds: [...step.discountIds],
    paymentItems: step.paymentItems.map((item) => ({ ...item })),
    required: true,
  }));

const createPaymentItem = (conceptId: string, title: string, defaultUnitValue: number, isOptional = false, code?: string): AdmissionPaymentItem => ({
  id: generateId('payment-item'),
  conceptId,
  title,
  defaultUnitValue,
  isOptional,
  code,
});

export const admissionAcademicPeriodsMock: AdmissionAcademicPeriod[] = [
  {
    id: '2026-1',
    nombre: '2026-1',
    fechaInicio: '2026-01-15',
    fechaFin: '2026-06-30',
    programas: [
      {
        id: 'sys-2026-1',
        nombre: 'Ingeniería de Sistemas',
        modalidad: 'Presencial',
        cupos: 40,
        cuposOcupados: 26,
      },
      {
        id: 'adm-2026-1',
        nombre: 'Administración de Empresas',
        modalidad: 'Presencial',
        cupos: 35,
        cuposOcupados: 21,
      },
      {
        id: 'der-2026-1',
        nombre: 'Derecho',
        modalidad: 'Presencial',
        cupos: 30,
        cuposOcupados: 18,
      },
      {
        id: 'psi-2026-1',
        nombre: 'Psicología',
        modalidad: 'Híbrido',
        cupos: 28,
        cuposOcupados: 16,
      },
    ],
  },
  {
    id: '2026-2',
    nombre: '2026-2',
    fechaInicio: '2026-07-01',
    fechaFin: '2026-12-15',
    programas: [
      {
        id: 'sys-2026-2',
        nombre: 'Ingeniería de Sistemas',
        modalidad: 'Presencial',
        cupos: 42,
        cuposOcupados: 0,
      },
      {
        id: 'med-2026-2',
        nombre: 'Medicina',
        modalidad: 'Presencial',
        cupos: 24,
        cuposOcupados: 0,
      },
      {
        id: 'arq-2026-2',
        nombre: 'Arquitectura',
        modalidad: 'Presencial',
        cupos: 26,
        cuposOcupados: 0,
      },
      {
        id: 'cont-2026-2',
        nombre: 'Contaduría Pública',
        modalidad: 'Virtual',
        cupos: 38,
        cuposOcupados: 0,
      },
    ],
  },
  {
    id: '2025-2',
    nombre: '2025-2',
    fechaInicio: '2025-07-01',
    fechaFin: '2025-12-10',
    programas: [
      {
        id: 'sys-2025-2',
        nombre: 'Ingeniería de Sistemas',
        modalidad: 'Presencial',
        cupos: 38,
        cuposOcupados: 38,
      },
      {
        id: 'adm-2025-2',
        nombre: 'Administración de Empresas',
        modalidad: 'Presencial',
        cupos: 34,
        cuposOcupados: 31,
      },
      {
        id: 'neg-2025-2',
        nombre: 'Negocios Internacionales',
        modalidad: 'Híbrido',
        cupos: 27,
        cuposOcupados: 24,
      },
    ],
  },
];

export const admissionProcessStatusOptions: AdmissionSelectOption<AdmissionProcessStatus | 'all'>[] = [
  { id: 'all', name: 'Todos los estados' },
  { id: 'activo', name: 'Activo' },
  { id: 'borrador', name: 'Borrador' },
  { id: 'finalizado', name: 'Finalizado' },
  { id: 'inactivo', name: 'Inactivo' },
];

export const admissionProcessStepTypeOptions: AdmissionProcessStepTypeOption[] = [
  {
    id: 'formulario',
    name: 'Formulario',
    icon: 'file-alt',
    tone: 'blue',
    sourceId: 1,
  },
  {
    id: 'cobro',
    name: 'Cobro',
    icon: 'dollar-sign',
    tone: 'green',
    sourceId: 2,
  },
  {
    id: 'documento',
    name: 'Documento',
    icon: 'file-alt',
    tone: 'indigo',
    sourceId: 3,
  },
  {
    id: 'adjunto',
    name: 'Adjunto',
    icon: 'paperclip',
    tone: 'purple',
    sourceId: 4,
  },
];

export const admissionProcessAppliesToOptions: AdmissionProcessAppliesToOption[] = [{ id: 'nuevos', name: 'Nuevos', icon: 'user-plus', tone: 'green' }];

export const admissionPaymentMethodOptionsMock: AdmissionSelectOption<string>[] = [
  { id: 'pse', name: 'PSE' },
  { id: 'tarjeta_credito', name: 'Tarjeta de crédito' },
  { id: 'tarjeta_debito', name: 'Tarjeta débito' },
  { id: 'transferencia_bancaria', name: 'Transferencia bancaria' },
  { id: 'efectivo', name: 'Efectivo' },
];

export const admissionProcessElementsByType: Record<AdmissionProcessStepType, { id: string; name: string }[]> = {
  formulario: [
    { id: 'form-1', name: 'Solicitud de admisión' },
    { id: 'form-2', name: 'Información académica' },
    { id: 'form-3', name: 'Información socioeconómica' },
  ],
  cobro: [
    { id: 'charge-1', name: 'Derecho de inscripción y admisión' },
    { id: 'charge-2', name: 'Reserva de cupo' },
    { id: 'charge-3', name: 'Pago extraordinario' },
  ],
  documento: [
    { id: 'doc-1', name: 'Legalización de matrícula' },
    { id: 'doc-2', name: 'Carta de admisión' },
    { id: 'doc-3', name: 'Compromiso institucional' },
  ],
  adjunto: [
    { id: 'att-1', name: 'Documento de identidad' },
    { id: 'att-2', name: 'Acta o diploma de bachiller' },
    { id: 'att-3', name: 'Examen de admisión' },
  ],
};

export const admissionDiscountOptionsMock: DiscountDto[] = [
  {
    id: 1,
    institutionId: 75,
    title: 'Descuento pronto pago',
    description: 'Aplica a aspirantes que cancelen el proceso antes de la fecha límite.',
    value: 10,
    isPercent: 1,
    allowEdit: 0,
    applyProduct: 1,
    applyInvoice: 0,
    requireAttachment: 0,
    descriptionAttachment: '',
  },
  {
    id: 2,
    institutionId: 75,
    title: 'Convenio institucional',
    description: 'Beneficio para aspirantes provenientes de convenios activos.',
    value: 15,
    isPercent: 1,
    allowEdit: 0,
    applyProduct: 1,
    applyInvoice: 1,
    requireAttachment: 1,
    descriptionAttachment: 'Adjuntar carta o certificación del convenio.',
  },
  {
    id: 3,
    institutionId: 75,
    title: 'Beca mérito académico',
    description: 'Descuento fijo aplicado por rendimiento sobresaliente.',
    value: 50000,
    isPercent: 0,
    allowEdit: 0,
    applyProduct: 1,
    applyInvoice: 0,
    requireAttachment: 1,
    descriptionAttachment: 'Adjuntar soporte del promedio o certificación.',
  },
];

const createStep = (
  order: number,
  title: string,
  type: AdmissionProcessStepType,
  elementId: string,
  elementName: string,
  appliesTo: AdmissionProcessAppliesTo[],
  _required = true,
  description = '',
  extras?: Partial<AdmissionWorkflowStep>
): AdmissionWorkflowStep => {
  void _required;

  return {
    id: generateId('step'),
    referenceStepId: null,
    order,
    title,
    type,
    elementId,
    elementName,
    appliesTo,
    requiresApproval: false,
    solveAdmin: false,
    videoUrl: '',
    paymentMethod: null,
    allowQuotes: false,
    maxQuotes: null,
    minInitialQuoteValue: null,
    paymentItems: [],
    discountIds: [],
    description,
    required: true,
    ...extras,
  };
};

const admissionProcessesSeed: AdmissionProcess[] = [
  {
    id: 'proc-1',
    nombre: 'Proceso de Admisión Regular 2026-1',
    periodoAcademico: '2026-1',
    estado: 'activo',
    numeroPasos: 5,
    programas: clonePrograms(admissionAcademicPeriodsMock[0].programas.slice(0, 2)),
    fechaInicio: '2026-01-15',
    fechaFin: '2026-03-15',
    postulantes: 156,
    imagen: '',
    pasos: [
      createStep(1, 'Formulario', 'formulario', 'form-1', 'Solicitud de admisión', ['nuevos', 'antiguos'], true, 'Captura de información base del aspirante.'),
      createStep(2, 'Documentación requerida', 'adjunto', 'att-1', 'Documento de identidad', ['nuevos', 'antiguos'], true, 'Carga del documento vigente.'),
      createStep(3, 'Pago examen de admisión', 'cobro', 'charge-1', 'Derecho de inscripción y admisión', ['nuevos', 'antiguos'], true, 'Pago obligatorio para habilitar el examen.', {
        paymentMethod: 'pse',
        allowQuotes: true,
        maxQuotes: 3,
        minInitialQuoteValue: 40000,
        paymentItems: [createPaymentItem('charge-1', 'Derecho de inscripción y admisión', 120000, false, '54654521')],
        discountIds: [1, 2],
      }),
      createStep(4, 'Examen de Admisión', 'adjunto', 'att-3', 'Examen de admisión', ['nuevos'], true, 'Evaluación general de ingreso.'),
      createStep(5, 'Legalización de Matrícula', 'documento', 'doc-1', 'Legalización de matrícula', ['nuevos', 'antiguos'], true, 'Revisión final del expediente.'),
    ],
  },
  {
    id: 'proc-2',
    nombre: 'Proceso de Admisión Extraordinaria 2026-1',
    periodoAcademico: '2026-1',
    estado: 'activo',
    numeroPasos: 4,
    programas: clonePrograms(admissionAcademicPeriodsMock[0].programas.slice(2, 4)),
    fechaInicio: '2026-03-20',
    fechaFin: '2026-04-30',
    postulantes: 92,
    imagen: '',
    pasos: [
      createStep(1, 'Formulario Extraordinaria', 'formulario', 'form-2', 'Información académica', ['nuevos', 'antiguos']),
      createStep(2, 'Documentación requerida', 'adjunto', 'att-2', 'Acta o diploma de bachiller', ['nuevos', 'antiguos']),
      createStep(3, 'Pago de inscripción', 'cobro', 'charge-1', 'Derecho de inscripción y admisión', ['nuevos', 'antiguos'], true, '', {
        paymentMethod: 'pse',
        paymentItems: [createPaymentItem('charge-1', 'Derecho de inscripción y admisión', 120000, false, '54654521')],
        discountIds: [1],
      }),
      createStep(4, 'Carta de admisión', 'documento', 'doc-2', 'Carta de admisión', ['nuevos'], false, 'Solo para programas con alta demanda.'),
    ],
  },
  {
    id: 'proc-3',
    nombre: 'Proceso de Admisión Regular 2026-2',
    periodoAcademico: '2026-2',
    estado: 'borrador',
    numeroPasos: 5,
    programas: clonePrograms(admissionAcademicPeriodsMock[1].programas.slice(0, 3)),
    fechaInicio: '2026-07-01',
    fechaFin: '2026-08-31',
    postulantes: 0,
    imagen: '',
    pasos: [
      createStep(1, 'Formulario', 'formulario', 'form-1', 'Solicitud de admisión', ['nuevos', 'antiguos']),
      createStep(2, 'Formulario socioeconómico', 'formulario', 'form-3', 'Información socioeconómica', ['nuevos', 'antiguos'], false),
      createStep(3, 'Examen de Admisión', 'adjunto', 'att-3', 'Examen de admisión', ['nuevos', 'antiguos']),
      createStep(4, 'Pago de inscripción', 'cobro', 'charge-1', 'Derecho de inscripción y admisión', ['nuevos', 'antiguos'], true, '', {
        paymentMethod: 'tarjeta_credito',
        paymentItems: [createPaymentItem('charge-1', 'Derecho de inscripción y admisión', 120000, false, '54654521')],
        discountIds: [1, 3],
      }),
      createStep(5, 'Legalización de Matrícula', 'documento', 'doc-1', 'Legalización de matrícula', ['nuevos', 'antiguos']),
    ],
  },
  {
    id: 'proc-4',
    nombre: 'Proceso de Excelencia Académica 2025-2',
    periodoAcademico: '2025-2',
    estado: 'finalizado',
    numeroPasos: 6,
    programas: clonePrograms(admissionAcademicPeriodsMock[2].programas.slice(0, 1)),
    fechaInicio: '2025-05-20',
    fechaFin: '2025-07-10',
    postulantes: 214,
    imagen: '',
    pasos: [
      createStep(1, 'Información académica', 'formulario', 'form-2', 'Información académica', ['nuevos', 'antiguos']),
      createStep(2, 'Documento de identidad', 'adjunto', 'att-1', 'Documento de identidad', ['nuevos', 'antiguos']),
      createStep(3, 'Acta o diploma', 'adjunto', 'att-2', 'Acta o diploma de bachiller', ['nuevos', 'antiguos']),
      createStep(4, 'Reserva de cupo', 'cobro', 'charge-2', 'Reserva de cupo', ['nuevos'], true, '', {
        paymentMethod: 'transferencia_bancaria',
        paymentItems: [createPaymentItem('charge-2', 'Reserva de cupo', 85000, true, '22334455')],
        discountIds: [2],
      }),
      createStep(5, 'Compromiso institucional', 'documento', 'doc-3', 'Compromiso institucional', ['nuevos', 'antiguos']),
      createStep(6, 'Examen de Admisión', 'adjunto', 'att-3', 'Examen de admisión', ['nuevos', 'antiguos'], false, 'Confirmación final del proceso.'),
    ],
  },
  {
    id: 'proc-5',
    nombre: 'Proceso de Reingresos 2025-2',
    periodoAcademico: '2025-2',
    estado: 'inactivo',
    numeroPasos: 3,
    programas: clonePrograms(admissionAcademicPeriodsMock[2].programas.slice(1, 2)),
    fechaInicio: '2025-08-01',
    fechaFin: '2025-09-15',
    postulantes: 38,
    imagen: '',
    pasos: [
      createStep(1, 'Solicitud de reingreso', 'formulario', 'form-1', 'Solicitud de admisión', ['antiguos']),
      createStep(2, 'Documento de identidad', 'adjunto', 'att-1', 'Documento de identidad', ['antiguos']),
      createStep(3, 'Legalización de Matrícula', 'documento', 'doc-1', 'Legalización de matrícula', ['antiguos']),
    ],
  },
];

export const cloneAdmissionProcess = (process: AdmissionProcess): AdmissionProcess => ({
  ...process,
  programas: clonePrograms(process.programas),
  pasos: cloneSteps(process.pasos),
});

export const cloneAdmissionProcessesSeed = () => admissionProcessesSeed.map(cloneAdmissionProcess);

let admissionProcessesDb: AdmissionProcess[] = cloneAdmissionProcessesSeed();

export const getAdmissionProcessesDb = () => admissionProcessesDb.map(cloneAdmissionProcess);

export const getAdmissionReferenceData = (): AdmissionProcessReferenceData => ({
  academicPeriods: admissionAcademicPeriodsMock.map((period) => ({
    ...period,
    programas: clonePrograms(period.programas),
  })),
  statusOptions: admissionProcessStatusOptions.map((option) => ({ ...option })),
  stepTypeOptions: admissionProcessStepTypeOptions.map((option) => ({
    ...option,
  })),
  appliesToOptions: admissionProcessAppliesToOptions.map((option) => ({
    ...option,
  })),
  elementsByType: {
    formulario: admissionProcessElementsByType.formulario.map((item) => ({
      ...item,
    })),
    cobro: admissionProcessElementsByType.cobro.map((item) => ({ ...item })),
    documento: admissionProcessElementsByType.documento.map((item) => ({
      ...item,
    })),
    adjunto: admissionProcessElementsByType.adjunto.map((item) => ({
      ...item,
    })),
  },
});

export const getAdmissionAcademicPeriodById = (periodId: string) => admissionAcademicPeriodsMock.find((period) => period.id === periodId);

export const getAdmissionStatusLabel = (status: AdmissionProcessStatus) =>
  ({
    activo: 'Activo',
    borrador: 'Borrador',
    finalizado: 'Finalizado',
    inactivo: 'Inactivo',
  }[status]);

export const getAdmissionStatusVariant = (status: AdmissionProcessStatus) =>
  ({
    activo: 'success',
    borrador: 'warning',
    finalizado: 'primary-20',
    inactivo: 'dark',
  }[status]);

export const createAdmissionProcessStats = (processes: AdmissionProcess[]) => ({
  totalProcesos: processes.length,
  activos: processes.filter((process) => process.estado === 'activo').length,
  totalPostulantes: processes.reduce((sum, process) => sum + process.postulantes, 0),
  promedioPasos: processes.length ? Math.round(processes.reduce((sum, process) => sum + process.numeroPasos, 0) / processes.length) : 0,
});

const normalizeProcess = (process: AdmissionProcess): AdmissionProcess => ({
  ...process,
  numeroPasos: process.pasos.length,
  programas: clonePrograms(process.programas),
  pasos: cloneSteps(
    process.pasos
      .map((step, index) => ({
        ...step,
        order: index + 1,
        required: true,
      }))
      .sort((left, right) => left.order - right.order)
  ),
});

export const upsertAdmissionProcessDb = (process: AdmissionProcess) => {
  const normalized = normalizeProcess(process);
  const index = admissionProcessesDb.findIndex((current) => current.id === normalized.id);

  if (index >= 0) {
    admissionProcessesDb.splice(index, 1, normalized);
  } else {
    admissionProcessesDb = [normalized, ...admissionProcessesDb];
  }

  return cloneAdmissionProcess(normalized);
};

export const deleteAdmissionProcessDb = (id: string) => {
  admissionProcessesDb = admissionProcessesDb.filter((process) => process.id !== id);
};

export const duplicateAdmissionProcessDb = (id: string) => {
  const process = admissionProcessesDb.find((current) => current.id === id);
  if (!process) return null;

  const duplicated: AdmissionProcess = {
    ...cloneAdmissionProcess(process),
    id: generateId('proc'),
    nombre: `${process.nombre} (Copia)`,
    estado: 'borrador',
    postulantes: 0,
    programas: process.programas.map((program) => ({
      ...program,
      id: generateId('program'),
      cuposOcupados: 0,
    })),
    pasos: process.pasos.map((step, index) => ({
      ...step,
      id: generateId('step'),
      order: index + 1,
    })),
  };

  admissionProcessesDb = [duplicated, ...admissionProcessesDb];

  return cloneAdmissionProcess(duplicated);
};

export const createAdmissionProcessId = () => generateId('proc');
