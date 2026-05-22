<template>
  <div style="max-width: 100%; padding: 0 20px">
    <div class="selection">
      <div class="category-list">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="{ 'selected-button': category === selectedCategory }"
          @click="selectCategory(category)"
        >
          {{ category.name }}
        </button>
      </div>
      <div
        style="
          display: flex;
          background: rgb(255, 255, 255);
          box-shadow: rgba(0, 0, 0, 0.45) 1px 2px 6px;
          border-radius: 8px;
          width: 100%;
          gap: 12px;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
        "
      >
        <AppPulseLoading v-if="loading" />

        <div style="display: flex; gap: 20px">
          <div
            v-if="selectedCategory"
            style="
              border-right: 1px solid #dee2e6;
              padding-right: 20px;
              width: 100%;
            "
          >
            <!-- Selección de roles y niveles académicos -->
            <div v-if="selectedCategory.type === 'academic'">
              <h6>Selección de roles:</h6>
              <div class="form-row" style="width: 100%; flex-wrap: wrap">
                <div
                  v-for="role in dataTableRelation.academic.roless"
                  :key="role.id"
                  class="form-check form-switch"
                >
                  <AppFormField :label="role.name">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="`role-${role.id}`"
                      :value="role.id"
                      @click="selectRolAcademic(role)"
                      v-model="role.selected"
                    />
                  </AppFormField>
                </div>
              </div>
              <h3>Niveles Académicos</h3>
              <ul>
                <li
                  v-for="level in dataTableRelation.academic.nivelss"
                  :key="level.id"
                  :class="{ 'selected-button': level.selected }"
                  @click="selectLevel(level)"
                >
                  {{ level.name }}
                </li>
              </ul>

              <div
                v-if="validateRol"
                class="text-center alert alert-warning"
                role="alert"
              >
                <AppIcon
                  icon="exclamation-triangle"
                  class="me-1"
                  size="lg"
                ></AppIcon>
                <strong
                  >Debes de seleccionar al menos un rol y un nivel
                  académico.</strong
                >
              </div>
            </div>

            <!-- Administrativo -->
            <div
              v-else-if="selectedCategory.type === 'administrative'"
              style="width: 100%"
            >
              <h6>Roles:</h6>
              <div class="form-row" style="width: 100%; flex-wrap: wrap">
                <ul style="width: 100%">
                  <li
                    style="width: 100%"
                    :class="{ 'selected-button': allSelectedRoles }"
                    @click="toggleAllRoles"
                  >
                    Todos
                  </li>
                  <li
                    v-for="role in dataTableRelation.administrative.roless"
                    :key="role.id"
                    :class="{
                      'selected-button': role.selected,
                    }"
                    @click="selectRole(role)"
                  >
                    {{ role.name }}
                  </li>
                </ul>
              </div>
              <div
                v-if="validateRol"
                class="text-center alert alert-warning"
                role="alert"
              >
                <AppIcon
                  icon="exclamation-triangle"
                  class="me-1"
                  size="lg"
                ></AppIcon>
                <strong>Debes de seleccionar al menos un rol.</strong>
              </div>
            </div>
          </div>

          <!-- Sección de Grados -->

          <!-- SE DEBE REVISAR LA CONDICION DE MOSTRAR LOS GRADOS CUANDO PASO DE ADMINISTRATIVOS A NIVELES -->
          <div
            v-if="
              selectedLevel.length > 0 && selectedCategory.type === 'academic'
            "
          >
            <h3>Grados</h3>
            <ul>
              <div>
                <AppFormField style="display: flex; gap: 5px">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="allSelected"
                    @change="toggleAllGrades"
                  />
                  <label>Todos</label>
                </AppFormField>
              </div>
              <div
                v-for="nivel in selectedLevel"
                :key="nivel.id"
                style="display: flex; flex-direction: column"
              >
                <div
                  v-for="grade in nivel.degrees"
                  :key="grade.id"
                  style="display: flex; flex-direction: column"
                >
                  <div
                    v-for="group in grade.groups"
                    :key="group.id"
                    style="display: flex; gap: 10px"
                  >
                    <AppFormField>
                      <input
                        style="margin-right: 5px"
                        class="form-check-input"
                        type="checkbox"
                        :checked="group.selected"
                        @change="() => toggleGrade(group)"
                      />
                      <label>{{ `${grade.name} ${group.abbreviation}` }}</label>
                    </AppFormField>
                  </div>
                </div>
              </div>
            </ul>
          </div>

          <!-- Sección de Usuarios -->
          <div
            v-if="
              selectedCategory.type === 'administrative' &&
              usersByRole.length > 0
            "
          >
            <h3>Usuarios</h3>
            <AppFormField style="display: flex; gap: 5px">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="allSelectedUsers"
                @change="toggleAllUsers"
              />
              <label>Todos</label>
            </AppFormField>
            <ul>
              <div
                v-for="user in usersByRole"
                :key="user.id"
                style="display: flex; flex-direction: column"
              >
                <AppFormField>
                  <input
                    style="margin-right: 5px"
                    class="form-check-input"
                    type="checkbox"
                    :checked="user.selected"
                    @change="() => toggleUser(user)"
                  />
                  <label>{{ user.names }}</label>
                </AppFormField>
              </div>
            </ul>
          </div>
        </div>
        <div v-if="levelsAcademic" class="alert alert-warning" role="alert">
          <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
          <strong>Recuerde:</strong>
          <br />
          - Si selecciona un nivel académico, debe seleccionar al menos un rol.
          <br />
          - Si selecciona un rol, debe seleccionar al menos un nivel o grado
        </div>

        <div
          v-if="
            selectedCategory.type === 'administrative' && administrativeSelect
          "
          class="alert alert-warning"
          role="alert"
        >
          <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
          <strong>Recuerde:</strong> Debe seleccionar al menos un rol y un
          usuario para cada rol seleccionado antes de guardar.
        </div>

        <div class="form-row d-flex justify-content-end mt-3">
          <AppButton
            v-if="selectedCategoryIndex > 0"
            variant="primary"
            label="Atrás"
            @click="goBack"
          ></AppButton>
          <AppButton
            v-if="selectedCategoryIndex < categories.length - 1"
            variant="primary"
            label="Siguiente"
            @click="goForward"
          ></AppButton>
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="form-row d-flex justify-content-end mb-3 mt-3">
      <AppButton variant="primary" label="Agregar" @click="save"></AppButton>
    </div> -->

  <div class="form-row d-flex justify-content-end mb-3 mt-3">
    <AppButton
      class=" buttons"
      label="Actualizar Evento"
      @click="save"
    >
    </AppButton>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { GetAllRolesService } from '../../access/services/getAllRoles.service';
