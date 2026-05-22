<template>
    <form @submit.prevent="save">
        <AppFormModal :title="title" @closed="emit('close')">
            <template #content>
                <div class="accordion">
                    <div class="section section1" :class="{ active: selectedSection.value === 1 }">
                        <div  >
                            <AppCard class="grid-cards">
                                <template #body>
                                    <input type="radio" id="academicos" name="opcion" value="academicos"
                                        @change="selectedSection.value = 2">
                                    <label for="academicos">Niveles Académicos</label>
                                </template>
                            </AppCard>
                            <AppCard class="grid-cards">
                                <template #body>
                                    <input type="radio" id="administrativos" name="opcion" value="administrativos"
                                        @change="selectedSection.value = 2">
                                    <label for="administrativos">Niveles Administrativos</label>
                                </template>
                            </AppCard>
                        </div>
                    </div>
                    <div class="section section2" :class="{ active: selectedSection.value >= 2 }">
                        <div  >
                            <h4>Roles y Niveles Académicos</h4>
                            <AppCard v-for="item in data2" :key="item.id">
                                <template #body>
                                    <div class="p-3 pb-0 d-flex  justify-content-between">
                                        <AppBadge :variant="'primary'" :label="'Niveles Academicos'"></AppBadge>
                                        <input type="radio" id="academicos" name="opcion" value="academicos"
                                            @change="selectLevel(item.id)">
                                        <h6>{{ item.name }}</h6>
                                    </div>
                                </template>
                            </AppCard>
                        </div>
                    </div>

                    <div class="section section3" :class="{ active: selectedSection.value === 3 }">
                        <div  >
                            <h4>Grados</h4>
                            <AppCard v-for="degree in selectedDegrees" :key="degree.id">
                                <template #body>
                                    <div class="p-3 pb-0 d-flex  justify-content-between">
                                        <AppBadge :variant="'primary'" :label="'Niveles Academicos'"></AppBadge>
                                        <input type="radio" id="academicos" name="opcion" value="academicos"
                                            @change="selectedSection.value = 3">
                                        <h6>{{ degree.name }}</h6>
                                    </div>
                                </template>
                            </AppCard>
                        </div>
                    </div>
                </div>
            </template>

            <template v-slot:actions>
                <AppButton variant="primary" label="core.save"></AppButton>
            </template>
        </AppFormModal>
    </form>
</template>
  
<script lang="ts">
import { defineComponent, reactive, onMounted, ref, Ref, watch, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import { GetRelatedDataScheduleParticipantsService } from '../services/getRelatedDataScheduleParticipants.service';

const getRelatedDataScheduleParticipantsService = new GetRelatedDataScheduleParticipantsService();

export default defineComponent({
    name: 'ScheduleParticipants',
    components: { AppFormModal, AppButton, AppCard },

    props: {
        data: {
            type: Object,
            required: false,
        },
        academicPeriodId: {
            type: Object,
        }
    },

    emits: ['close', 'id'],

    setup(props, { emit }) {
        const data = props.data ?? {};

        const title = 'Agregar Participantes';
        const selectedSection = reactive({
            value: 1,
        });
        const selectedLevels: Ref<number[]> = ref([]);


        const data2: Ref<any> = ref(null);

        const form = reactive({
            repeatNumber: data.repeatNumber || '',
            typeRepeat: data.typeRepeat,
            durationStartDate: data.durationStartDate,
            durationEndDate: data.durationEndDate,
            durationEndNumberRepeat: data.durationEndNumberRepeat,
            weekDay: [],
            dayMonth: data.dayMonth,
        });

        const v$ = useVuelidate(
            {
                form: {
                    repeatNumber: { required },
                    typeRepeat: { required },
                    durationStartDate: {},
                    durationEndDate: {},
                    durationEndNumberRepeat: {},
                    weekDay: {},
                    dayMonth: {},
                },
            },

            { form }
        );

        onMounted(async () => {

            data2.value = await getRelatedDataScheduleParticipantsService.run(props.academicPeriodId);
        });


        const save = async () => {
            const isValid = await v$.value.$validate();
            if (!isValid) return;

            let dataSend: any = {
                repeatNumber: form.repeatNumber,
                dayMonth: form.dayMonth ?? null,
            };

            try {
                //   const response = await createOrUpdatePeriodicity.run(dataSend);
            } catch (error) {
                console.error('Error saving data:', error);
            }
        };

        const emitClose = (id: any) => {
            emit('close', id);
        };

        const selectedDegrees = computed(() => {
            if (data2.value) {
                return data2.value
                    .filter((level) => selectedLevels.value.includes(level.id))
                    .flatMap((level) => level.degrees);
            } else {
                return [];
            }
        });

        const selectLevel = (levelId: number) => {
            if (!selectedLevels.value.includes(levelId)) {
                selectedLevels.value.push(levelId);
            } else {
                selectedLevels.value = selectedLevels.value.filter((id) => id !== levelId);
            }
        };

        return {
            title,
            v$,
            data2,
            selectLevel,
            selectedDegrees,
            selectedSection,
            save,
            form,
            emit,
        };
    },
});
</script>
<style scoped>
.accordion {
    display: flex;
    height: 100%;
}

.section {
    transition: transform 0.5s;
    overflow: hidden;
    height: 100%;
}

.section.active {
    transform: translateX(0%);
}

.section:not(.active) {
    transform: translateX(100%);
}

.section1,
.section2,
.section3 {
    width: 33.33%;
}

.card {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 20px;
    padding: 1rem;
    margin: 0.5rem;
    height: 100%;
    gap: 1rem;

}

.grid-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}
</style>
