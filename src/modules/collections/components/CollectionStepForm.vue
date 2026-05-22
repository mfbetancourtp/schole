<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack :to="{ name: 'collections.collectionStepsList' }"></AppButtonBack>

      <AppButton style="color: white;" label="core.save" @click="save()"></AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading || (data?.id && !v$.form.name.$model)"></AppLoading>

      <AppCard v-else>
        <template #body>
          <form @submit.prevent="save()">
            <div class="form-row">
              <AppFormField :form-control="v$.form.name">
                <div class="d-flex align-items-end mb-1">
                  <label for="name">{{ t('collections.collectionSteps.form.name') }}</label>
                </div>

                <input
                  id="name"
                  class="form-control"
                  type="text"
                  v-model="v$.form.name.$model"
                  pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                  title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.startNumberDay">
                <div class="d-flex align-items-end justify-content-between mb-1">
                  <div class="d-flex align-items-end gap-1">
                    <label for="startNumberDay">{{ t('collections.collectionSteps.form.startNumberDay') }}</label>

                    <div v-if="startNumberDayAfter" v-tooltip="'collections.collectionSteps.form.daysAfterQuota'">
                      <AppIcon icon="info-circle" />
                    </div>
                    <div v-else v-tooltip="'collections.collectionSteps.form.daysBeforeQuota'">
                      <AppIcon icon="info-circle" />
                    </div>
                  </div>

                  <div class="d-flex justify-content-center gap-2">
                    <AppBadge variant="outlined-primary" class="pointer" v-if="startNumberDayAfter" @click="startNumberDayAfter = false">
                      {{ t('collections.collectionSteps.form.daysBefore') }}
                    </AppBadge>
                    <AppBadge variant="primary" class="pointer" v-else>
                      {{ t('collections.collectionSteps.form.daysBefore') }}
                    </AppBadge>
                    <AppBadge variant="primary" class="pointer" v-if="startNumberDayAfter" @click="startNumberDayAfter = true">
                      {{ t('collections.collectionSteps.form.daysAfter') }}
                    </AppBadge>
                    <AppBadge variant="outlined-primary" class="pointer" v-else @click="startNumberDayAfter = true">
                      {{ t('collections.collectionSteps.form.daysAfter') }}
                    </AppBadge>
                  </div>
                </div>

                <input id="startNumberDay" class="form-control" type="number" v-model="v$.form.startNumberDay.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.endNumberDay">
                <div class="d-flex align-items-end justify-content-between mb-1">
                  <div class="d-flex align-items-end gap-1">
                    <label for="endNumberDay">{{ t('collections.collectionSteps.form.endNumberDay') }}</label>

                    <div v-if="endNumberDayAfter" v-tooltip="'collections.collectionSteps.form.daysAfterQuota'">
                      <AppIcon icon="info-circle" />
                    </div>
                    <div v-else v-tooltip="'collections.collectionSteps.form.daysBeforeQuota'">
                      <AppIcon icon="info-circle" />
                    </div>
                  </div>

                  <div class="d-flex justify-content-center gap-2">
                    <AppBadge variant="outlined-primary" class="pointer" v-if="endNumberDayAfter" @click="endNumberDayAfter = false">
                      {{ t('collections.collectionSteps.form.daysBefore') }}
                    </AppBadge>
                    <AppBadge variant="primary" class="pointer" v-else>
                      {{ t('collections.collectionSteps.form.daysBefore') }}
                    </AppBadge>

                    <AppBadge variant="primary" class="pointer" v-if="endNumberDayAfter" @click="endNumberDayAfter = true">
                      {{ t('collections.collectionSteps.form.daysAfter') }}
                    </AppBadge>
                    <AppBadge variant="outlined-primary" class="pointer" v-else @click="endNumberDayAfter = true">
                      {{ t('collections.collectionSteps.form.daysAfter') }}
                    </AppBadge>
                  </div>
                </div>

                <input id="endNumberDay" class="form-control" type="number" v-model="v$.form.endNumberDay.$model" />
              </AppFormField>
            </div>

            <h5>{{ t('collections.collectionSteps.form.endStage') }}</h5>

            <div class="form-row">
              <AppFormField :form-control="v$.form.surchargeIds" :label="'collections.collectionSteps.form.surchargeIds'">
                <AppAutocomplete v-model="v$.form.surchargeIds.$model" :input-id="'surchargeIds'" :options="surcharges" :multiple="true"></AppAutocomplete>
              </AppFormField>

              <AppFormField :form-control="v$.form.lockCompletion" :label="'collections.collectionSteps.form.lockCompletion'">
                <AppAutocomplete v-model="v$.form.lockCompletion.$model" :options="lockCompletions" :input-id="'lockCompletion'"></AppAutocomplete>
              </AppFormField>

              <div class="col-2 d-flex align-items-end">
                <AppFormField :form-control="v$.form.active" :label="'collections.collectionSteps.form.active'" class="form-check form-switch">
                  <input id="active" v-model="v$.form.active.$model" class="form-check-input" type="checkbox" />
                </AppFormField>
              </div>
            </div>
          </form>

          <hr />

          <section>
            <NotificationsCollectionStep v-if="data?.id" :config-receivers="configReceivers" :collection-step-id="data.id" :channels="channels"></NotificationsCollectionStep>

            <section v-else class="d-flex justify-content-between align-items-center">
              <h5>
                {{ t('collections.collectionSteps.form.notifications.title') }}
              </h5>

              <div class="d-flex flex-column align-items-end">
                <AppButton label="core.newFemale" class="text-white" :disabled="true"></AppButton>

                <span class="form-text">
                  {{ t('collections.collectionSteps.form.notifications.validation') }}
                </span>
              </div>
            </section>
          </section>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref } from 'vue';
