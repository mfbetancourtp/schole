<template>
  <form @submit.prevent="saveTopic">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name">
          <label>{{ t('access.roles.form.name') }}</label>
          <input v-model="v$.form.name.$model" class="form-control" type="text" />
        </AppFormField>

        <AppFormField :form-control="v$.form.description">
          <label>{{ t('access.roles.form.description') }}</label>
          <AppVoiceInput  v-model="v$.form.description.$model" textareaClass="form-control" />
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton class="btn-primary" label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CreateOrUpdateTopicService } from '../services/createOrUpdateTopic.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateTopicService = new CreateOrUpdateTopicService();

export default defineComponent({
  name: 'TopicForm',
  components: { AppFormModal, AppButton, AppFormField,AppVoiceInput },

  props: ['topic', 'competencyId'],
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const topic = props.topic ?? null;
    const title = `${!topic ? t('core.newMale') : t('core.edit')} ${t('core.theme')}`;

    const form = reactive({
      name: topic ? topic.name : null,
      description: topic ? topic.description : '',
      competencyId: props.competencyId,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: {},
          description: { required },
          competencyId: { required },
        },
      },
      { form }
    );

    const saveTopic = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        let topicId = topic ? topic.id : null;
        await createOrUpdateTopicService.run(form, topicId);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      v$,
      t,

      saveTopic,
    };
  },
});
</script>

<style scoped></style>
