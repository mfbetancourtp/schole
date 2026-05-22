/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'vue-i18n' {
  export function useI18n(): { t: (key: string) => string; locale: any };
  export function createI18n(options?: any): any;
  export default any;
}

declare module 'vue-meta' {
  export function useMeta(meta: Record<string, any>): void;
  export function createMetaManager(): any;
  export default any;
}

declare module 'vue-router' {
  export function useRouter(): any;
  export function useRoute(): any;
  export function createRouter(options: any): any;
  export function createWebHistory(base?: string): any;
  export function createWebHashHistory(base?: string): any;
}
