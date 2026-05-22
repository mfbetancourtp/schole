<template>
  <div class="treeItem">
    <!-- fila principal -->
    <div class="treeRow" :class="{ 'treeRow--root': isRoot, 'treeRow--child': !isRoot }">
      <div class="treeCell">
        <div class="treeIndent" :style="{ paddingLeft: `${level * 22}px` }">
          <!-- líneas (vertical + elbow) -->
          <span class="treeLines" aria-hidden="true"></span>

          <!-- caret -->
          <button v-if="hasChildren" class="caret" @click="isOpen = !isOpen" :title="isOpen ? 'Colapsar' : 'Expandir'">
            {{ isOpen ? '▾' : '▸' }}
          </button>
          <span v-else class="caretPlaceholder" />

          <!-- contenido -->
          <div class="treeContent">
            <div class="treeMainInfo">
              <AppAvatar :avatar="unit.userAvatar" :name="unit.userName || unit.name" size="sm" />

              <div class="treeMainText">
                <div class="treeTitle">
                  <span class="treeName">{{ unit.name }}</span>

                  <span class="badge" :class="isRoot ? 'badge--root' : 'badge--child'">
                    {{ isRoot ? 'Padre' : `Nivel ${level}` }}
                  </span>

                  <span class="badge badge--type" :title="typeLabel">
                    {{ typeCode ? `${typeCode} · ${typeLabel}` : typeLabel }}
                  </span>
                </div>

                <small class="treeDirector">
                  {{ unit.userName || 'Sin director asignado' }}
                </small>

                <small v-if="hasDescription" class="treeDesc">
                  {{ unit.description }}
                </small>

                <div class="treeSub">
                  <small v-if="hasChildren" class="treeCount"> · {{ unit.children.length }} hijo(s) </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="buttons-card">
        <div class="button-right"></div>
        <div class="button-left">
          <AppCheckPermission permission="institutionalConfiguration.organizationalStructure.create">
            <AppButton v-if="canCreateChild" @click="$emit('add-child', unit.id)" v-tooltip="createTooltip" variant="primary" outlined icon="plus"> </AppButton>
          </AppCheckPermission>
          <AppCheckPermission permission="institutionalConfiguration.organizationalStructure.edit">
            <AppButtonEdit @click="$emit('edit', unit.id)"></AppButtonEdit>
          </AppCheckPermission>

          <AppCheckPermission permission="institutionalConfiguration.organizationalStructure.delete">
            <AppButtonDelete @click="$emit('remove', unit.id)"></AppButtonDelete>
          </AppCheckPermission>
        </div>
      </div>
    </div>

    <!-- hijos -->
    <div v-if="isOpen && hasChildren" class="treeChildren">
      <OrganizationalStructureTreeRow
        v-for="child in unit.children"
        :key="child.id"
        :unit="child"
        :level="level + 1"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @remove="$emit('remove', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';

type OrgEntityType = 'campus' | 'faculty' | 'department' | 'program';

const ENTITY_LABELS: Record<OrgEntityType, string> = {
  campus: 'Sede',
  faculty: 'Facultad',
  department: 'Departamento',
  program: 'Programa',
};

const ENTITY_TYPE_TO_CODE: Record<OrgEntityType, string> = {
  campus: 'S',
  faculty: 'F',
  department: 'D',
  program: 'P',
};

export interface OrgType {
  id?: number;
  name?: string;
  code?: string;
  description?: string | null;
}

export interface OrgUnitTree {
  id: string;
  entityType?: OrgEntityType | null;
  name: string;
  code?: string;
  description?: string;
  organizationType?: OrgType | null;
  roleId?: number | null;
  userId?: number | null;
  roleName?: string | null;
  userName?: string | null;
  userAvatar?: string | null;
  parentId: string | null;
  children: OrgUnitTree[];
}

export interface OrgUnit {
  id: string;
  entityType?: OrgEntityType | null;
  name: string;
  description?: string | null;
  children: OrgUnit[];
  organizationType?: OrgType | null;
  roleId?: number | null;
  userId?: number | null;
  roleName?: string | null;
  userName?: string | null;
  userAvatar?: string | null;
}

export default defineComponent({
  name: 'OrganizationalStructureTreeRow',
  components: {
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    AppCheckPermission,
    AppAvatar,
  },

  props: {
    unit: { type: Object, required: true },
    level: { type: Number, required: true },
  },

  emits: ['add-child', 'edit', 'remove'],

  setup(props) {
    const isOpen = ref(true);

    const isRoot = computed(() => props.level === 0);
    const hasChildren = computed(() => (props.unit.children?.length ?? 0) > 0);

    const typeLabel = computed(() => props.unit.organizationType?.name ?? (props.unit.entityType ? ENTITY_LABELS[props.unit.entityType] : 'Sin tipo'));
    const typeCode = computed(() => {
      const code = String(props.unit.organizationType?.code ?? '')
        .trim()
        .toUpperCase();

      if (code) return code;
      if (!props.unit.entityType) return '';
      return ENTITY_TYPE_TO_CODE[props.unit.entityType];
    });
    const hasDescription = computed(() => !!props.unit.description);
    const canCreateChild = computed(() => ['campus', 'faculty', 'department'].includes(props.unit.entityType ?? ''));
    const createTooltip = computed(() => {
      if (props.unit.entityType === 'campus') return 'Crear facultad';
      if (props.unit.entityType === 'faculty') return 'Crear departamento';
      if (props.unit.entityType === 'department') return 'Crear programa';
      return '';
    });

    return {
      isOpen,
      isRoot,
      hasChildren,
      typeLabel,
      typeCode,
      hasDescription,
      canCreateChild,
      createTooltip,
    };
  },
});
</script>

