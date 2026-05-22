<template>

  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <template v-if="academicPeriods.length">
        <AppCheckPermission permission="events.institutionalTimeline.create">

        <AppButton
          style="color: white;"
          label="Agregar actividad"
          :to="{
            name: 'institutionalEvents.institutionalTimelineCreate',
            query: { academicPeriodId },
          }"
        ></AppButton>
</AppCheckPermission>
      </template>
    </template>

    <template v-slot:content>
  <AppLoading v-if="loading"></AppLoading>

      <AppEmptyResponse v-else-if="!academicPeriods.length" :show-image="true" title="Sin periodos configurados" :subtitle="false"></AppEmptyResponse>

      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="academicPeriodId" :filter-name="'institutionalTimeline.academicPeriodId'" @isNotInitialized="notFilterAcademicPeriodId">
              <label>Año escolar</label>
              <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" :clearable="false" class="bg-white"></AppAutocomplete>
            </AppFilter>
          </div>
        </div>

        <AppLoading v-if="loadingInstitutionalActivities"></AppLoading>

        <template v-else>
          <AppEmptyResponse v-if="!institutionalActivities.length" :show-image="true" :subtitle="false"></AppEmptyResponse>

          <template v-else>
            <div class="box">
              <ul id="first-list">
                <template v-for="(item, index) in institutionalActivities" :key="index">
                  <li>
                    <span></span>
                    <div>
                      <div class="d-flex justify-content-end">
                        <span class="badge rounded-pill text-bg-primary bg-primary">Tareas: {{ item.numberTasks }}</span>
                      </div>

                      <div class="d-flex align-items-center mb-3">
                        <!-- <AppAvatar :size="'sm'" :name="item.nameSupervisor"></AppAvatar> -->

                        <div class="ms-2">
                          <h5 class="m-0">{{ item.title }}</h5>
                          <!-- <p class="m-0">{{ item.supervisorViews[0] }}</p> -->
                        </div>
                      </div>

                      <p>{{ item.objective }}</p>

                      <div class="d-flex justify-content-between">
                        <div></div>

                        <AppButtonGroup>
                          <AppCheckPermission permission="events.institutionalTimeline.edit">

                          <AppButtonEdit
                            :to="{
                              name: 'institutionalEvents.institutionalTimelineEdit',
                              params: { institutionalActivityId: item.id },
                              query: { academicPeriodId },
                            }"
                          ></AppButtonEdit>
                            </AppCheckPermission> 
                          <AppButton
                            :to="{
                              name: 'institutionalEvents.institutionalTimelineActivitySummary',
                              params: { institutionalActivityId: item.id },
                            }"
                            v-tooltip="'Resumen de actividad institucional'"
                            icon="tasks"
                            outlined
                          ></AppButton>
                          <div @click="handleNewComment(item.id)">
                            <AppButtonChat
                              :number-comments="`${item.numberCommentsNews == 0 ? '' : item.numberCommentsNews}`"
                              :comments="comments.value[`institutionalActivities_${item.id}`]"
                              :row-table="'InstitutionalActivities'"
                              :row-id="item.id"
                              @new-comment="updateComments(item.id)"
                            ></AppButtonChat>
                          </div>
                        </AppButtonGroup>
                      </div>
                    </div>

                    <div class="time">
                      <span>{{ item.startDate }}</span>
                      <span></span>
                    </div>
                  </li>
                </template>
              </ul>
            </div>
          </template>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, Ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonChat from '../../../shared/components/Buttons/AppButtonChat.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetAcademicPeriodsService } from '../../administration/services/getAcademicPeriods.service';
import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';

import { GetSummaryInstitutionalActivityService } from '../services/getSummaryInstitutionalActivity.service';
import { GetInstitutionalActivitiesByAcaPerIdService } from '../services/getInstitutionalActivitiesByAcaPerId.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

const getInstitutionalActivitiesByAcaPerIdService = new GetInstitutionalActivitiesByAcaPerIdService();
const getSummaryInstitutionalActivityService = new GetSummaryInstitutionalActivityService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();

