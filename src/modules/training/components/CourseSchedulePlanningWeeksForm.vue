<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'training.courseSchedulePlanningWeeks' }"></AppButtonBack>

      <AppButton style="color: white;" :disabled="!planningWeekWithDetail" :label="planningWeekWithDetail?.isApproved ? 'Desaprobar Planeación' : 'Aprobar Planeación'" @click="ApproveDisapprovePlanning"></AppButton>
    </template>

    <template #content>
      <div>
        <section
          v-bind:class="{
            disabled: planningWeekWithDetail?.isApproved ? true : false,
          }"
        >
          <form @submit.prevent="save()">
            <div class="form-row">
              <AppFormField :form-control="v$.form.range" label="Rango" class="col-3" :disabled="planningWeekWithDetail?.isApproved">
                <div class="d-flex gap-1 text-capitalize">
                  <span
                    v-bind:class="{
                      'bg-primary text-white': v$.form.range.$model == 'day',
                    }"
                    class="ps-2 pe-2 pointer border border-primary rounded-pill text-primary"
                    @click="v$.form.range.$model = 'day'"
                  >
                    {{ t('core.time.day') }}
                  </span>

                  <span
                    v-bind:class="{
                      'bg-primary text-white': v$.form.range.$model == 'week',
                    }"
                    class="ps-2 pe-2 pointer border border-primary rounded-pill text-primary"
                    @click="v$.form.range.$model = 'week'"
                  >
                    {{ t('core.time.week') }}
                  </span>

                  <span
                    v-bind:class="{
                      'bg-primary text-white': v$.form.range.$model == 'month',
                    }"
                    class="ps-2 pe-2 pointer border border-primary rounded-pill text-primary"
                    @click="v$.form.range.$model = 'month'"
                  >
                    {{ t('core.time.month') }}
                  </span>
                </div>
              </AppFormField>

              <AppFormField :form-control="v$.form.starDate" :label="'Inicia'">
                <input id="startDate" type="date" class="form-control" v-model="v$.form.starDate.$model" :disabled="planningWeekWithDetail?.isApproved ? true : false" />
              </AppFormField>

              <AppFormField :form-control="v$.form.endDate" :label="'Termina'">
                <input id="endDate" type="date" class="form-control" v-model="v$.form.endDate.$model" :disabled="planningWeekWithDetail?.isApproved ? true : false" />
              </AppFormField>
            </div>

            <AppFormField :form-control="v$.form.title" :label="'Descripción'">
              <input id="title" type="text" class="form-control" v-model="v$.form.title.$model" :disabled="planningWeekWithDetail?.isApproved ? true : false" />
            </AppFormField>

            <div class="d-flex justify-content-end">
              <AppCheckPermission :permission="!planningWeekWithDetail ? 'classroom.planningWeeks.create' : 'classroom.planningWeeks.edit'">
                <AppButton :disabled="planningWeekWithDetail?.isApproved ? true : false" :label="!planningWeekWithDetail ? 'Continuar' : 'core.save'"></AppButton>
              </AppCheckPermission>
            </div>
          </form>
        </section>
      </div>

      <AppCard v-if="planningWeekWithDetail">
        <template #body>
          <section>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="m-0">Competencias y Temática</h5>

              <AppCheckPermission permission="classroom.planningWeeks.edit">
                <AppButton
                  v-bind:class="{
                    disabled: planningWeekWithDetail?.isApproved ? true : false,
                  }"
                  :label="'Agregar Competencia'"
                  :to="{
                    name: 'administration.homeTeacher.competencies.create',
                    params: {
                      academicPeriodGroupId: 0,
                      courseId: route.params.courseId,
                      curriculumSubjectId: curriculumSubjectId,
                    },
                    query: {
                      planningWeekId: planningWeekWithDetail.id,
                      aplication: 'AcademyAdvanced',
                    },
                  }"
                ></AppButton>
              </AppCheckPermission>
            </div>

            <AppEmptyResponse v-if="!competencies.length"></AppEmptyResponse>

            <template v-for="(item, index) in competencies" :key="index">
              <div
                v-bind:class="{
                  'border-bottom': index != competencies.length - 1,
                }"
                class="d-flex justify-content-between align-items-center p-1"
              >
                <div
                  v-bind:class="{
                    disabled: planningWeekWithDetail?.isApproved ? true : false,
                  }"
                  class="d-flex align-items-center gap-2"
                >
                  <AppIcon class="text-primary pointer" style="font-size: 1rem" icon="pencil-alt" v-tooltip="'Editar'" @click="editCompetence(item.id)"></AppIcon>

                  <p class="m-0">{{ item.description }}</p>
                </div>

                <span class="badge rounded-pill text-bg-primary bg-primary"> {{ item.numberTopics }} Temas </span>
              </div>
            </template>

            <hr />
          </section>

          <section>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="m-0">Sesiones de Clases</h5>

              <AppCheckPermission permission="classroom.planningWeeks.edit">
                <AppButton
                  v-bind:class="{
                    disabled: planningWeekWithDetail?.isApproved ? true : false,
                  }"
                  :label="'Agregar Clase'"
                  :to="{
                    name: 'administration.homeTeacher.attendance.create',
                    params: { courseId: route.params.courseId },
                    query: {
                      planningWeekId: planningWeekWithDetail.id,
                      aplication: 'AcademyAdvanced',
                    },
                  }"
                ></AppButton>
              </AppCheckPermission>
            </div>

            <AppEmptyResponse v-if="!sessions.length"></AppEmptyResponse>

            <template v-for="(item, index) in sessions" :key="index">
              <div v-bind:class="{ 'border-bottom': index != sessions.length - 1 }" class="d-flex align-items-center p-1 gap-2">
                <AppIcon
                  v-bind:class="{
                    disabled: planningWeekWithDetail?.isApproved ? true : false,
                  }"
                  class="text-primary pointer"
                  style="font-size: 1rem"
                  icon="pencil-alt"
                  v-tooltip="'Editar'"
                  @click="editSession(item.id)"
                ></AppIcon>

                <div class="d-flex align-items-end gap-1">
                  <span class="text-decoration-underline text-secondary">{{ item.dateName }}</span>
                  <span style="font-weight: 500">Tema: </span>
                  <span v-if="item.topicName">{{ item.topicName }}</span>
                  <span v-else class="text-muted" style="font-size: 0.9rem">(Sin tema)</span>
                </div>
              </div>
            </template>

            <hr />
          </section>

          <section>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="m-0">Actividades</h5>

              <AppCheckPermission permission="classroom.planningWeeks.edit">
                <AppButton
                  v-bind:class="{
                    disabled: planningWeekWithDetail?.isApproved ? true : false,
                  }"
                  :label="'Agregar Actividad'"
                  :to="{
                    name: 'administration.homeTeacher.activities.create',
                    params: { courseId: route.params.courseId },
                    query: {
                      planningWeekId: planningWeekWithDetail.id,
                      aplication: 'AcademyAdvanced',
                    },
                  }"
                ></AppButton>
              </AppCheckPermission>
            </div>

            <AppEmptyResponse v-if="!activities.length"></AppEmptyResponse>

            <template v-for="(item, index) in activities" :key="index">
              <div
                class="d-flex justify-content-between align-items-center p-1"
                v-bind:class="{
                  'border-bottom': index != activities.length - 1,
                }"
              >
                <div
                  v-bind:class="{
                    disabled: planningWeekWithDetail?.isApproved ? true : false,
                  }"
                  class="d-flex align-items-center gap-2"
                >
                  <AppIcon class="text-primary pointer" style="font-size: 1rem" icon="pencil-alt" v-tooltip="'Editar'" @click="editActivity(item.id)"></AppIcon>

                  <p class="m-0">
                    {{ item.name }}
                    <span class="text-decoration-underline text-secondary text-capitalize">
                      {{ dayjs(item.dateSince).format('D MMM') }} -
                      {{ dayjs(item.dateUntil).format('D MMM') }}
                    </span>
                  </p>
                </div>

                <div>
                  <span v-if="item.isPublish" class="badge rounded-pill text-bg-primary bg-primary"> Publicado </span>

                  <span v-else style="font-weight: 400" class="badge rounded-pill text-primary border border-primary"> No Publicado </span>
                </div>
              </div>
            </template>

            <hr v-if="isBudget" />
          </section>

          <section v-if="isBudget">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="m-0">Presupuesto</h5>

              <AppButton
                v-bind:class="{
                  disabled: planningWeekWithDetail?.isApproved ? true : false,
                }"
                @click="openBudgetFormModal(null)"
                :label="'Agregar Presupuesto'"
              ></AppButton>
            </div>

            <AppEmptyResponse v-if="!budgets.length"></AppEmptyResponse>

            <template v-else>
              <table class="table mt-2">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th class="text-center">Concepto</th>
                    <th class="text-center">Detalle</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-center">V.Unitario</th>
                    <th class="text-center">Subtotal</th>
                    <th class="text-center">Opciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(item, index) in budgets" :key="index">
                    <td>{{ item.dates }}</td>
                    <td class="text-center">{{ item.concept }}</td>
                    <td class="text-center">{{ item.detail }}</td>
                    <td class="text-center">{{ item.amount }}</td>
                    <td class="text-center">
                      {{ n(item.unitValue, 'currency') }}
                    </td>
                    <td class="text-center">
                      {{ n(item.subTotal, 'currency') }}
                    </td>

                    <td class="d-flex justify-content-center">
                      <AppButtonGroup
                        v-bind:class="{
                          disabled: planningWeekWithDetail?.isApproved ? true : false,
                        }"
                      >
                        <AppButtonEdit @click="openBudgetFormModal(item)"></AppButtonEdit>
                        <AppButtonDelete @click="openConfirmDelete(item)"></AppButtonDelete>
                      </AppButtonGroup>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="text-end">
                <h4>Gran total: {{ n(totalBudget, 'currency') }}</h4>
              </div>
            </template>
          </section>

          <AppChat v-if="!loadingComments" :row-table="'PlanningWeeks'" :comments-res="comments.value" :row-id="planningWeekWithDetail.id" @new-comment="updateComments"></AppChat>
        </template>
      </AppCard>

      <AppModal v-model="budgetFormModal" :size="'lg'">
        <CourseSchedulePWFormBudgetForm
          v-if="budgetFormModal && planningWeekWithDetail"
          :data="currentBudget"
          :planningWeekId="planningWeekWithDetail.id"
          @close="closeBudgetFormModal"
        ></CourseSchedulePWFormBudgetForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Presupuesto" @confirmDelete="confirmDelete()"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppChat from '../../../shared/components/AppChat.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import CourseSchedulePWFormBudgetForm from './CourseSchedulePWFormBudgetForm.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { ICreateOrUpdatePlanningWeeksService } from '../../administration/services/createOrUpdatePlanningWeeks.service';

