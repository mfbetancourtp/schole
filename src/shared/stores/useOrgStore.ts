import { defineStore } from 'pinia';
import { OrgNode } from '../types/org.types';

type ViewMode = 'orgchart' | 'tree' | 'table';

export const useOrgStore = defineStore('org', {
  state: () => ({
    tree: [] as OrgNode[],
    viewMode: 'orgchart' as ViewMode,
    selectedNodeId: null as string | null,
  }),

  actions: {
    setViewMode(mode: ViewMode) {
      this.viewMode = mode;
    },

    setTree(tree: OrgNode[]) {
      this.tree = tree;
    },

    selectNode(id: string | null) {
      this.selectedNodeId = id;
    },
  },
});
