<template>
    <div class="border p-3">
        <h4>Lista de Acudientes</h4>

        <div :class="{ 'grid-cards': parents.length }">
            <AppButtonNewContainer
                @click="openFormParentsEnrolleesModal()"
            ></AppButtonNewContainer>

            <AppEmptyResponse 
                v-if="!parents.length"
            ></AppEmptyResponse>

            <div   v-for="parent, index in parents" :key="index">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <AppIcon icon="user-circle" class="text-primary me-3 fs-5"/>

                            <div>
                                <h5 class="mb-0">{{ parent.people.names }}</h5>
                                <span>{{ parent.people.lastnames }}</span>
                            </div>
                        </div>

                        <div class="pointer" @click="openFormParentsEnrolleesModal(parent)">
                            <AppIcon icon="edit" class="text-primary me-3 fs-5"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <AppModal v-model="parentsEnrolleesModal" :size="'lg'">
        <FormParentsEnrollees
            v-if="parentsEnrolleesModal"
            :data="currentParent.value"
            @close="closeFormParentsEnrolleesModal"
        ></FormParentsEnrollees>
    </AppModal>
</template>

<script lang="ts">
import {defineComponent, onMounted, PropType, reactive, ref} from "vue";

import AppIcon from '../../../shared/components/AppIcon.vue';
import FormParentsEnrollees from './FormParentsEnrollees.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

export default defineComponent({
    name: "ParentsForEnrollees",
    components: {
        AppButtonNewContainer,
        FormParentsEnrollees,
        AppEmptyResponse,
        AppModal,
        AppIcon,
    },

    emits: ['updateParents'],
    props: {
        parents: {
            type: Array as PropType<any[]>,
            required: true,
        },
    },

    setup(props, {emit}) {
        const parentsEnrolleesModal = ref(false);

        const currentParent: { value: any } = reactive({
            value: null,
        });
    
        onMounted(async () => {
            try {
            } catch (e) {}
        });

        const openFormParentsEnrolleesModal = (parent: any = null) => {
            currentParent.value = parent;
            parentsEnrolleesModal.value = true;
        };
        
        const closeFormParentsEnrolleesModal = async () => {
            emit('updateParents', true);
            parentsEnrolleesModal.value = false;
        };

        return {
            parentsEnrolleesModal,
            currentParent,

            closeFormParentsEnrolleesModal,
            openFormParentsEnrolleesModal,
        };
    },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

.pointer {
    cursor: pointer;
}
</style>