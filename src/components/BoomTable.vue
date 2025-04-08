<script lang="ts" setup>
interface Column {
  title: string
  dataIndex: string
  width?: string
  align?: 'left' | 'right' | 'center'
}

interface Data {
  [key: string]: any
}

interface Props {
  columns: Array<Column>
  data: Array<Data>
}

const props = defineProps<Props>()

const customStyle = computed(() => {
  return (column: Column) => {
    const style: Record<string, string> = {}
    if (column.width) {
      style.width = column.width
      style.flex = 'none'
    }
    if (column.align === 'left') {
      style.justifyContent = 'flex-start'
    } else if (column.align === 'right') {
      style.justifyContent = 'flex-end'
    } else {
      style.justifyContent = 'center'
    }
    return style
  }
})
</script>

<template>
  <div class="table">
    <div class="table-header">
      <div
        class="th-item"
        v-for="column in props.columns"
        :key="column.dataIndex"
        :style="customStyle(column)"
      >
        <slot>{{ column.title }}</slot>
      </div>
    </div>
    <div class="table-body">
      <div
        class="tb-row"
        :class="{ highlight: row.isSelf }"
        v-for="(row, index) in props.data"
        :key="index"
      >
        <div
          class="tb-col th-item"
          v-for="column in props.columns"
          :key="column.dataIndex"
          :style="customStyle(column)"
        >
          <slot :name="column.dataIndex" v-bind="row">
            {{ row[column.dataIndex] }}
          </slot>
        </div>
      </div>
      <slot name="empty"></slot>
    </div>
    <div class="table-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .table-header,
  .table-body,
  .table-footer {
    display: flex;
    width: 100%;
  }

  .table-header {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 700;
    line-height: 120%; /* 16.8px */
    text-transform: uppercase;
  }

  .table-body {
    flex-direction: column;
    flex: 1;
  }

  .tb-row {
    margin-top: 24px;
    display: flex;
    align-items: center;

    height: 38px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    font-weight: 700;
    line-height: 120%; /* 19.2px */
    text-transform: capitalize;

    &.highlight {
      color: #f4dca5 !important;

      :deep(.ranking),
      :deep(.points) {
        color: #f4dca5;
      }
    }
  }

  .th-item {
    display: flex;
    align-items: center;
    flex: 1;
    font-weight: 600;
  }
}
</style>
