import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { getDownloadLink } from '@/apis/game'
import { useModalStore } from '@/stores/modal'

export function useDownload() {
  const walletStore = useWalletStore()
  const userStore = useUserStore()
  const modalStore = useModalStore()

  const isLogined = computed(() => userStore.account.username)
  const hasAddress = computed(() => walletStore.wallet.address)

  const donwload = () => {
    getDownloadLink().then((res: any) => {
      // 直接打开下载链接不行，需要用a标签来触发下载
      if (res.downloadLink) {
        const a = document.createElement('a')
        a.href = res.downloadLink
        a.target = '_blank'
        document.body.appendChild(a) // 添加到文档中以确保可以被点击
        a.click()
        document.body.removeChild(a) // 完成后移除
      } else {
        console.error('Download link is undefined or invalid.')
      }
    })
  }

  const handleDownload = () => {
    if (!isLogined.value) {
      modalStore.toggleLoginEntryModal(true)
      modalStore.setLoginEntryConnectType('login')
      modalStore.setLoginEntryType('all')
    }
    // 1.3. 当用户登录且连接钱包时：按钮边上的提示变成”0/500 Download Slots Remaining“，计数显示剩余可用下载量。
    else {
      donwload()
    }
  }

  return {
    isLogined,
    hasAddress,
    handleDownload,
    donwload
  }
}
