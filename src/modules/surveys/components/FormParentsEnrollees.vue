<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <section>
          <h4 class="text-capitalize">
            {{ t('academicAdministration.matriculates.form.sectionOne') }}
          </h4>

          <div class="form-row">
            <AppFormField :form-control="v$.form.relationshipId" :label="'academicAdministration.parents.form.relationship'">
              <AppAutocomplete v-model="v$.form.relationshipId.$model" :options="relationships"></AppAutocomplete>
            </AppFormField>

            <div class="col-6">
              <AppFormField class="form-check form-switch mb-0" :form-control="v$.form.isEconomicManager" :label="'academicAdministration.parents.form.isEconomicManager'">
                <input type="checkbox" class="form-check-input" v-model="v$.form.isEconomicManager.$model" />
              </AppFormField>

              <AppFormField class="form-check form-switch" :form-control="v$.form.isEmergencyContact" :label="'academicAdministration.parents.form.isEmergencyContact'">
                <input type="checkbox" class="form-check-input" v-model="v$.form.isEmergencyContact.$model" />
              </AppFormField>
            </div>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.people.identificationTypeId" label="academicAdministration.people.identificationType">
              <AppAutocomplete v-model="v$.form.people.identificationTypeId.$model" :options="identificationTypes"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.people.identification" label="access.users.form.identification">
              <input type="text" class="form-control" v-model="v$.form.people.identification.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.people.names" label="reports.filters.names">
              <input type="text" class="form-control" v-model="v$.form.people.names.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.people.lastnames" label="reports.filters.lastnames">
              <input type="text" class="form-control" v-model="v$.form.people.lastnames.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.people.email" label="reports.filters.email">
              <input type="email" class="form-control" v-model="v$.form.people.email.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.people.mobile" label="academicAdministration.people.mobile">
              <input type="text" class="form-control" v-model="v$.form.people.mobile.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.people.homePhone" label="academicAdministration.people.homePhone">
              <input type="text" class="form-control" v-model="v$.form.people.homePhone.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.people.workPhone" label="academicAdministration.people.workPhone">
              <input type="text" class="form-control" v-model="v$.form.people.workPhone.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.people.genderId" label="academicAdministration.people.gender">
              <AppAutocomplete v-model="v$.form.people.genderId.$model" :options="genders"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.people.religion" label="academicAdministration.people.religion">
              <input type="text" class="form-control" v-model="v$.form.people.religion.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.people.nationality" label="academicAdministration.people.nationality">
              <input type="text" class="form-control" v-model="v$.form.people.nationality.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.people.primaryLanguage" label="academicAdministration.people.primaryLanguage">
              <input type="text" class="form-control" v-model="v$.form.people.primaryLanguage.$model" />
            </AppFormField>
          </div>
        </section>

        <!-- <section>
                    <h4 class="text-capitalize">
                        {{ t('academicAdministration.matriculates.form.sectionTwo') }}
                    </h4>
                </section> -->
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, Ref, ref, computed } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { CreateOrUpdateParentsEnrolleesService } from '../services/createOrUpdateParentsEnrollees.service';
import { GetMatriculateRelatedDataFormService } from '../../../shared/services/getMatriculateRelatedDataForm.service';

const createOrUpdateParentsEnrolleesService = new CreateOrUpdateParentsEnrolleesService();
const getMatriculateRelatedDataFormService = new GetMatriculateRelatedDataFormService();

export default defineComponent({
  name: 'FormParentsEnrollees',
  components: { AppFormModal, AppButton, AppFormField, AppAutocomplete },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    const data = computed(() => props.data);
    let title = !data.value ? 'Nuevo Acudiente' : 'Editar Acudiente';

    const identificationTypes: Ref<any[]> = ref([]);
    const relationships: Ref<any[]> = ref([]);
    const genders: Ref<any[]> = ref([]);
    const validateParent = ref(false);
    const route = useRoute();
    const { t } = useI18n();

    const form = reactive({
      id: data?.value?.id ?? null,
      relationshipId: data?.value?.relationshipId ?? null,
      isEconomicManager: data?.value?.isEconomicManager ? true : false,
      isEmergencyContact: data?.value?.isEmergencyContact ? true : false,
      convocationEnrolId: parseInt(route.params.convocationEnrollId.toString(), 10),
      people: {
        id: data?.value?.people?.id ?? null,
        identificationTypeId: data?.value?.people?.identificationTypeId ?? null,
        identification: data?.value?.people?.identification ?? null,
        names: data?.value?.people?.names ?? null,
        lastnames: data?.value?.people?.lastnames ?? null,
        email: data?.value?.people?.email ?? null,
        mobile: data?.value?.people?.mobile ?? null,
        homePhone: data?.value?.people?.homePhone ?? null,
        workPhone: data?.value?.people?.workPhone ?? null,
        genderId: data?.value?.people?.genderId ?? null,
        religion: data?.value?.people?.religion ?? null,
        nationality: data?.value?.people?.nationality ?? null,
        primaryLanguage: data?.value?.people?.primaryLanguage ?? null,

        homeMunicipalityId: data?.value?.people?.homeMunicipalityId ?? null,
        direction: data?.value?.people?.direction ?? null,

        birthMunicipalityId: data?.value?.people?.birthMunicipalityId ?? null,
        birthDate: data?.value?.people?.birthDate ?? null,

        institutionId: data?.value?.people?.institutionId ?? parseInt(route.params.institutionId.toString(), 10),
        lmsUserKey: data?.value?.people?.lmsUserKey ?? null,
        userId: data?.value?.people?.userId ?? null,
      },
    });
    const v$ = useVuelidate(
      {
        form: {
          id: {},
          relationshipId: { required },
          isEconomicManager: {},
          isEmergencyContact: {},
          convocationEnrolId: {},
          people: {
            id: {},
            identification: { required },
            names: { required },
            lastnames: { required },
            email: { required },
            genderId: {},
            identificationTypeId: { required },
            birthDate: {},
            birthMunicipalityId: {},
            homeMunicipalityId: {},
            primaryLanguage: {},
            nationality: {},
            direction: {},
            workPhone: {},
            homePhone: {},
            religion: {},
            mobile: {},
            institutionId: { required },
            lmsUserKey: {},
            userId: {},
          },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        let response = await getMatriculateRelatedDataFormService.run();
        identificationTypes.value = response.identificationTypes;
        relationships.value = response.relationships;
        genders.value = response.genders;
      } catch (e) {
        console.error(e);
      }
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateParentsEnrolleesService.run(form);
        emit('close');
      } catch (e) {
        console.error(e);
      }
    };

    return {
      identificationTypes,
      validateParent,
      relationships,
      genders,
      title,
      save,
      v$,
      t,
    };
  },
});
</script>

<style scoped></style>