export default defineComponent({
  name: 'InstitutionalTimeline',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonGroup,
    AppButtonEdit,
    AppButtonChat,
    AppBaseList,
    AppLoading,
    AppButton,
    AppFilter,
    AppCheckPermission
  },

  setup() {
    const { t } = useI18n();
    const title = 'Cronograma institucional';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const institutionalActivities: Ref<any[]> = ref([]);
      const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);

    const academicPeriodId = ref();
    const activeAcademicPeriods = ref([]);


    const loadingInstitutionalActivities = ref(false);
    const loadingComments = ref(false);
    const loading = ref(true);

    const comments: { value: any } = reactive({
      value: {},
    });

    const currentActivityId = ref<number | null>(null);


    onMounted(async () => {

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Eventos', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      const allAcademicPeriods: any = await getAcademicPeriodsService.run();
      activeAcademicPeriods.value = allAcademicPeriods.filter((period: any) => period.active === 1);

      if (activeAcademicPeriods.value.length > 0) {
        academicPeriodId.value = activeAcademicPeriods.value[0].id;
      }

      loading.value = false;
    
    });

    const notFilterAcademicPeriodId = () => {
      if (academicPeriods.value.length) {
        academicPeriods.value = activeAcademicPeriods.value[0].id;
      }
    };

    watch(academicPeriodId, async () => {
      await getInstitutionalActivities();
    });


    const getInstitutionalActivities = async () => {
      loadingInstitutionalActivities.value = true;

      institutionalActivities.value = await getInstitutionalActivitiesByAcaPerIdService.run(academicPeriodId.value);

      console.log('Institutional activities:', institutionalActivities.value);

      loadingInstitutionalActivities.value = false;
    };

    const prepareComments = async (activityId: number) => {
      loadingComments.value = true;
      console.log('prepareComments called for activity', activityId);
      try {
        const response = await getSummaryInstitutionalActivityService.run(activityId);
        comments.value[`institutionalActivities_${activityId}`] = response.comments;
        console.log(`Comments for activity ${activityId}:`, response.comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
      loadingComments.value = false;
    };

    const handleNewComment = async (activityId: number) => {
      console.log('handleNewComment called for activity', activityId);
      await prepareComments(activityId);
      currentActivityId.value = activityId;
    };

    const updateComments = async (activityId: number) => {
      console.log('updateComments called for activity', activityId);
      await prepareComments(activityId);
      await getInstitutionalActivities();
    };

    return {
      
      loading,
      routes,
      title,

      loadingInstitutionalActivities,
      institutionalActivities,
      loadingComments,
      academicPeriodId,
      comments,
      prepareComments,
      handleNewComment,
      updateComments,
      notFilterAcademicPeriodId,
      currentActivityId,
      academicPeriods: activeAcademicPeriods,
    };
  },
});
</script>

<style scoped>
.box {
  padding: 0px 0 40px 70px;
}

.box ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  position: relative;
  top: 0;
}

.box ul:last-of-type {
  top: 0px;
}

.box ul:before {
  content: '';
  display: block;
  width: 0;
  height: 100%;
  border: 1px dashed #00b0da;
  position: absolute;
  top: 0;
  left: 30px;
}

.box ul li {
  margin: 20px 60px 60px;
  position: relative;
  padding: 10px 20px;
  background: #fff;
  color: #111;
  border-radius: 10px;
  line-height: 20px;
  width: 95%;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.2);
}

.box ul li > span {
  content: '';
  display: block;
  width: 0;
  height: 100%;
  border: 1px solid #00b0da;
  position: absolute;
  top: 0;
  left: -30px;
}

.box ul li > span:before,
.box ul li > span:after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0f6fc5;
  border: 2px solid #0f6fc5;
  position: absolute;
  left: -5px;
}

.box ul li > span:before {
  top: -10px;
}
.box ul li > span:after {
  top: 95%;
}

.box .title {
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 5px;
}

.box .info:first-letter {
  text-transform: capitalize;
  line-height: 6;
}

.box .name {
  margin-top: 10px;
  text-transform: capitalize;
  font-style: italic;
  text-align: right;
  margin-right: 20px;
}

.box .time span {
  position: absolute;
  left: -110px;
  color: #111;
  font-size: 80%;
  font-weight: bold;
}
.box .time span:first-child {
  top: -16px;
}
.box .time span:last-child {
  top: 94%;
}
</style>
