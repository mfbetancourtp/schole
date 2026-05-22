import AnnouncementsPage from './pages/Announcements.vue';
import CreateAnnouncementPage from './pages/CreateAnnouncement.vue';
import announcementDetailPage from './pages/announcementDetail.vue';
import MessagesPage from './pages/Messages.vue';
import CreateMessagesPage from './pages/CreateMessages.vue';
import EditMessagesPage from './pages/EditMessages.vue';

const appName = 'communications';

export const communicationsRouting = [
  {
    path: 'announcements',
    component: AnnouncementsPage,
    name: `${appName}.announcements`,
  },
  {
    path: 'announcements/create',
    component: CreateAnnouncementPage,
    name: `${appName}.announcements.create`,
  },
  {
    path: 'announcements/:announcementId/detail',
    component: announcementDetailPage,
    name: `${appName}.announcementDetail`,
  },

  {
    path: 'messages',
    component: MessagesPage,
    name: `${appName}.messagesList`,
  },
  {
    path: 'messages/create',
    component: CreateMessagesPage,
    name: `${appName}.messagesCreate`,
  },
  {
    path: 'messages/:messageId/edit',
    component: EditMessagesPage,
    name: `${appName}.messagesEdit`,
  },
  {
    path: 'messages/action',
    component: EditMessagesPage,
    name: `${appName}.messagesAction`,
  },
];
