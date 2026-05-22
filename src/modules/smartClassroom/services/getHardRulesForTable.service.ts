const HARD_CONSTRAINTS = [
  'Faculty specialization must match the course when specialization data exists.',
  'Each course must be assigned to exactly ONE faculty member for all its weekly sessions.',
  'Schedule all required weekly sessions for every course.',
  'A faculty member cannot teach two classes at the same time.',
  'A room cannot host two classes at the same time.',
  'Faculty can only teach during their available slots.',
  'Rooms can only be used during their available slots.',
  'Use only the provided days and time slots.',
  'Room type must be compatible with course type.',
  'Use the exact courseId, facultyId and roomId values provided.',
  'Before placing each entry, verify that the selected room and faculty are not already occupied at that exact day and time.',
];

interface HardRule {
  id: number;
  rule: string;
  category: string;
}

const CATEGORY_MAP: Record<number, string> = {
  0: 'Facultad',
  1: 'Asignación',
  2: 'Programación',
  3: 'Facultad',
  4: 'Sala',
  5: 'Facultad',
  6: 'Sala',
  7: 'Programación',
  8: 'Sala',
  9: 'Datos',
  10: 'Validación',
};

export class GetHardRulesForTableService {
  async run(params?: { page?: number; perPage?: number; search?: string }): Promise<{
    data: HardRule[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const page = params?.page ?? 1;
    const perPage = params?.perPage ?? 20;
    const search = params?.search?.toLowerCase() ?? '';

    let rules: HardRule[] = HARD_CONSTRAINTS.map((rule, idx) => ({
      id: idx + 1,
      rule,
      category: CATEGORY_MAP[idx] || 'General',
    }));

    if (search) {
      rules = rules.filter((r) => r.rule.toLowerCase().includes(search) || r.category.toLowerCase().includes(search));
    }

    const total = rules.length;
    const start = (page - 1) * perPage;
    const paginated = rules.slice(start, start + perPage);

    return { data: paginated, total, page, perPage };
  }
}