<style scoped>
.treeItem {
  margin-bottom: 10px;
}

.treeRow {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 10px;
  padding: 14px 14px;
  border-radius: 16px;
  border: 1px solid #eee;
  background: #fff;
}

.treeRow--root {
  background: white;
  border-color: var(--color-secondary);
}

.treeRow--child {
  background: #fff;
}

.treeCell.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}

.treeIndent {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ====== líneas del árbol ====== */
.treeLines {
  position: absolute;
  left: 10px;
  top: 50%;
  width: calc(100% - 10px);
  height: 1px;
  pointer-events: none;
}

/* línea vertical (tronco) */
.treeIndent::before {
  content: '';
  position: absolute;
  left: 10px;
  top: -14px;
  bottom: -14px;
  width: 2px;
  background: #eaeaea;
  border-radius: 99px;
}

/* elbow: conecta tronco -> contenido */
.treeIndent::after {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  width: 14px;
  height: 2px;
  background: #eaeaea;
  border-radius: 99px;
}

/* si es root, no dibujes tronco */
.treeRow--root .treeIndent::before,
.treeRow--root .treeIndent::after {
  opacity: 0;
}

/* ====== caret ====== */
.caret {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid #e9e9e9;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.caretPlaceholder {
  display: inline-block;
  width: 30px;
  height: 30px;
}

/* ====== contenido ====== */
.treeContent {
  display: grid;
  gap: 4px;
}

.treeTitle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.treeName {
  font-weight: 700;
  font-size: 15px;
}

.treeSub {
  display: flex;
  gap: 10px;
  color: #666;
  font-size: 12px;
}

.treeId {
  color: #6b7280;
}

.treeCount {
  color: #6b7280;
}

/* ====== badges ====== */
.badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
}

.badge--root {
  background: var(--color-primary);
  color: white;
}

.badge--child {
  background: #f2f4f7;
  border-color: #e5e7eb;
  color: #374151;
}

/* ====== children container ====== */
.treeChildren {
  margin-top: 10px;
}

/* ====== botones ====== */
.mini {
  padding: 6px 10px;
  border-radius: 12px;
  border: 1px solid #e6e6e6;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}
.mini.danger {
  border-color: var(--color-secondary);
  color: white;
}
.buttons-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.button-righ {
  display: flex;
  justify-content: space-between;
}

.button-left {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.treeDesc {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.2;
  max-width: 680px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge--type {
  background: var(--color-secondary);
  color: white;
}

.badge--manager {
  background: #fdf2f2;
  border-color: #fca5a5;
  color: #991b1b;
  font-weight: 600;
  margin-left: 4px;
}
/* =======================
   BASE: MOBILE FIRST
   ======================= */
.treeRow {
  display: grid;
  grid-template-columns: 1fr; /* mobile: 1 columna */
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #eee;
  background: #fff;
}

.treeCell {
  min-width: 0; /* clave para evitar overflow */
}

.treeIndent {
  min-width: 0;
  width: 100%;
}

.treeContent {
  min-width: 0;
}

.treeTitle {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap; /* badges bajan a otra línea */
  min-width: 0;
}

.treeName {
  font-weight: 700;
  font-size: 15px;
  min-width: 0;
  flex: 1 1 100%; /* en móvil: el nombre ocupa toda la fila */
  word-break: break-word;
}

.badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  white-space: nowrap;
}

/* descripción: en móvil NO la recortes con nowrap */
.treeDesc {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.2;
  max-width: 100%;
  white-space: normal; /* <-- antes tenías nowrap */
  overflow: visible;
  text-overflow: initial;
  word-break: break-word;
}

/* botones: en móvil se van abajo y alineados a la derecha */
.buttons-card {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.button-left {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap; /* si no caben, saltan */
}

/* =======================
   TABLET / DESKTOP
   ======================= */
@media (min-width: 768px) {
  .treeRow {
    grid-template-columns: 1fr 220px; /* vuelve a tu layout original */
    align-items: center;
  }

  .treeName {
    flex: 0 1 auto; /* vuelve a comportarse normal */
  }

  .treeDesc {
    max-width: 680px; /* si quieres el recorte en desktop */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.treeMainInfo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.treeMainText {
  min-width: 0;
  flex: 1;
}

.treeDirector {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  word-break: break-word;
}
</style>
