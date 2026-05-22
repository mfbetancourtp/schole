<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton label="communications.messages.btnAddMessage" style="color: white" variant="primary" :to="{ name: 'communications.messagesCreate' }"> </AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <AppButtonGroup :size="'sm'">
          <AppCustomButton @click="reloadServices" icon-name="reload" v-tooltip="'Actualizar'"></AppCustomButton>

          <AppButton :outlined="btnId !== 0" @click="btnId = 0">
            {{
              t('communications.messages.btnReceived', {
                quantityMessagesReceived: numberMessages.received,
              })
            }}
          </AppButton>

          <AppButton :outlined="btnId !== 1" @click="btnId = 1">
            {{
              t('communications.messages.btnSent', {
                quantityMessagesSent: numberMessages.sent,
              })
            }}
          </AppButton>

          <AppButton :outlined="btnId !== 2" @click="btnId = 2">
            {{
              t('communications.messages.btnDrafts', {
                quantityMessagesDrafts: numberMessages.erasers,
              })
            }}
          </AppButton>
        </AppButtonGroup>

        <AppPulseLoading v-if="loadingReset"></AppPulseLoading>

        <section class="mt-2 row">
          <div class="col-4 pe-1 w-50">
            <AppDatatable :service="servicesMessages[btnId]" :params="{}" :name="'messages'" :defaultSort="'desc'" :show-filter-steps="false">
              <AppDatatableColumn v-slot="{ row }">
                <section @click="showMessage(row.id, row.isOpen)">
                  <div class="d-flex justify-content-between">
                    <span class="text-muted" style="font-size: 0.85rem">{{ row.roleName }}</span>

                    <span v-if="row.sendDatetime || row.createdAt" class="text-muted" style="font-size: 0.8rem">
                      {{
                        dayjs
                          .utc(row.sendDatetime ?? row.createdAt)
                          .locale('es')
                          .fromNow()
                      }}
                    </span>
                  </div>

                  <div v-bind:class="{ 'text-primary': row.id == parentMessageId }" style="font-size: 0.9rem">
                    <div v-bind:class="{ bold: row.isOpen == 0 }">
                      <template v-if="row.ownerPeople">
                        <p class="m-0">
                          {{ row.ownerPeople.names }}
                          {{ row.ownerPeople.lastnames }}
                        </p>

                        <p v-if="row.matriculateParentsIds != null">
                          <span>(Estudiante {{ row.nameStudent }} - {{ row.nameDegree }} )</span>
                        </p>
                        <p v-else>
                          <span>{{ row.nameDegree }} </span>
                        </p>
                      </template>

                      <p class="m-0">
                        {{ cleanKey(row.title) }}

                        <template v-if="titleWithIcon(row.title)">
                          <AppIcon v-if="titleWithIcon(row.title) == 'frown'" class="text-danger ms-1" icon="frown"> </AppIcon>
                          <AppIcon v-else-if="titleWithIcon(row.title) == 'smile'" class="text-success ms-1" icon="smile"> </AppIcon>
                          <AppIcon v-else-if="titleWithIcon(row.title)" class="ms-1" :icon="titleWithIcon(row.title)"> </AppIcon>
                        </template>
                      </p>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end">
                    <template v-if="btnId == 1">
                      <AppButton v-tooltip="'communications.messages.seeReadingControl'" icon="clipboard-list" size="sm" outlined @click="OpenSeeReadingControl(row.id)"></AppButton>
                    </template>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span v-if="row.sendDatetime || row.createdAt" class="text-muted" style="font-size: 0.8rem">
                      {{
                        dayjs
                          .utc(row.sendDatetime ?? row.createdAt)
                          .locale('es')
                          .subtract(5, 'hour')
                          .format('DD/MM/YY hh:mm A')
                      }}
                    </span>
                  </div>
                </section>
              </AppDatatableColumn>
            </AppDatatable>
          </div>

          <div class="col p-0 w-50">
            <AppLoading v-if="loadingMessageQueue"></AppLoading>

            <MessageQueue v-else :parent-message-id="parentMessageId" :message-queue="messageQueue" :btn-id="btnId" @load-message="loadMessage"></MessageQueue>
          </div>
        </section>
      </template>

      <AppModal v-model="seeReadingControlModal" :size="'lg'">
        <SeeReadingControl v-if="seeReadingControlModal" :message-id="parentMessageId" @close="closeSeeReadingControl"> </SeeReadingControl>
      </AppModal>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import relativeTime from 'dayjs/plugin/relativeTime';
import localeData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import MessageQueue from '../components/MessageQueue.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import SeeReadingControl from '../components/SeeReadingControl.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCustomButton from '../../../shared/components/Buttons/AppCustomButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';

import { MessageQueueDto } from '../dtos/message.dto';

import { GetMessagesSentService } from '../services/getMessagesSent.service';
import { PatchMessageOpenService } from '../services/patchMessageOpen.service';
import { GerMessagesErasersService } from '../services/gerMessagesErasers.service';
import { GetMessagesReceivedService } from '../services/getMessagesReceived.service';
import { GetMessageByMessageIdService } from '../services/getMessageByMessageId.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { useHeaderStore } from '../../../stores/header.store';

