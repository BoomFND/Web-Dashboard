import { defineStore } from 'pinia'

export type BindNewWalletType = 'evm' | 'solana' | 'new';
export type ConnectWalletType = 'evm' | 'solana';
export type ProfileWalletType = BindNewWalletType | 'new';
export type ProfileType = 'setting' | 'wallet' | 'email' | 'social';

export type LoginEntryType = 'solana' | 'evm' | 'social' | 'all';
export type LoginEntryConnectType = 'login' | 'bind' | 'connect';

export const useModalStore = defineStore('modal', {
  state: () => ({
    isSignInModalVisible: false,
    isWelcomeModalVisible: false,
    isRegisterModalVisible: false,
    isWelcomeModalSignUpMode: false, // 添加isWelcomeModalSignUpMode状态，仅仅用于welcome modal
    isSwitchAddressVisible: false,
    isBindNewWalletVisible: false,
    isConnectWalletVisible: false,
    isLoginEntryVisible: false,
    isProfileModalVisible: false,

    profileType: 'setting' as ProfileType,
    profileWalletType: 'evm' as ProfileWalletType,

    bindNewWalletType: 'new' as BindNewWalletType,
    connectWalletType: 'solana' as ConnectWalletType,

    loginEntryType: 'all' as LoginEntryType,
    loginEntryConnectType: 'login' as LoginEntryConnectType,

    switchAddressType: 'evm' as ConnectWalletType,
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
    },
    toggleSwitchAddressModal(show = true) {
      this.isSwitchAddressVisible = false
      this.isSwitchAddressVisible = show
    },
    toggleBindNewWalletModal(show = true) {
      this.isBindNewWalletVisible = false
      this.isBindNewWalletVisible = show
    },
    toggleConnectWalletModal(show = true) {
      this.isConnectWalletVisible = false
      this.isConnectWalletVisible = show
    },
    toggleLoginEntryModal(show = true) {
      this.isLoginEntryVisible = false
      this.isLoginEntryVisible = show
    },
    toggleProfileModal(show = true) {
      this.isProfileModalVisible = false
      this.isProfileModalVisible = show
    },

    setProfileType(type: ProfileType) {
      this.profileType = type
    },
    setProfileWalletType(type: ProfileWalletType) {
      this.profileWalletType = type
    },

    setBindNewWalletType(type: BindNewWalletType) {
      this.bindNewWalletType = type
    },

    setConnectWalletType(type: ConnectWalletType) {
      this.connectWalletType = type
    },

    setLoginEntryType(type: LoginEntryType) {
      this.loginEntryType = type
    },
    setLoginEntryConnectType(type: LoginEntryConnectType) {
      this.loginEntryConnectType = type
    },

    setSwitchAddressType(type: ConnectWalletType) {
      this.switchAddressType = type
    },
  }
})