import { GetPlanningWeeksByCourseIdService } from '../services/getPlanningWeeksByCourseId.service';
import { DeletePlanningWeekBudgetsByIdService } from '../services/deletePlanningWeekBudgetsById.service';
import { CreateOrUpdatePlanningWeeksService } from '../../administration/services/createOrUpdatePlanningWeeks.service';
import { GetPlanningWeeksWithDetailsService } from '../../administration/services/getPlanningWeeksWithDetails.service';
import { ApproveOrDisapprovePlanningService } from '../../administration/services/approveOrDisapprovePlanning.service';

const deletePlanningWeekBudgetsByIdService = new DeletePlanningWeekBudgetsByIdService();
const approveOrDisapprovePlanningService = new ApproveOrDisapprovePlanningService();
const getPlanningWeeksWithDetailsService = new GetPlanningWeeksWithDetailsService();
const createOrUpdatePlanningWeeksService = new CreateOrUpdatePlanningWeeksService();
const getPlanningWeeksByCourseIdService = new GetPlanningWeeksByCourseIdService();

export default defineComponent({
  name: 'CourseSchedulePlanningWeeksForm',
  components: {
    CourseSchedulePWFormBudgetForm,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    AppIcon,
    AppChat,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array,
      required: true,
    },
    relatedData: {
      type: Object,
      required: true,
    },
    planningWeekWithDetail: {
      type: Object,
      default: null,
    },
  },

  setup(props) {
    const { t, n } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const budgets: Ref<any[]> = ref(props.planningWeekWithDetail?.tablePlanningWeekBudgets ?? []);
    const competencies: Ref<any[]> = ref(props.planningWeekWithDetail?.competencies ?? []);
    const activities: Ref<any[]> = ref(props.planningWeekWithDetail?.activities ?? []);
    const sessions: Ref<any[]> = ref(props.planningWeekWithDetail?.sessions ?? []);
    const currentBudget: Ref<any> = ref(null);

    const courseId = parseInt(route.params.courseId as string, 10);
    const curriculumSubjectId = ref();

    const comments: { value: any[] } = reactive({
      value: [],
    });

    const loadingComments = ref(false);
    const budgetFormModal = ref(false);
    const modalDelete = ref(false);
    const isBudget = ref(false);
    const loading = ref(true);

    const form = reactive({
      courseId: props.planningWeekWithDetail?.courseId ?? courseId,
      title: props.planningWeekWithDetail?.title ?? '',
      starDate: props.planningWeekWithDetail?.starDate ?? '',
      endDate: props.planningWeekWithDetail?.endDate ?? '',
      range: props.planningWeekWithDetail?.range ?? ('week' as 'day' | 'week' | 'month'),
    });
    const v$ = useVuelidate(
      {
        form: {
          courseId: { required },
          title: { required },
          starDate: { required },
          endDate: { required },
          range: { required },
        },
      },
      { form }
    );

    const totalBudget = computed(() => {
      let total = 0;

      if (budgets.value.length) budgets.value.forEach((item) => (total += item.subTotal));

      return total;
    });

    onMounted(async () => {
      try {
        const course = await getPlanningWeeksByCourseIdService.run(courseId);

        curriculumSubjectId.value = course.curriculumSubjectId;
        isBudget.value = !!course.isBudget;

        if (!props.planningWeekWithDetail) {
          calculateDate();
        } else {
          await updateComments();
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    watch(
      () => form.range,
      () => {
        calculateDate();
      }
    );

    const calculateDate = () => {
      const currentDate = dayjs();

      let starDate;
      let endDate;

      if (form.range == 'day') {
        starDate = currentDate.clone();
        endDate = currentDate.clone();
      }

      if (form.range == 'week') {
        starDate = currentDate.clone().startOf('isoWeek').subtract(1, 'day');
        endDate = currentDate.clone().endOf('isoWeek').subtract(2, 'day');

        form.title = `${t('core.time.week')} ${currentDate.isoWeek()}`;
      }

      if (form.range == 'month') {
        starDate = currentDate.clone().startOf('month');
        endDate = currentDate.clone().endOf('month').subtract(1, 'day');

        form.title = `${t('core.time.month')} ${currentDate.month() + 1}`;
      }

      if (starDate && endDate) {
        form.title = form.title.replace(/^\w/, (c: any) => c.toUpperCase());
        form.starDate = starDate.toISOString().split('T')[0];
        form.endDate = endDate.toISOString().split('T')[0];
      }
    };

    const editCompetence = async (competenceId: number) => {
      await router.push({
        name: 'administration.homeTeacher.competencies.edit',
        params: {
          courseId: courseId,
          academicPeriodGroupId: 0,
          curriculumSubjectId: curriculumSubjectId.value,
          competenceId: competenceId,
        },
        query: {
          planningWeekId: parseInt(route.params.planningWeekId as string, 10),
          aplication: 'AcademyAdvanced',
        },
      });
    };
    const editSession = async (sessionId: number) => {
      await router.push({
        name: 'administration.homeTeacher.attendance.edit',
        params: {
          courseId: courseId,
          sessionId: sessionId,
        },
        query: {
          planningWeekId: parseInt(route.params.planningWeekId as string, 10),
          aplication: 'AcademyAdvanced',
        },
      });
    };
    const editActivity = async (activityId: number) => {
      await router.push({
        name: 'administration.homeTeacher.activities.edit',
        params: {
          courseId: courseId,
          activityId: activityId,
        },
        query: {
          planningWeekId: parseInt(route.params.planningWeekId as string, 10),
          aplication: 'AcademyAdvanced',
        },
      });
    };

    const updateComments = async () => {
      loadingComments.value = true;

      const response = await getPlanningWeeksWithDetailsService.run(parseInt(route.params.planningWeekId as string, 10));
      comments.value = response.comments;

      loadingComments.value = false;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataSend: ICreateOrUpdatePlanningWeeksService = {
        courseId: form.courseId,
        title: form.title ?? '',
        starDate: form.starDate ?? '',
        endDate: form.endDate ?? '',
        range: form.range,
      };

      try {
        const response = await createOrUpdatePlanningWeeksService.run(dataSend, props.planningWeekWithDetail?.id);

        if (!props.planningWeekWithDetail) {
          await router.push({
            name: 'training.courseSchedulePlanningWeeksEdit',
            params: {
              courseId: courseId,
              planningWeekId: response.data.id,
            },
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    const ApproveDisapprovePlanning = async () => {
      if (props.planningWeekWithDetail?.id) {
        await approveOrDisapprovePlanningService.run(props.planningWeekWithDetail.id);

        await router.push({
          name: 'training.courseSchedulePlanningWeeks',
          params: { courseId: courseId },
        });
      }
    };

    const openBudgetFormModal = (budget: any) => {
      currentBudget.value = budget;
      budgetFormModal.value = true;
    };
    const closeBudgetFormModal = async () => {
      budgetFormModal.value = false;

      const response = await getPlanningWeeksWithDetailsService.run(parseInt(route.params.planningWeekId as string, 10));
      budgets.value = response.tablePlanningWeekBudgets;
    };

    const openConfirmDelete = async (budget: any) => {
      currentBudget.value = budget;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentBudget.value) await deletePlanningWeekBudgetsByIdService.run(currentBudget.value.id);

      currentBudget.value = null;
      modalDelete.value = false;

      const response = await getPlanningWeeksWithDetailsService.run(parseInt(route.params.planningWeekId as string, 10));
      budgets.value = response.tablePlanningWeekBudgets;
    };

    return {
      isBudget,
      loading,
      route,
      v$,
      t,
      n,

      curriculumSubjectId,
      loadingComments,
      budgetFormModal,
      currentBudget,
      competencies,
      modalDelete,
      totalBudget,
      activities,
      sessions,
      comments,
      budgets,

      ApproveDisapprovePlanning,
      closeBudgetFormModal,
      openBudgetFormModal,
      openConfirmDelete,
      updateComments,
      editCompetence,
      confirmDelete,
      editActivity,
      editSession,
      save,

      dayjs,
    };
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}

.disabled {
  pointer-events: none;
}
</style>