import { GetAllRolesAdministrativeService } from '../../access/services/getAllRolesAdministrative.service';
import { GetAllRolesAcademicService } from '../../access/services/getAllRolesAcademic.service';
import { GetUserByRoleService } from '../../reports/services/reports/getUserByRole.service';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { GetViewsInstitutionalActivitiesByInstitutionalActivityService } from '../services/getViewsInstitutionalActivitiesByInstitutionalActivity.service';
import { GetRelatedDataGroupsByAcademicPeriodCopyService } from '../services/getRelatedDataGroupsByAcademicPeriodCopy.service';
import { CreateOrUpdateViewsInstitutionalActivitiesService } from '../services/createOrUpdateViewsInstitutionalActivities.service';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import { CreateOrUpdateInstitutionalActivitiesService } from '../services/createOrUpdateInstitutionalActivities.service';
import { GetInstitutionalActivityWithTasksService } from '../services/getInstitutionalActivityWithTasks.service';

const getInstitutionalActivityWithTasksService =  new GetInstitutionalActivityWithTasksService();
const getViewsInstitutionalActivitiesByInstitutionalActivityService =
  new GetViewsInstitutionalActivitiesByInstitutionalActivityService();
const getAllRolesService = new GetAllRolesService();
const getAllRolesAdministrativeService = new GetAllRolesAdministrativeService();
const getAllRolesAcademicService = new GetAllRolesAcademicService();

