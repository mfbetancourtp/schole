<template>
  <div>
    <!-- Header -->
    <div class="sectionHead">
      <div class="sectionHead__icon">
        <AppIcon icon="briefcase" />
      </div>
      <div>
        <h3 class="sectionHead__title">Perfil Profesional</h3>
        <p class="sectionHead__subtitle">Describe tu trayectoria y áreas de especialización</p>
      </div>
    </div>
    <AppPulseLoading v-if="loading"></AppPulseLoading>

    <!-- Editor -->
    <div class="card">
      <!-- FORM -->
      <form @submit.prevent="handleSave">
        <AppFormField :form-control="v$.form.profile" :label="'Perfil profesional'">
          <AppEditorDocument v-model="v$.form.profile.$model" style="max-height: 60vh" class="overflow-clip editorWrap" withDictation />
        </AppFormField>

        <!-- Counter -->
        <div class="counterRow">
          <span class="counterText"> {{ characterCount }} / {{ maxCharacters }} caracteres </span>

          <div class="counterBar">
            <div class="counterBar__fill" :class="counterColorClass" :style="{ width: `${counterPercent}%` }" />
          </div>
        </div>

        <!-- Save -->
        <div class="w-100 d-flex flex-row justify-content-end">
          <AppButton class="saveBtn" type="submit">
            <AppIcon icon="save" />
            {{ 'Guardar Cambios' }}
          </AppButton>
        </div>
      </form>
    </div>

    <!-- Tips -->
    <div class="tipsBox">
      <h4 class="tipsTitle">Consejos para un perfil profesional efectivo:</h4>
      <ul class="tipsList">
        <li>Resalta tu experiencia y áreas de especialización principales</li>
        <li>Menciona logros académicos y profesionales relevantes</li>
        <li>Incluye tus áreas de investigación e intereses</li>
        <li>Mantén un tono profesional y académico</li>
        <li>Usa listas con viñetas para mejor legibilidad</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../../shared/plugins/vuelidate.plugin';
import { useResumeStore } from '../../stores/resume.store';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppEditorDocument from '../../../../shared/components/Editor/AppEditorDocument.vue';
import { GetProfessionalProfilesNotPaginationService } from '../../services/getProfessionalProfilesWithPagination.service';
import { CreateOrUpdateProfessionalProfileService } from '../../services/createOrUpdateProfessionalProfile.service';
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';

const getProfessionalProfilesNotPaginationService = new GetProfessionalProfilesNotPaginationService();
const createOrUpdateProfessionalProfileService = new CreateOrUpdateProfessionalProfileService();

export default defineComponent({
  name: 'ProfileStep',
  components: {
    AppButton,
    AppIcon,
    AppFormField,
    AppEditorDocument,
    AppPulseLoading,
  },
  setup() {
    const loading = ref(true);
    const maxCharacters = 2000;
    const userPeopleId = ref();
    const professionaProfileId = ref();
    const resumeStore = useResumeStore();
    const form = reactive({
      peopleId: 0,
      profile: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          peopleId: {},
          profile: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const raw = await localStorage.getItem('user');
        if (!raw) return;

        const user = JSON.parse(raw);

        userPeopleId.value = user.people.id;

        const response = await getProfessionalProfilesNotPaginationService.run({
          noPag: true,
          peopleId: userPeopleId.value,
        });

        form.profile = response?.[0]?.description ?? '';
        professionaProfileId.value = response?.[0]?.id;

        // ✅ guardar en pinia para el CV
        resumeStore.setProfile({
          description: response?.[0]?.description ?? '',
          id: response?.[0]?.id ?? null,
          peopleId: userPeopleId.value,
        });
      } catch (error) {
        console.log('Error cargando perfil profesional:', error);
      } finally {
        loading.value = false;
      }
    });

    // El servicio recibe el HTML completo del editor, por eso el conteo
    // debe incluir etiquetas como <p>, <strong>, etc.
    const serializedProfile = computed(() => String(form.profile ?? ''));

    const characterCount = computed(() => serializedProfile.value.length);

    const counterPercent = computed(() => Math.min(100, Math.round((characterCount.value / maxCharacters) * 100)));

    const counterColorClass = computed(() => {
      const c = characterCount.value;
      if (c > maxCharacters * 0.9) return 'isDanger';
      if (c > maxCharacters * 0.7) return 'isWarn';
      return 'isOk';
    });

    const handleSave = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      loading.value = true;

      try {
        const dataSend = {
          peopleId: userPeopleId.value,
          description: form.profile,
        };

        const response = await createOrUpdateProfessionalProfileService.run(dataSend, professionaProfileId.value);
        professionaProfileId.value = response?.data?.id ?? response?.id ?? professionaProfileId.value;

        resumeStore.setProfile({
          description: form.profile ?? '',
          id: professionaProfileId.value ?? null,
          peopleId: userPeopleId.value,
        });
      } catch (error) {
        console.log('Error guardando perfil profesional:', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      v$,
      maxCharacters,
      characterCount,
      counterPercent,
      counterColorClass,
      handleSave,
      loading,
    };
  },
});
</script>

<style scoped>
.sectionHead {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0 18px;
}
.sectionHead__icon {
  min-width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #1b2e83);
}
.sectionHead__title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}
.sectionHead__subtitle {
  font-size: 14px;
  margin: 2px 0 0;
  color: var(--color-on-surface-variant, #667085);
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 14px;
}
.cardTitle {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}
.cardHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

/* counter */
.counterRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}
.counterText {
  font-size: 13px;
  color: #667085;
}
.counterBar {
  width: 140px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.counterBar__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.15s ease;
}
.counterBar__fill.isOk {
  background: var(--color-primary, #1b2e83);
}
.counterBar__fill.isWarn {
  background: #f59e0b;
}
.counterBar__fill.isDanger {
  background: #ef4444;
}

/* save */
.saveBtn {
  margin-top: 16px;
  justify-content: end;
}

/* tips */
.tipsBox {
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.06);
  border: 1px solid rgba(var(--color-primary-rgb, 27, 46, 131), 0.18);
  border-radius: 16px;
  padding: 16px;
  margin-top: 14px;
}
.tipsTitle {
  margin: 0 0 10px 0;
  color: var(--color-primary, #1b2e83);
  font-weight: 800;
  font-size: 14px;
}
.tipsList {
  margin: 0;
  padding-left: 18px;
  color: #1f3a8a;
  font-size: 13px;
  display: grid;
  gap: 6px;
}
</style>
