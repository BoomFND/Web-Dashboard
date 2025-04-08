export function useNumberFormat() {
  // 数字格式化
  const formatNumber = computed(() => {
    return (number: number | string) => {
      if (!number) return '--'
      return (number + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  })

  return {
    formatNumber
  }
}