const getUserByRoleService = new GetUserByRoleService();
const createOrUpdateViewsInstitutionalActivitiesService =
  new CreateOrUpdateViewsInstitutionalActivitiesService();
const createOrUpdateInstitutionalActivitiesService =
  new CreateOrUpdateInstitutionalActivitiesService();
const getRelatedDataGroupsByAcademicPeriodCopyService =
  new GetRelatedDataGroupsByAcademicPeriodCopyService();

export default defineComponent({
  name: 'InstitutionalTimelineForm',
  components: {
    AppFormField,
    AppButton,
    AppIcon,
    AppPulseLoading,
  },
  setup() {
    const route = useRoute();
    const loading = ref(false);
    const academicPeriodId = ref(route.query.academicPeriodId);

    const categories = ref([
      { id: 0, name: 'Niveles Académicos', type: 'academic' },
      { id: 1, name: 'Administrativos', type: 'administrative' },
    ]);
    const data = ref([]);
    const roles = ref([]);
    const usersByRole = ref([]);
    const rolesAcademic = ref([]);
    const rolesAdministrative = ref([]);

    const dataTableRelation = ref({
      academic: {
        nivelss: [],
        roless: [],
      },
      administrative: {
        roless: [],
      },
    });

    const selectedRoleAcademic = ref([]); // Inicialmente un array vacío

    const institutionalActivityId = ref(
      localStorage.getItem('institutionalActivityId')
    );
    const selectedCategoryIndex = ref(0); // Índice de la categoría seleccionada

    const dataEvent = ref<any[]>([]);

    const selectedCategory = ref(categories.value[0]);

    const selectedLevel = ref([]); // Inicialmente un array vacío
    const selectedRole = ref(null);
    const form = reactive({
      id: null,
      institutionalActivityId: null,
      roleIds: [] as number[],
      supervisorApgIds: [] as number[],
      supervisorUserIds: [] as number[],
      viewsInstitutionalActivityId: null,
      title: '',
      startDate: '',
      endDate: '',
      responsibleInstitutionalActivityIds: [],
      // objective: '',
    });
    const sessionData = ref<
      {
        roleIds: number[];
        supervisorApgIds: number[];
        supervisorUserIds: number[];
      }[]
    >([]);

    const allSelected = ref(false); // Variable para el checkbox "Todos"
    const apgActive = ref(false);
    const allSelectedLevelsCondition = ref(true);
    const allSelectedRolesCondition = ref(false);
    const allSelectedUsers = ref(false);
    const levelsAcademic = ref(false);
    const administrativeSelect = ref(false);
    const validateRol = ref(false);
    const validateApgIds = ref(false);
    const allSelectedRoles = ref(false); // Variable para el estado "Todos" en roles administrativos

    const v$ = useVuelidate(
      {
        form: {
          roleIds: {},
          supervisorApgIds: {},
          supervisorUserIds: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        
        let responseEvent = await getInstitutionalActivityWithTasksService.run(
          Number(localStorage.getItem('institutionalActivityId'))
        );
        console.log('responseEvenresponseEventt', responseEvent);

        form.title = responseEvent.title;
        form.startDate = responseEvent?.startDate;
        form.endDate = responseEvent?.endDate;
        form.responsibleInstitutionalActivityIds =
          responseEvent?.responsibleInstitutionalActivityIds
            ? responseEvent.responsibleInstitutionalActivityIds
                .split(',')
                .map(Number)
            : [];
        form.viewsInstitutionalActivityId = responseEvent.viewsInstitutionalActivityId?? null;
        const userJson = localStorage.getItem('user');
        if (!userJson) {
          console.error('No user data found in localStorage');
          return;
        }
        const user = JSON.parse(userJson);
        if (!user || !user.id) {
          console.error('User data is not valid or ID is missing');
          return;
        }

        await loadInitialData();
        // Inicializar los roles con 'selected' a false
        dataTableRelation.value.academic.roless.forEach((role) => {
          role.selected = selectedRoleAcademic.value.includes(role.id);
        });

        data.value = await getRelatedDataGroupsByAcademicPeriodCopyService.run(
          Number(academicPeriodId.value)
        );

        const allRolesAdministrative =
          await getAllRolesAdministrativeService.run();
        rolesAdministrative.value = allRolesAdministrative;

        const allRolesAcademic = await getAllRolesAcademicService.run();
        rolesAcademic.value = allRolesAcademic;

        console.log('categories.value', categories.value);
        console.log('data.value', data.value);
        console.log('roles.value', roles.value);
        console.log('usersByRole.value', usersByRole.value);

        await dataRelation(
          categories.value,
          data.value,
          rolesAcademic.value,
          rolesAdministrative.value,
          usersByRole.value
        );
        await dataTable();

        loading.value = false;
      } catch (e) {
        console.log(e);
      }
    });
    const loadInitialData = async () => {
      // Suponiendo que hay una función que carga los roles inicialmente
      const roles = await getAllRolesAcademicService.run();
      dataTableRelation.value.academic.roless = roles.map((role) => ({
        ...role,
        selected: false,
      }));
    };

    const selectLevel = (level) => {
      if (level.name === 'Todos') {
        const newState = !level.selected;
        level.selected = newState;

        dataTableRelation.value.academic.nivelss.forEach((lvl) => {
          lvl.selected = newState;
          lvl.degrees.forEach((grade) => {
            grade.groups.forEach((group) => {
              group.selected = newState;
            });
          });
        });
      } else {
        level.selected = !level.selected;
        level.degrees.forEach((grade) => {
          grade.groups.forEach((group) => {
            group.selected = level.selected;
          });
        });

        const allSelected = dataTableRelation.value.academic.nivelss.every(
          (lvl) => lvl.selected || lvl.name === 'Todos'
        );
        const todosLevel = dataTableRelation.value.academic.nivelss.find(
          (lvl) => lvl.name === 'Todos'
        );
        if (todosLevel) {
          todosLevel.selected = allSelected;
        }
      }

      selectedLevel.value = dataTableRelation.value.academic.nivelss.filter(
        (lvl) => lvl.selected
      );

      updateAllSelected();
      updateFormWithSelectedLevels();
    };

    const updateAllSelected = () => {
      const allGroups = selectedLevel.value.flatMap((nivel) =>
        nivel.degrees.flatMap((grade) => grade.groups.map((group) => group))
      );

      allSelected.value =
        allGroups.length > 0 && allGroups.every((group) => group.selected);
      console.log('Todos los grados seleccionados:', allSelected.value);
    };

    const toggleGrade = (group) => {
      selectedLevel.value.forEach((nivel) => {
        nivel.degrees.forEach((grade) => {
          const foundGroup = grade.groups.find((g) => g.apgId === group.apgId);
          if (foundGroup) {
            foundGroup.selected =
              foundGroup.selected !== undefined ? !foundGroup.selected : true;
          }
        });
      });

      updateAllSelected();
      updateFormWithSelectedLevels();
    };

    const toggleAllGrades = () => {
      allSelected.value = !allSelected.value;

      selectedLevel.value.forEach((nivel) => {
        nivel.degrees.forEach((grade) => {
          grade.groups.forEach((group) => {
            group.selected = allSelected.value;
          });
        });
      });

      updateFormWithSelectedLevels();
    };

    const updateFormWithSelectedLevels = () => {
      form.supervisorApgIds = selectedLevel.value.flatMap((nivel) =>
        nivel.degrees.flatMap((grade) =>
          grade.groups
            .filter((group) => group.selected)
            .map((group) => group.apgId)
        )
      );
      updateFormRoleIds();
      console.log('Form actualizado con niveles seleccionados:', form);
    };

    const selectRolAcademic = (role) => {
      // Verificamos si el role ya tiene el atributo 'selected'
      const existingRole = dataTableRelation.value.academic.roless.find(
        (r) => r.id === role.id
      );

      if (existingRole) {
        if (existingRole.selected === undefined) {
          // Si 'selected' no existe, lo agregamos y lo ponemos en true
          existingRole.selected = true;
        } else {
          // Si ya existe, simplemente hacemos toggle
          existingRole.selected = !existingRole.selected;
        }
      }

      updateFormWithSelectedRolAcademic();

      console.log('existingRole', existingRole);
      console.log(
        'dataTableRelation.value.academic.roless',
        dataTableRelation.value
      );
    };

    const updateFormWithSelectedRolAcademic = () => {
      updateFormRoleIds();
      console.log('Form actualizado con roles académicos seleccionados:', form);
    };

    const selectRole = (role) => {
      role.selected = !role.selected;
      if (role.selected) {
        role.supervisorIds.forEach((user) => {
          user.selected = true;
        });
      } else {
        role.supervisorIds.forEach((user) => {
          user.selected = false;
        });
      }
      updateRolesAndUsers();
      updateAllSelectedRoles();
      updateFormWithSelectedRoles();
    };

    const toggleAllRoles = () => {
      allSelectedRoles.value = !allSelectedRoles.value;
      dataTableRelation.value.administrative.roless.forEach((role) => {
        role.selected = allSelectedRoles.value;
        role.supervisorIds.forEach((user) => {
          user.selected = allSelectedRoles.value;
        });
      });
      updateRolesAndUsers();
      updateFormWithSelectedRoles();
    };

    const toggleAllUsers = () => {
      allSelectedUsers.value = !allSelectedUsers.value;
      usersByRole.value.forEach((user) => {
        user.selected = allSelectedUsers.value;
      });
      updateFormWithSelectedRoles();
    };

    const toggleUser = (user) => {
      user.selected = !user.selected;
      updateAllSelectedUsers();
      updateFormWithSelectedRoles();
    };

    const updateRolesAndUsers = () => {
      usersByRole.value = dataTableRelation.value.administrative.roless
        .filter((role) => role.selected)
        .flatMap((role) => role.supervisorIds);
      updateAllSelectedUsers();
      console.log(
        'Usuarios actualizados según roles seleccionados:',
        usersByRole.value
      );
    };

    const updateAllSelectedRoles = () => {
      const allRolesSelected =
        dataTableRelation.value.administrative.roless.every(
          (role) => role.selected
        );
      allSelectedRoles.value = allRolesSelected;
      console.log(
        'Estado de selección de todos los roles actualizado:',
        allSelectedRoles.value
      );
    };

    const updateAllSelectedUsers = () => {
      allSelectedUsers.value =
        usersByRole.value.length > 0 &&
        usersByRole.value.every((user) => user.selected);
      console.log(
        'Estado de selección de todos los usuarios actualizado:',
        allSelectedUsers.value
      );
    };

    const updateFormWithSelectedRoles = () => {
      form.supervisorUserIds = usersByRole.value
        .filter((user) => user.selected)
        .map((user) => user.id);
      updateFormRoleIds();
      console.log('Form actualizado con roles seleccionados:', form);
    };

    const updateFormRoleIds = () => {
      const academicRoleIds = dataTableRelation.value.academic.roless
        .filter((role) => role.selected)
        .map((role) => role.id);
      const administrativeRoleIds =
        dataTableRelation.value.administrative.roless
          .filter((role) => role.selected)
          .map((role) => role.id);
      form.roleIds = [...academicRoleIds, ...administrativeRoleIds];
    };

    const save = async () => {
      if (!v$.value.$validate()) {
        return; // Asegúrate de que todas las validaciones del formulario pasen
      }
      console.log("Current selectedLevel before saving:", selectedLevel.value);
      console.log("Current usersByRole before saving:", usersByRole.value);

      // Verifica si estás en la categoría administrativa antes de proceder
      if (selectedCategory.value.type === 'administrative') {
        // Obtiene si hay roles seleccionados
        const hasSelectedRoles =
          dataTableRelation.value.administrative.roless.some(
            (role) => role.selected
          );
        // Obtiene si hay usuarios seleccionados bajo roles seleccionados
        const hasSelectedUsers =
          dataTableRelation.value.administrative.roless.some(
            (role) =>
              role.selected && role.supervisorIds.some((user) => user.selected)
          );

        // Si hay roles seleccionados pero no usuarios seleccionados para esos roles, muestra un error y detiene el guardado
        if (hasSelectedRoles && !hasSelectedUsers) {
          levelsAcademic.value = true; // Utiliza esto para mostrar un mensaje de alerta
          console.error(
            'Debe seleccionar al menos un usuario para cada rol seleccionado.'
          );
          return; // Detiene la ejecución si no se cumplen las condiciones
        }
      }

      // Continúa con el guardado si todas las condiciones se cumplen o si no hay roles ni usuarios seleccionados
      try {
        const dataSend = {
          roleIds: form.roleIds,
          supervisorApgIds: form.supervisorApgIds,
          supervisorUserIds: form.supervisorUserIds,
          institutionalActivityId: Number(
            localStorage.getItem('institutionalActivityId')
          ),
        };
        console.log('datasend:', dataSend);
        let response =
          await createOrUpdateViewsInstitutionalActivitiesService.run(dataSend, form.viewsInstitutionalActivityId);
        form.viewsInstitutionalActivityId = response.data.id;

        await saveUpdate();
        // await dataTable();
        loading.value = false;
        levelsAcademic.value = false; // Asegúrate de resetear el estado de la alerta
        console.log("Current selectedLevel after saving:", selectedLevel.value);
  console.log("Current usersByRole after saving:", usersByRole.value);

      } catch (e) {
        console.error(e);
      }
    };

    const saveUpdate = async () => {
      try {
        const dataSend = {
          academicPeriodId: Number(academicPeriodId.value),
          title: form.title,
          startDate: form.startDate,
          endDate: form.endDate,
          responsibleInstitutionalActivityIds:
            form.responsibleInstitutionalActivityIds,

          viewsInstitutionalActivityId: form.viewsInstitutionalActivityId,
        };
        let response = await createOrUpdateInstitutionalActivitiesService.run(
          dataSend,
          Number(localStorage.getItem('institutionalActivityId'))
        );
      } catch (e) {
        console.log(e);
      }
    };

    const selectCategory = async (category: any) => {
      if (!canProceed()) {
        levelsAcademic.value = true;

        return;
      }
      levelsAcademic.value = false;

      selectedCategory.value = category;
      console.log('category', category);
    };

    watch(selectedCategory, async (newCategory, oldCategory) => {
      console.log('nuebbv', newCategory);
      console.log('nuebbv22222', oldCategory);
      if (newCategory.id < oldCategory.id) {
        await goBack();
      } else {
        await goForward();
      }
    });

    const goBack = async () => {
      selectedCategoryIndex.value = Math.max(
        selectedCategoryIndex.value - 1,
        0
      );
      console.log('goBack', categories.value[0]);
      await selectCategory(categories.value[0]);
    };

    const canProceed = () => {
      const hasSelectedRoles = dataTableRelation.value.academic.roless.some(
        (role) => role.selected
      );
      const hasSelectedLevels = dataTableRelation.value.academic.nivelss.some(
        (level) => level.selected
      );
      const hasSelectedGrades = dataTableRelation.value.academic.nivelss.some(
        (level) =>
          level.degrees.some((grade) =>
            grade.groups.some((group) => group.selected)
          )
      );

      // Si no hay nada seleccionado, permite avanzar.
      if (!hasSelectedRoles && !hasSelectedLevels && !hasSelectedGrades) {
        return true;
      }

      // Si hay algo seleccionado, asegúrate de que todos los necesarios estén seleccionados.
      return hasSelectedRoles && hasSelectedLevels && hasSelectedGrades;
    };

    const goForward = async () => {
      if (!canProceed()) {
        levelsAcademic.value = true;

        return;
      }
      levelsAcademic.value = false;

      // Incrementa el índice solo si la validación es exitosa.
      selectedCategoryIndex.value = Math.min(
        selectedCategoryIndex.value + 1,
        categories.value.length - 1
      );

      await selectCategory(categories.value[selectedCategoryIndex.value]);
    };

    const addMoreIDs = async () => {
      if (sessionData.value.length > 0) {
        const uniqueRoleIds = form.roleIds.filter(
          (id) => !sessionData.value[0].roleIds.includes(id)
        );
        sessionData.value[0].roleIds.push(...uniqueRoleIds);

        const uniqueSupervisorApgIds = form.supervisorApgIds.filter(
          (id) => !sessionData.value[0].supervisorApgIds.includes(id)
        );
        sessionData.value[0].supervisorApgIds.push(...uniqueSupervisorApgIds);

        const uniqueSupervisorUserIds = form.supervisorUserIds.filter(
          (id) => !sessionData.value[0].supervisorUserIds.includes(id)
        );
        sessionData.value[0].supervisorUserIds.push(...uniqueSupervisorUserIds);
      }
      console.log('sessionDataddddddddddddd', sessionData.value);
      await save();
    };

    const dataTable = async () => {
      try {
        console.log('dataTableRelation JOSEEE', dataTableRelation.value);
        const response =
          await getViewsInstitutionalActivitiesByInstitutionalActivityService.run(
            Number(localStorage.getItem('institutionalActivityId'))
          );
        console.log('dataTable response', response[0]);

        // Asumimos que el 'response' ya está estructurado correctamente.
        const data = response[0];

        // Procesar roles académicos y administrativos
        processRoles(data.dataTableRelation.academic, 'academic');
        processRoles(data.dataTableRelation.administrative, 'administrative');

        form.viewsInstitutionalActivityId = data.id;
      } catch (e) {
        console.error('Error loading data table:', e);
      }
    };

    const processRoles = (roles, type) => {
      console.log(
        `Procesando roles para tipo: ${type}, roles recibidos:`,
        roles
      );

      roles.forEach((role) => {
        console.log(`Buscando el role con roleId: ${role.roleId} en ${type}`);
        const foundRole = dataTableRelation.value[type].roless.find(
          (r) => r.id === role.roleId
        );

        if (foundRole) {
          console.log(
            `Role encontrado: ${role.roleId}, marcando como seleccionado.`
          );
          foundRole.selected = true; // Marcamos el rol como seleccionado

          if (type === 'academic') {
            console.log(
              'datteee joseess',
              dataTableRelation.value.academic.nivelss.find((l) => l.id)
            );

            role.levelIds.forEach(async (level: any) => {
              console.log(
                `Buscando nivel con id: ${level.id} en roles académicos`
              );
              const foundLevel = dataTableRelation.value[type].nivelss.find(
                (l) => l.id === level.id
              );
              await selectLevel(foundLevel);
              if (foundLevel) {
                console.log(
                  `Nivel encontrado: ${level.id}, marcando como seleccionado`
                );
                foundLevel.selected = true; // Marcamos el nivel como seleccionado

                level.apgIds.forEach((apg) => {
                  console.log(
                    `Buscando APG ID: ${apg.id} en nivel ${level.id}`
                  );
                  console.log(
                    'apg joseess',
                    foundLevel.degrees
                      .flatMap((degree) => degree.groups)
                      .find((g) => g.apgId)
                  );
                  const foundApg = foundLevel.degrees
                    .flatMap((degree) => degree.groups)
                    .find((g) => g.apgId === apg.id);
                  if (foundApg) {
                    console.log(
                      `APG ID encontrado: ${apg.id}, marcando como seleccionado`
                    );
                    foundApg.selected = true;
                    apgActive.value = true;
                  }
                });
              }
            });
          }

          if (type === 'administrative') {
            console.log('hola admi', role.supervisorIds);
            role.supervisorIds.forEach(async (supervisor: any) => {
              console.log(
                `Buscando supervisor con id: ${supervisor.id} en roles administrativos`
              );
              console.log('hola iiiiiddddd user', role.supervisorIds);

              const foundUser = dataTableRelation.value[type].roless
                .flatMap((r) => r.supervisorIds)
                .find((u) => u.id === supervisor.id);
              await selectRole(role);
              if (foundUser) {
                console.log(
                  `Supervisor encontrado: ${supervisor.id}, marcando como seleccionado`
                );
                foundUser.selected = true;
              }
            });
          }
        } else {
          console.log(
            `Role con roleId: ${role.roleId} no encontrado en ${type}`
          );
        }
      });
    };

    // const isSelected = (level: any) => {
    //   return (
    //     Array.isArray(selectedLevel.value) &&
    //     selectedLevel.value.some((lvl) => lvl.id === level.id)
    //   );
    // };

    const dataRelation = async (
      categories,
      data,
      rolesAcademic,
      rolesAdministrative
    ) => {
      // Mapear todas las categorías
      for (const category of categories) {
        if (category.type === 'academic') {
          // Obtener grados para cada nivel académico
          data.forEach((level) => {
            const levelInfo = {
              id: level.id,
              name: level.name,
              abbreviation: level.abbreviation,
              selected: false,
              degrees: level.degrees.map((degree) => ({
                id: degree.id,
                name: degree.name,
                abbreviation: degree.abbreviation,
                levelId: level.id,
                selected: false,

                groups: degree.groups.map((group) => ({
                  id: group.id,
                  name: group.name,
                  abbreviation: group.abbreviation,
                  apgId: group.apgId,
                  selected: false,
                })),
              })),
            };
            dataTableRelation.value.academic.nivelss.push(levelInfo);
          });

          // Añadir roles académicos si existen
          // const rolesInfo = rolesAcademic.map((rol) => ({
          //   id: rol.id,
          //   name: rol.name,
          // }));
          // dataTableRelation.value.academic.roless.push(...rolesInfo);
        }

        if (category.type === 'administrative') {
          // Mapear la estructura administrativa
          for (const role of rolesAdministrative) {
            console.log('rolerolerolerole', role);

            // Cargar usuarios por cada rol administrativo de forma asincrónica
            loading.value = true;
            const users = await getUserByRoleService.run(role.id);
            loading.value = false;

            const adminInfo = {
              id: role.id,
              name: role.name,
              selected: false,
              supervisorIds: users.map((user) => ({
                id: user.id,
                names: user.names,
                selected: false,
              })),
            };
            dataTableRelation.value.administrative.roless.push(adminInfo);
          }
        }
      }

      console.log('dataTableRelation', dataTableRelation.value);
      return dataTableRelation;
    };

    return {
      // v$,
      save,
      categories,
      selectedCategory,
      selectedLevel,
      selectCategory,
      selectLevel,
      data,
      roles,
      usersByRole,
      // form,
      allSelected,
      allSelectedLevelsCondition,
      allSelectedRolesCondition,
      validateRol,
      loading,
      // saveUpdate,
      validateApgIds,
      selectRole,
      selectedRole,
      allSelectedUsers,
      goBack,
      goForward,
      selectedCategoryIndex,
      addMoreIDs,
      // isSelected,
      dataTableRelation,
      selectRolAcademic,
      toggleAllGrades,
      toggleGrade,
      allSelectedRoles,
      toggleAllRoles,
      toggleAllUsers,
      toggleUser,
      updateAllSelectedUsers,
      apgActive,
      levelsAcademic,
      administrativeSelect,
    };
  },
});
</script>

<style scoped>
.selection {
  display: flex;
  gap: 20px;
  height: 100%;
}
.category-list {
  border-right: 1px solid #dee2e6;
  padding-right: 20px;
}
.category-list button {
  display: block;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 10px;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  background: white;
  transition: all 0.3s;
}

.category-list button.selected-button {
  font-weight: bold;
  border-right: 5px solid var(--color-primary);
  color: var(--color-primary);
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  cursor: pointer;
  padding: 10px;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  margin-bottom: 5px;
  transition: all 0.3s;
}

li.selected-button {
  font-weight: bold;
  border-right: 5px solid var(--color-primary);
  color: var(--color-primary);
}

table thead tr th {
  color: black;
  font-size: 14px;
  padding: 0.5rem;
  white-space: nowrap;
  word-wrap: break-word;
  text-align: center;
}

table thead tr {
  background-color: #e4e4e4;
}

table tbody tr td {
  font-size: 14px;
  text-align: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eedd;
}
</style>
