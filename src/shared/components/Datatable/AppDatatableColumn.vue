<template>
  <o-table-column v-bind="propsColumn">
    <template v-if="isCheck" v-slot:header>
      <input
        class="form-check-input"
        type="checkbox"
        @click="handleCheckChange"
        :checked="isAllSelected()"
      />
    </template>
    <template v-else v-slot:header>
      {{ propsColumn.label }}
    </template>
    <template v-slot="props">
      <slot v-bind="props"></slot>
    </template>
  </o-table-column>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCheckDataTableStore } from '../../../stores/checkDataTable.store';

export default defineComponent({
  name: 'AppDatatableColumn',
  props: {
    label: String,
    customKey: [String, Number],
    field: String,
    meta: [String, Number, Boolean, Function, Object, Array],
    width: [Number, String],
    numeric: Boolean,
    position: {
      type: String,
      validator(value: string) {
        return ['left', 'centered', 'right'].indexOf(value) > -1;
      },
    },
    searchable: Boolean,
    sortable: Boolean,
    visible: {
      type: Boolean,
      default: true,
    },
    customSort: Function,
    customSearch: Function,
    sticky: Boolean,
    headerSelectable: Boolean,
    thAttrs: {
      type: Function,
      default: () => ({}),
    },
    tdAttrs: {
      type: Function,
      default: () => ({}),
    },
    subheading: String,
    isCheck: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const checkStore = useCheckDataTableStore();

    const propsColumn = {
      ...props,
      label: props.label ? t(props.label) : '',
    };
    // Función para verificar si todos los elementos de la tabla están seleccionados
    const isEqualObjects = (obj1: any, obj2: any) => {
      const obj1Keys = Object.keys(obj1);
      const obj2Keys = Object.keys(obj2);

      if (obj1Keys.length !== obj2Keys.length) {
        return false;
      }

      return obj1Keys.every((key) => obj1[key] === obj2[key]);
    };
    const isAllSelected = () => {
      return (
        (checkStore.isCheckData?.dataTable?.data?.length > 0 ? checkStore.isCheckData?.dataTable?.data?.length > 0 : checkStore.isCheckData?.dataTable?.data?.total > 0 )&&
        checkStore.isCheckData.dataTable.data.every((dataitem: any) => {
          return checkStore.isCheckData.dataTableSelect.some(
            (selectedItem: any) => isEqualObjects(dataitem, selectedItem)
          );
        })
      );
    };
    const handleCheckChange = () => {
      isAllSelected();
      if (!checkStore.isCheckData.selectedAll) {
        const newData = checkStore.isCheckData.dataTable.data.filter(
          (item: any) => {
            const isSelected = checkStore.isCheckData.dataTableSelect.some(
              (selectedItem: any) => selectedItem.id === item.id
            );
            return !isSelected;
          }
        );
        const updatedSelectedData = [
          ...checkStore.isCheckData.dataTableSelect,
          ...newData,
        ];
        checkStore.isCheckData.dataTableSelect = updatedSelectedData;
      } else {
        const newData = checkStore.isCheckData.dataTableSelect.filter(
          (item: any) => {
            const isInTable =
              checkStore.isCheckData.dataTable.data.some(
                (dataItem: any) => dataItem.id === item.id
              );
            return !isInTable;
          }
        );
        checkStore.isCheckData.dataTableSelect = newData;
      }
      checkStore.isCheckData.selectedAll = !checkStore.isCheckData.selectedAll;
      console.log('isCheckData', checkStore.isCheckData);
    };

    return {
      propsColumn,
      isCheck: props.isCheck,
      handleCheckChange,
      isAllSelected,
    };
  },
});
</script>

<style scoped></style>
