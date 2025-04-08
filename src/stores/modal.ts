import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    isSignInModalVisible: false,
    isWelcomeModalVisible: false,
    isRegisterModalVisible: false,
    isWelcomeModalSignUpMode: false // 添加isWelcomeModalSignUpMode状态，仅仅用于welcome modal
  }),
  actions: {
    // 更新方法来同时设置模态框可见性和isWelcomeModalSignUpMode
    toggleWelcomeModal(show = true, signUpMode = false) {
      this.isWelcomeModalVisible = show
      this.isWelcomeModalSignUpMode = signUpMode
    },
    toggleRegisterModal(show = true) {
      this.isRegisterModalVisible = show
    },
    toggleSignInModal(show = true) {
      this.isSignInModalVisible = show
    }
  }
})
