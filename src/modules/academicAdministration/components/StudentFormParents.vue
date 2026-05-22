<template>
  <div>
    <p class="tw-mb-0 tw-font-semibold tw-font-sans tw-text-gray-500">
      {{ t('core.generalTerms.academic.parents.plural') }}
    </p>

    <AppLoading v-if="loading" />

    <template v-else>
      <div
        class="button-tutores d-flex align-items-center p-2 bg-white border-bottom shadow-sm"
        v-for="(item, index) in parents"
        :key="index"
      >
        <div
          style="
            display: flex;
            align-items: center;
            width: 100%;
            text-align: center;
          "
        >
          <AppIcon
            @click="toParents(item)"
            type="button"
            icon="user-circle"
            class="text-primary me-3 fs-5"
          />

          <div
            @click="toParents(item)"
            style="
              width: 100%;
              border-right: 2px solid #dee2e6;
              padding-right: 20px;
            "
            type="button"
            class="d-flex flex-column text-start"
          >
            <h5 class="m-0">{{ item.people.names }}</h5>
            <span>{{ item.people.lastnames }} </span>
          </div>
        </div>

        <div style="padding-left: 10px">
          <AppButtonDelete @click="openConfirmDelete(item)"></AppButtonDelete>
        </div>

        <AppModal v-model="signatureDelete">
          <AppConfirmDeleteModal
            v-if="signatureDelete"
            entity="Acudiente"
            @confirmDelete="confirmDelete"
            @close="signatureDelete = false"
          >
          </AppConfirmDeleteModal>
        </AppModal>
      </div>
    </template>

    <div
      class="tw-flex tw-items-center tw-border-b tw-shadow tw-cursor-pointer hover:tw-shadow-md tw-p-3"
      @click="toParents()"
    >
      <AppIcon icon="user-plus" class="text-primary tw-mr-4 tw-text-xl" />

      <div>
        <p class="tw-mb-0 tw-text-xl">{{ t('core.new') }}</p>
        <span>{{ t('core.generalTerms.academic.parents.singular') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, reactive, PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EnrolledStudentDto } from '../dto/enrolledStudent.dto';

import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import { parentDto } from '../dto/parent.dto';

import { DeleteMatriculateParentByIdservice } from '../services/deleteMatriculateParentById.service';
import { GetMatriculatesParentsService } from '../services/getMatriculatesParents.service';

const getMatriculatesParentsService = new GetMatriculatesParentsService();
const deleteMatriculateParentByIdservice =
  new DeleteMatriculateParentByIdservice();
export default defineComponent({
  name: 'StudentFormParents',

  components: {
    AppConfirmDeleteModal,
    AppButtonDelete,
    AppLoading,
    AppIcon,
    AppModal,
  },

  props: {
    matriculateId: {
      type: Number,
      required: true,
    },
    data: {
      type: Object as PropType<EnrolledStudentDto>,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const parents: Ref<parentDto[]> = ref([]);
    const data: Ref<EnrolledStudentDto | any> = ref(props.data);
    const loading = ref(true);
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const signatureDelete = ref(false);
    const validateUser = ref(false);
    const matriculatesParents: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      loading.value = true;

      try {
        parents.value = await getMatriculatesParentsService.run(
          props.matriculateId
        );
      } catch (e) {
        console.log('err', e);
      }

      loading.value = false;
    });

    const toParents = async (parent: parentDto | null = null) => {
      if (!parent) {
        await router.push({
          name: 'academicAdministration.detailMatriculateParentCreate',
          params: {
            userId: route.params.userId,
            matriculateId: props.matriculateId,
          },
        });
      } else {
        await router.push({
          name: 'academicAdministration.detailMatriculateParentEdit',
          params: {
            userId: route.params.userId,
            matriculateId: props.matriculateId,
            parentId: parent.id,
          },
        });
      }
    };

    const openConfirmDelete = async (signatureId: any) => {
      signatureDelete.value = true;
      currentDataDelete.value = signatureId;
    };

    const confirmDelete = async () => {
      try {
        await deleteMatriculateParentByIdservice.run(parents.value[0].id);
        parents.value = await getMatriculatesParentsService.run(
          props.matriculateId
        );
        validateUser.value = true;

        console.log('Respuesta de confirmación de eliminación:');
      } catch (error) {
        console.error('Error al confirmar eliminación:', error);
      }
      signatureDelete.value = false;
    };

    return {
      loading,
      t,

      parents,

      toParents,
      openConfirmDelete,
      confirmDelete,
      signatureDelete,
      matriculatesParents,
    };
  },
});
</script>