const getMessageByMessageIdService = new GetMessageByMessageIdService();
const getMessagesReceivedService = new GetMessagesReceivedService();
const gerMessagesErasersService = new GerMessagesErasersService();
const getMessagesSentService = new GetMessagesSentService();
const patchMessageOpenService = new PatchMessageOpenService();
const updateDatatableService = new UpdateDatatableService();

interface NumberMessages {
  sent: number;
  erasers: number;
  received: number;
}

dayjs.extend(relativeTime);
dayjs.extend(localeData);
dayjs.locale('es');
dayjs.extend(utc);

export default defineComponent({
  name: 'MessagesPage',
  components: {
    AppDatatableColumn,
    SeeReadingControl,
    AppButtonGroup,
    MessageQueue,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppIcon,
    AppPulseLoading,
    AppCustomButton,
  },

  setup() {
    const { t } = useI18n();
    const title = 'communications.messages.title';

    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const numberMessages: Ref<NumberMessages> = ref({
      sent: 0,
      erasers: 0,
      received: 0,
    });
    const messageQueue: Ref<MessageQueueDto[]> = ref([]);
    const btnId: Ref<number> = ref(0);

    const parentMessageId = ref();

    const seeReadingControlModal = ref(false);
    const loadingMessageQueue = ref(false);
    const loading = ref(true);
    const loadingReset = ref(false);

    const servicesMessages: Ref<Array<{ run: () => Promise<any> }>> = ref([getMessagesReceivedService, getMessagesSentService, gerMessagesErasersService]);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Comunicaciones', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
        await countMessages();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(btnId, async () => {
      loadingReset.value = true;

      await loadMessage();
      loadingReset.value = false;
    });

    const loadMessage = async () => {
      const dataReceived = await getMessagesReceivedService.run();
      const dataErasers = await gerMessagesErasersService.run();
      const dataSent = await getMessagesSentService.run();

      numberMessages.value.sent = dataSent.data.length;
      numberMessages.value.received = dataReceived.data.length;
      numberMessages.value.erasers = dataErasers.data.length;

      loadingMessageQueue.value = true;

      updateDatatableService.run();

      const service: any = servicesMessages.value[btnId.value];
      const messages = await service.run();

      if (messages.data.length) await showMessage(messages?.data[0]?.id, dataReceived?.data[0]?.isOpen);
      else messageQueue.value = [];

      loadingMessageQueue.value = false;
    };

    const countMessages = async () => {
      const dataReceived = await getMessagesReceivedService.run();
      const dataErasers = await gerMessagesErasersService.run();
      const dataSent = await getMessagesSentService.run();

      numberMessages.value.sent = dataSent.data.length;
      numberMessages.value.received = dataReceived.data.length;
      numberMessages.value.erasers = dataErasers.data.length;

      if (dataReceived.data.length) {
        await showMessage(dataReceived?.data[0]?.id, dataReceived?.data[0]?.isOpen);
      }
    };

    const showMessage = async (messageId: number, isOpen: number) => {
      try {
        parentMessageId.value = messageId;
        messageQueue.value = await getMessageByMessageIdService.run(messageId);

        if (isOpen == 0 && btnId.value == 0) {
          await patchMessageOpenService.run(messageId);
          await updateDatatableService.run();
        }
      } catch (e) {
        console.log(e);
      }
    };

    const OpenSeeReadingControl = async (messageId: number) => {
      parentMessageId.value = messageId;
      seeReadingControlModal.value = true;
    };
    const closeSeeReadingControl = async () => {
      seeReadingControlModal.value = false;
    };

    const reloadServices = async () => {
      loadingReset.value = true;
      await countMessages();
      await loadMessage();
      loadingReset.value = false;
    };

    const titleWithIcon = (title: string) => {
      let icon = '';

      const indexStart = title.search('{icon.');
      const indexEnd = title.search('}');
      const key = !!indexStart && !!indexEnd ? title.slice(indexStart + 1, indexEnd) : '';

      icon = key ? key.split('.')[1] : '';

      return icon;
    };
    const cleanKey = (title: string) => {
      const indexStart = title.search('{icon.');
      const indexEnd = title.search('}');
      const key = !!indexStart && !!indexEnd ? title.slice(indexStart, indexEnd + 1) : '';

      return title.replace(key, '');
    };

    return {
      loading,
      routes,
      title,
      t,

      seeReadingControlModal,
      loadingMessageQueue,
      servicesMessages,
      parentMessageId,
      numberMessages,
      messageQueue,
      btnId,
      closeSeeReadingControl,
      OpenSeeReadingControl,
      titleWithIcon,
      showMessage,
      loadMessage,
      reloadServices,
      cleanKey,
      loadingReset,
      dayjs,
    };
  },
});
</script>

<style scoped>
.bold {
  font-weight: 500;
}
</style>
