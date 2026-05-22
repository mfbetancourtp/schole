import ListContentsPage from './pages/ListAllowContents.vue';
import LoginLTI from "./pages/LoginLTI.vue";

export const ltiRouting = [
    {
        path: 'list-allow-contents-casurid',
        component: ListContentsPage,
    },
    {
        path: 'login',
        component: LoginLTI,
    },
];