import { required, minValue } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import NotificationsCollectionStep from './NotificationsCollectionStep.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { SurchargeDto } from '../dtos/surcharge.dto';
import { CollectionStepDto } from '../dtos/collectionStep.dto';

import { GetSurchargesService } from '../services/getSurcharges.service';
import { RelatedDataCollectionStepsService } from '../services/relatedDataCollectionSteps.service';
import { CreateOrUpdateCollectionStepService } from '../services/createOrUpdateCollectionStep.service';
import { useHeaderStore } from '../../../stores/header.store';

const createOrUpdateCollectionStepService = new CreateOrUpdateCollectionStepService();
const relatedDataCollectionStepsService = new RelatedDataCollectionStepsService();
const getSurchargesService = new GetSurchargesService();

export default defineComponent({
  name: 'CollectionStepForm',
  components: {
    NotificationsCollectionStep,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppBadge,
    AppCard,
    AppIcon,
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
    data: {
      type: Object as PropType<CollectionStepDto>,
    },
  },

  setup(props) {
    const router = useRouter();
    const { t } = useI18n();
    const { n } = useI18n();

    const data: CollectionStepDto | null = props.data ?? null;

    const surcharges: Ref<SurchargeDto[]> = ref([]);
    const configReceivers: Ref<any[]> = ref([]);
    const lockCompletions: Ref<any[]> = ref([]);
    const channels: Ref<any[]> = ref([]);

    const startNumberDayAfter = ref(true);
    const endNumberDayAfter = ref(true);
    const loading = ref(true);

    const form = reactive({
      name: data?.name ?? '',
      startNumberDay: data?.startNumberDay ? Math.abs(data?.startNumberDay) : 0,
      endNumberDay: data?.endNumberDay ? Math.abs(data?.endNumberDay) : 0,
      lockCompletion: data?.lockCompletion ?? '',
      active: data?.active ? true : false,
      surchargeIds: data?.surchargeIds ?? [],
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          startNumberDay: { required, minValue: minValue(0) },
          endNumberDay: { required, minValue: minValue(0) },
          lockCompletion: {},
          active: {},
          surchargeIds: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Cartera', url: '' };
      headerStorage.moduleItem = { name: 'Etapas de cartera', url: '' };
      headerStorage.moduleSubItem = { name: props.title, url: '' };
        let relatedData = await relatedDataCollectionStepsService.run();
        surcharges.value = await getSurchargesService.run();

        surcharges.value.forEach((surcharge: SurchargeDto) => {
          const percentageOrValue = surcharge.isPercent ? `${surcharge.value}%` : `$${n(surcharge.value, 'currency')}`;
          surcharge.name = `${surcharge.title} ${percentageOrValue}`;
        });

        relatedData.configReceivers.forEach((configReceiver: any) => {
          configReceivers.value.push({
            id: configReceiver.value,
            name: configReceiver.label,
          });
        });
        relatedData.lockCompletions.forEach((lockCompletion: any) => {
          lockCompletions.value.push({
            id: lockCompletion.value,
            name: lockCompletion.label,
          });
        });
        relatedData.channels.forEach((channel: any) => {
          channels.value.push({ id: channel.value, name: channel.label });
        });

        startNumberDayAfter.value = data ? (data?.startNumberDay >= 0 ? true : false) : true;
        endNumberDayAfter.value = data ? (data?.endNumberDay >= 0 ? true : false) : true;
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          name: form.name,
          startNumberDay: startNumberDayAfter.value ? form.startNumberDay : form.startNumberDay * -1,
          endNumberDay: endNumberDayAfter.value ? form.endNumberDay : form.endNumberDay * -1,
          lockCompletion: form.lockCompletion,
          active: form.active ? 1 : 0,
          surchargeIds: form.surchargeIds,
        };

        let res = await createOrUpdateCollectionStepService.run(dataSend, data?.id);

        if (!data?.id) {
          await router.push({
            name: 'collections.collectionStepsEdit',
            params: { collectionStepId: res.data.id },
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      v$,
      t,

      startNumberDayAfter,
      endNumberDayAfter,
      configReceivers,
      lockCompletions,
      surcharges,
      channels,

      save,
    };
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
