<template>
  <SelectTutorStudents class="mb-3" @have-parents="haveParents" @update-user-id="updateUserId" />

  <template v-if="userId">
    <ObcerverByUserId :userId="userId" />
  </template>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from 'vue';
import { takeUntil } from 'rxjs/operators';
import { useI18n } from 'vue-i18n';
import { Subject } from 'rxjs';

import SelectTutorStudents from '../../administration/components/SelectTutorStudents.vue';

import ObcerverByUserId from './ObserverByUserId.vue';

import { GetProfileService } from '../../casurid/services/getProfile.service';

import { SetCurrentStudentParentService } from '../../administration/services/setCurrentStudentParent.service';

const setCurrentStudentParentService = new SetCurrentStudentParentService();
const getProfileService = new GetProfileService();

export default defineComponent({
  name: 'DiscOffeForTutorAndStudent',
  components: {
    SelectTutorStudents,

    ObcerverByUserId,
  },

  setup() {
    const _unsubscribeAll: Subject<any> = new Subject<any>();
    const { t } = useI18n();

    const userId = ref<number | null>(null);

    const loading = ref(true);

    onUnmounted(() => {
      _unsubscribeAll.next(null);
      _unsubscribeAll.complete();
    });

    const updateUserId = async () => {
      userId.value = setCurrentStudentParentService.get() as number;
    };

    const haveParents = async (hasParents: boolean) => {
      if (!hasParents) {
        let data: any = await getProfileService.run();

        if (data.user?.id) {
          userId.value = data.user.id;
        }
      } else {
        setCurrentStudentParentService.userId$.pipe(takeUntil(_unsubscribeAll)).subscribe(async (value: any) => {
          userId.value = value;
        });
      }
    };

    return {
      loading,
      t,

      userId,

      updateUserId,
      haveParents,
    };
  },
});
</script>

<style scoped></style>
