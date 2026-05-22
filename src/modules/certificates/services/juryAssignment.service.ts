import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import InstitutionsStore from '../../../shared/stores/institutions.store';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import type { InstitutionDto } from '../../../shared/dto/institution.dto';
import type {
  JuryAssignmentPanelData,
  JuryProjectDetail,
  EvaluatorOption,
  SelectedEvaluator,
  ApplicationProjectJuryApiItem,
  ApplicationProjectWithJuriesApiItem,
  ApplicationProjectJuryRelationApi,
  JuryAssignmentStatus,
  CreateApplicationProjectJuryBodyDto,
  CurrentJuryMember,
  JuryRole,
  TeacherForSelectApi,
} from '../dtos/juryAssignment.dto';

const ensureSelectedInstitution = () => {
  if (InstitutionsStore.state.selectedInstitution) return;

  const institutionsService = new InstitutionsService();
  const selected = institutionsService.getSelectedInstitution();
  if (selected) {
    InstitutionsStore.methods.setSelectedInstitution(selected);
    return;
  }

  const institutions = institutionsService.getInstitutions() as InstitutionDto[];
  if (institutions.length > 0) {
    InstitutionsStore.methods.setSelectedInstitution(institutions[0]);
  }
};

const getInstitutionId = (): number | null => {
  ensureSelectedInstitution();
  return InstitutionsStore.state.selectedInstitution?.id ?? null;
};

const getFullName = (people?: { names?: string; lastnames?: string } | null) => {
  if (!people) return '';
  return `${people.names ?? ''} ${people.lastnames ?? ''}`.trim();
};

const normalizeStatus = (assignedCount: number): JuryAssignmentStatus => {
  if (assignedCount >= 3) return 'complete';
  if (assignedCount === 0) return 'unassigned';
  return 'partial';
};

const normalizeStatusApi = (value: unknown): JuryAssignmentStatus | null => {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized.includes('complet')) return 'complete';
  if (normalized.includes('parcial')) return 'partial';
  if (normalized.includes('sin')) return 'unassigned';
  return null;
};

const unwrap = (payload: any) => payload?.data ?? payload;

const isGroupedProject = (item: any): item is ApplicationProjectWithJuriesApiItem => {
  return !!item && typeof item === 'object' && typeof item.id === 'number' && typeof item.name === 'string' && Array.isArray(item.juries);
};

const isRelationItem = (item: any): item is ApplicationProjectJuryApiItem => {
  return !!item && typeof item === 'object' && !!item.applicationProject;
};

