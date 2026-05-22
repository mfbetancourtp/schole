<template>
  <AppBaseList :title="title">
    <template v-slot:content>
      <SelectTutorStudents @have-parents="haveParents" @update-user-id="updateUserId"></SelectTutorStudents>

      <AppLoading v-if="loading"></AppLoading>

      <ProfileFull v-else class="mt-3" :user-id="userId"></ProfileFull>
      <!-- 
        <div v-else>
          <AppLoading v-if="loading || !route.query.convocationId"></AppLoading>

          <div v-else class="mt-2">
            <o-steps v-model="stepIndex" :animated="true" :rounded="true" :has-navigation="false" :label-position="'bottom'">
              <o-step-item v-for="(detail, index) in data.detail" :key="index + 1" :label="detail.title" :step="index + 1" :clickable="true">
                <h1 class="title has-text-centered">{{ detail.title }}</h1>

                <MatrixForm
                  v-if="detail.questions && detail.isMatriz"
                  :step-index="stepIndex"
                  :section-id="detail.id"
                  :data-profile="data"
                  :object-form="objectForm['sectionId_' + detail.id]"
                  :response-object="customFormAnswers['sectionId_' + detail.id]"
                  @update-step="updateStep"
                ></MatrixForm>

                <CustomFormInput
                  v-if="detail.questions && !detail.isMatriz"
                  :step-index="stepIndex"
                  :survey-id="detail.surveyId"
                  :questions="detail.questions"
                  :get-procedure="detail.getProcedure"
                  :save-procedure="detail.saveProcedure"
                  :section-id="detail.id"
                  :object-form="objectForm['sectionId_' + detail.id]"
                  :response-object="customFormAnswers['sectionId_' + detail.id]"
                  @update-step="updateStep"
                ></CustomFormInput>
              </o-step-item>
            </o-steps>
          </div>
        </div>
        -->
    </template>
  </AppBaseList>
</template>

<script lang="ts">
//import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { takeUntil } from 'rxjs/operators';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { Subject } from 'rxjs';

//import MatrixForm from '../../surveys/components/MatrixForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
//import CustomFormInput from '../../surveys/components/CustomFormInput.vue';

import SelectTutorStudents from '../components/SelectTutorStudents.vue';
import ProfileFull from '../../access/pages/ProfileFull.vue';

import { GetProfileService } from '../../casurid/services/getProfile.service';
import { GetPeopleProfileService } from '../services/getPeopleProfile.service';
import { SetCurrentStudentParentService } from '../services/setCurrentStudentParent.service';
import { useHeaderStore } from '../../../stores/header.store';

const setCurrentStudentParentService = new SetCurrentStudentParentService();
const getPeopleProfileService = new GetPeopleProfileService();
const getProfileService = new GetProfileService();

export default defineComponent({
  name: 'StudentsByParents',
  components: {
    SelectTutorStudents,
    //CustomFormInput,
    AppBaseList,
    AppLoading,
    //MatrixForm,
    ProfileFull,
  },

  setup() {
    const _unsubscribeAll: Subject<any> = new Subject<any>();
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    const title = t('core.generalTerms.academic.student.plural');
    const routes = [{ name: title }];
    useMeta({ title: title });

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Salón de clases', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const isConvocation = ref(false);
    const loading = ref(true);
    const userId = ref();
    const data: Ref<any> = ref();

    const customFormAnswers: any = reactive({});
    const objectForm: any = reactive({});
    const stepIndex = ref(1);

    const getData = async () => {
      loading.value = true;

      try {
        if (userId.value) {
          let res: any = await getPeopleProfileService.run(userId.value);
          isConvocation.value = res.isConvocation;
          console.log(userId.value);
          if (isConvocation.value) {
            let roleId = localStorage.getItem('roleId');
            data.value = res;

            data.value.detail.forEach((detail: any) => {
              detail.questions.forEach((question: any) => {
                question.blockQuestion = question.rolesIdsBlocked && question.rolesIdsBlocked.split(',').includes(roleId) ? true : false;
              });
            });
            console.log(data);
            const query: any = {
              convocationId: data.value.lastEnroll.convocationId,
              convocationEnrollId: data.value.lastEnroll.convocationEnrolId,
              stepId: data.value.lastEnroll.id,
            };

            router.push({ query });

            //await loadForm();
            //await loadResponseObjectForm();
          } else {
            router.push({});
          }
        }
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    };

    const updateUserId = async () => {
      userId.value = setCurrentStudentParentService.get();

      if (userId.value) {
        await getData();
      }
    };

    const haveParents = async (e: any) => {
      if (!e) {
        let data: any = await getProfileService.run();

        if (data.user?.id) {
          userId.value = data.user.id;

          await getData();
        }
      } else {
        setCurrentStudentParentService.userId$.pipe(takeUntil(_unsubscribeAll)).subscribe(async (value) => {
          userId.value = value;
          await getData();
        });

        // código temporal
        if (!userId.value) {
          userId.value = setCurrentStudentParentService.get();
          await getData();
        }
      }
    };
    /*
    // funciones para formularios personalizados
    const loadForm = async () => {
      let sectionForm: any = {};
      let sectionData: any = {};
      let sectionKey = '';
      let formKey = '';
      let selected: any[] = [];

      data.value.detail.forEach((detail: any) => {
        sectionKey = 'sectionId_' + detail.id;

        if (detail.questions) {
          detail.questions.forEach((question: any) => {
            formKey = 'question_' + question.id;

            if (question.answerOptions.length) {
              question.answerOptions.forEach((answer: any) => {
                if (answer.selected) {
                  selected.push(answer.id);
                }
              });

              sectionForm[formKey] = question.questionTypeId == 3 ? selected[0] : selected;

              selected = [];
            } else {
              if (question.typeData == 'falso_verdadero') {
                sectionForm[formKey] = question.rowId == 1 ? true : false;
              } else {
                sectionForm[formKey] = question.rowId ? question.rowId : question.answer ?? null;
              }
            }

            sectionData[formKey] = question.required ? { required } : {};
          });
        }

        objectForm[sectionKey] = {
          form: sectionForm,
          v$: sectionData,
        };

        sectionForm = {};
        sectionData = {};
      });
    };

    const loadResponseObjectForm = () => {
      data.value.detail.forEach((detail: any) => {
        let sectionKey = 'sectionId_' + detail.id;

        if (detail.questions) {
          customFormAnswers[sectionKey] = [];
          let questions: any[] = [];

          detail.questions.forEach((question: any) => {
            questions.push({
              id: question.id,
              questionTypeId: question.questionTypeId,
              answerOptions: question.answerOptions,
              fieldName: question.fieldName,
              answer: question.answer,
            });
          });

          customFormAnswers[sectionKey] = questions;
          questions = [];
        }
      });
    };

    const updateStep = async (value: boolean) => {
      if (value && stepIndex.value == data.value?.detail.length) {
        stepIndex.value = 0;
      }

      stepIndex.value = value ? stepIndex.value + 1 : stepIndex.value - 1;
    };
    */
    return {
      loading,
      routes,
      title,
      t,

      customFormAnswers,
      objectForm,
      route,

      isConvocation,
      stepIndex,
      userId,
      data,

      updateUserId,
      haveParents,
      //updateStep,
    };
  },
});
</script>

<style scoped>
:deep(.content .header-contentainer) {
  display: none;
}
:deep(.content .container-content) {
  height: auto;
  overflow: none;
}
</style>
