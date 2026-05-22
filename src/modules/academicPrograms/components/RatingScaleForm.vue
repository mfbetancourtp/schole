<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'academicPrograms.ratingScales' }"></AppButtonBack>

      <AppButton style="color: white;" label="core.save" @click="save()" :nativeType="'submit'"></AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading || (data?.id && !v$.form.title.$model)"></AppLoading>

      <div v-else>
        <form @submit.prevent="save()">
          <AppFormField :form-control="v$.form.title" :label="'Nombre'">
            <input id="title" class="form-control" type="text" v-model="v$.form.title.$model" />
          </AppFormField>
          <AppFormField :formControl="v$.form.abbreviation" :label="'Código*'">
          <input type="text" class="form-control" id="abbreviation" v-model="v$.form.abbreviation.$model" />
        </AppFormField>
          <AppFormField :form-control="v$.form.description" :label="'Descripción'">
            <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control" />

            
          </AppFormField>
        </form>

        <hr />

        <section>
          <RatingScalesTable v-if="data?.id" :rating-scale-id="data.id"></RatingScalesTable>

          <section v-else class="d-flex justify-content-between align-items-center">
            <h5>Detalles de escala de valoración</h5>

            <div class="d-flex flex-column align-items-end">
              <AppButton label="core.newFemale" :disabled="true"></AppButton>

              <span class="form-text"> Para usar esta opción, debes guardar la escala de valoración. </span>
            </div>
          </section>
        </section>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import RatingScalesTable from './RatingScalesDetails.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { RatingScaleDto } from '../dtos/ratingScale.dto';

import { CreateOrUpdateRatingScaleService } from '../services/createOrUpdateRatingScale.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateRatingScaleService = new CreateOrUpdateRatingScaleService();

export default defineComponent({
  name: 'RatingScaleForm',
  components: {
    RatingScalesTable,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppVoiceInput,
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
      type: Object as PropType<RatingScaleDto>,
    },
  },

  setup(props) {
    const headerStorage = useHeaderStore();
    useMeta({ title: props.title });
    headerStorage.module = { name: 'Estructura Académica', url: '' };
    headerStorage.moduleItem = { name: 'Escalas de valoración', url: '' };
    headerStorage.moduleSubItem = { name: props.title, url: '' };

    const router = useRouter();
    const { t } = useI18n();

    const data: RatingScaleDto | null = props.data ?? null;

    const loading = ref(true);

    const form = reactive({
      title: data?.title ?? '',
      abbreviation: data?.abbreviation ?? '',
      description: data?.description ?? '',
    });
    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          abbreviation: { required },
          description: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        // No hay ninguna lógica adicional en este bloque
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        let res = await createOrUpdateRatingScaleService.run(form, data?.id);

        if (!data?.id) {
          await router.push({
            name: 'academicPrograms.ratingScaleEdit',
            params: { ratingScaleId: res.data.id },
          });
        }
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      loading,
      save,
      v$,
      t,
    };
  },
});
</script>

<style scoped></style>
