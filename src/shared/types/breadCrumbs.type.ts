import {RouteLocationRaw} from 'vue-router';

export interface BreadCrumbsType {
    name: string;
    url?: RouteLocationRaw | string;
}