const fetchAssignments = async (): Promise<Array<ApplicationProjectJuryApiItem | ApplicationProjectWithJuriesApiItem>> => {
  const institutionId = getInstitutionId();
  if (!institutionId) return [];

  const response = await axios.get<any>(`${services.structure}/admin/application-projects-juries`, {
    params: { institutionId },
  });

  const payload = unwrap(response.data);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const fetchTeachersForSelect = async (): Promise<TeacherForSelectApi[]> => {
  const institutionId = getInstitutionId();
  if (!institutionId) return [];

  const response = await axios.get<any>(`${services.users}/access/teachers-for-select`, {
    params: { perPage: 200, page: 1 },
  });

  const payload = unwrap(response.data);
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  return list as TeacherForSelectApi[];
};

const buildProjectGroups = (items: ApplicationProjectJuryApiItem[]) => {
  const groups = new Map<
    number,
    {
      project: ApplicationProjectJuryApiItem['applicationProject'];
      juries: ApplicationProjectJuryApiItem[];
    }
  >();

  items.forEach((item) => {
    const projectId = item.applicationProject?.id;
    if (!projectId) return;

    const existing = groups.get(projectId);
    if (existing) {
      existing.juries.push(item);
    } else {
      groups.set(projectId, {
        project: item.applicationProject,
        juries: [item],
      });
    }
  });

  return groups;
};

const buildCurrentJuryFromRelations = (items: ApplicationProjectJuryApiItem[]): CurrentJuryMember[] => {
  const roles: JuryRole[] = ['president', 'vocal_1', 'vocal_2'];
  const uniqueByUser = new Map<number, ApplicationProjectJuryApiItem>();
  items.forEach((i) => {
    if (!i.user?.id) return;
    if (!uniqueByUser.has(i.user.id)) {
      uniqueByUser.set(i.user.id, i);
    }
  });

  return Array.from(uniqueByUser.values())
    .slice(0, 3)
    .map((i, idx) => ({
      id: i.user.id,
      name: getFullName(i.user.people),
      role: roles[idx] ?? 'vocal_1',
      confirmationStatus: 'pending',
      relationId: i.id,
    }));
};

const buildCurrentJuryFromGrouped = (items: ApplicationProjectWithJuriesApiItem['juries']): CurrentJuryMember[] => {
  const roles: JuryRole[] = ['president', 'vocal_1', 'vocal_2'];
  const uniqueByUser = new Map<number, ApplicationProjectWithJuriesApiItem['juries'][number]>();
  items.forEach((i) => {
    const juryId = i.jury?.id;
    if (!juryId) return;
    if (!uniqueByUser.has(juryId)) {
      uniqueByUser.set(juryId, i);
    }
  });

  return Array.from(uniqueByUser.values())
    .slice(0, 3)
    .map((i, idx) => ({
      id: i.jury.id,
      name: getFullName(i.jury.people),
      role: roles[idx] ?? 'vocal_1',
      confirmationStatus: 'pending',
      relationId: i.id,
    }));
};

export const juryAssignmentService = {
  async getPanelData(): Promise<JuryAssignmentPanelData> {
    const items = await fetchAssignments();

    const grouped = items.filter(isGroupedProject);
    if (grouped.length > 0) {
      const projects = grouped.map((project) => {
        const assignedCount = new Set((project.juries ?? []).map((j) => j.jury?.id).filter(Boolean)).size;
        const status = normalizeStatusApi(project.juryStatus) ?? normalizeStatus(assignedCount);

        return {
          id: project.id,
          title: project.name,
          status,
          modality: 'degree_project' as const,
          studentName: getFullName(project.user?.people),
          tutorName: '',
          assignedCount,
          totalRequired: 3,
        };
      });

      const summary = projects.reduce(
        (acc, p) => {
          acc[p.status] += 1;
          return acc;
        },
        { complete: 0, partial: 0, unassigned: 0 } as Record<JuryAssignmentStatus, number>
      );

      return { summary, projects };
    }

    const relations = items.filter(isRelationItem);
    const groups = buildProjectGroups(relations);

    const projects = Array.from(groups.values()).map(({ project, juries }) => {
      const assignedCount = new Set(juries.map((j) => j.user?.id).filter(Boolean)).size;
      const status = normalizeStatus(assignedCount);

      return {
        id: project.id,
        title: project.name,
        status,
        modality: 'degree_project' as const,
        studentName: getFullName(project.user?.people),
        tutorName: '',
        assignedCount,
        totalRequired: 3,
      };
    });

    const summary = projects.reduce(
      (acc, p) => {
        acc[p.status] += 1;
        return acc;
      },
      { complete: 0, partial: 0, unassigned: 0 } as Record<JuryAssignmentStatus, number>
    );

    return {
      summary,
      projects,
    };
  },

  async getProjectDetail(projectId: number): Promise<JuryProjectDetail> {
    const items = await fetchAssignments();

    const grouped = items.filter(isGroupedProject).find((p) => p.id === projectId);
    if (grouped) {
      const assignedCount = new Set((grouped.juries ?? []).map((j) => j.jury?.id).filter(Boolean)).size;
      const status = normalizeStatusApi(grouped.juryStatus) ?? normalizeStatus(assignedCount);
      const currentJury = buildCurrentJuryFromGrouped(grouped.juries ?? []);

      return {
        id: projectId,
        title: grouped.name ?? '',
        studentName: getFullName(grouped.user?.people),
        tutorName: '',
        faculty: '',
        modality: 'degree_project',
        status,
        currentJury,
        preSelectedEvaluators: currentJury.map((m) => ({
          evaluatorId: m.id,
          role: m.role,
        })),
      };
    }

    const relations = items.filter(isRelationItem);
    const projectItems = relations.filter((i) => i.applicationProject?.id === projectId);

    const project = projectItems[0]?.applicationProject;
    const assignedCount = new Set(projectItems.map((j) => j.user?.id).filter(Boolean)).size;
    const status = normalizeStatus(assignedCount);
    const currentJury = buildCurrentJuryFromRelations(projectItems);

    return {
      id: projectId,
      title: project?.name ?? '',
      studentName: getFullName(project?.user?.people),
      tutorName: '',
      faculty: '',
      modality: 'degree_project',
      status,
      currentJury,
      preSelectedEvaluators: currentJury.map((m) => ({
        evaluatorId: m.id,
        role: m.role,
      })),
    };
  },

  async getEvaluatorOptions(): Promise<EvaluatorOption[]> {
    const teachers = await fetchTeachersForSelect();
    const items = await fetchAssignments();

    const fromRelations = items.flatMap((i) => {
      if (isGroupedProject(i)) {
        return (i.juries ?? [])
          .filter((j) => j.jury?.id)
          .map((j) => ({
            id: j.jury.id,
            people: j.jury.people,
          }));
      }
      if (isRelationItem(i) && i.user?.id) {
        return [
          {
            id: i.user.id,
            people: i.user.people,
          },
        ];
      }
      return [];
    }) as TeacherForSelectApi[];

    const byId = new Map<number, TeacherForSelectApi>();
    [...teachers, ...fromRelations].forEach((teacher) => {
      if (!byId.has(teacher.id)) {
        byId.set(teacher.id, teacher);
      }
    });

    return Array.from(byId.values()).map((t) => ({
      id: t.id,
      name: getFullName(t.people),
      department: '',
      specialties: [],
      activeProjects: 0,
    }));
  },

  async saveAssignment(projectId: number, evaluators: SelectedEvaluator[]): Promise<{ success: boolean }> {
    const institutionId = getInstitutionId();
    if (!institutionId) return { success: false };

    const items = await fetchAssignments();

    const currentRelations = (() => {
      const grouped = items.filter(isGroupedProject).find((p) => p.id === projectId);
      if (grouped) {
        return (grouped.juries ?? []).reduce((acc: Map<number, number[]>, i: ApplicationProjectJuryRelationApi) => {
          const juryId = i.jury?.id;
          if (!juryId) return acc;
          const existing = acc.get(juryId) ?? [];
          existing.push(i.id);
          acc.set(juryId, existing);
          return acc;
        }, new Map<number, number[]>());
      }

      const relations = items.filter(isRelationItem);
      return relations
        .filter((i) => i.applicationProject?.id === projectId)
        .reduce((acc, i) => {
          if (!i.user?.id) return acc;
          const existing = acc.get(i.user.id) ?? [];
          existing.push(i.id);
          acc.set(i.user.id, existing);
          return acc;
        }, new Map<number, number[]>());
    })();

    const selectedUserIds = Array.from(
      new Set(
        evaluators
          .filter((e) => !!e.evaluatorId)
          .map((e) => e.evaluatorId)
          .slice(0, 3)
      )
    );

    const currentUserIds = Array.from(currentRelations.keys());

    const toAdd = selectedUserIds.filter((id) => !currentRelations.has(id));
    const toRemove = currentUserIds.filter((id) => !selectedUserIds.includes(id));

    const createBodies: CreateApplicationProjectJuryBodyDto[] = toAdd.map((userId) => ({
      applicationProjectsId: projectId,
      userId,
    }));

    const deleteRelationIds = toRemove.flatMap((userId) => currentRelations.get(userId) ?? []).filter((relationId) => typeof relationId === 'number');

    await Promise.all([
      ...createBodies.map((body) =>
        axios.post(`${services.structure}/admin/application-projects-juries`, body, {
          params: { institutionId },
        })
      ),
      ...deleteRelationIds.map((relationId) =>
        axios.delete(`${services.structure}/admin/application-projects-juries/${relationId}`, {
          params: { institutionId },
        })
      ),
    ]);

    return { success: true };
  },
};
