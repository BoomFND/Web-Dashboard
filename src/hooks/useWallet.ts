import { useConnect, useDisconnect, useSignMessage, useChainId, useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useChains } from '@wagmi/vue'
import { useWallet as useSolanaWallet } from 'solana-wallets-vue'
import { useWalletStore } from '@/stores/wallet'
import { useNftStore } from '@/stores/nft'
import { useUserStore } from '@/stores/user'
import { useModalStore, type LoginEntryConnectType } from '@/stores/modal'
import { usePointsStore } from '@/stores/points'
import { message } from 'ant-design-vue'
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import type { EvmWallet, Wallet } from '@/types/wallet'
import { opBNB, opBNBTestnet } from 'viem/chains'
import { abi as checkInAbi } from '@/abis/opBNBCheckIn'

// 常量定義，避免重複字符串
const SIGNATURE_MESSAGE = 'You hereby confirm that you are the owner of this connected wallet. This is a safe and gasless transaction to verify your ownership. \n\nSigning this message will not give GamerBoom permission to make transactions with your wallet.'
const WALLET_DOWNLOAD_URLS = {
  metaMaskSDK: 'https://metamask.io/download',
  okxWallet: 'https://www.okx.com/download',
  binanceWallet: 'https://www.bnbchain.org/en/binance-wallet',
  coinbaseWallet: 'https://www.coinbase.com/wallet/downloads',
  walletConnect: 'https://walletconnect.com/downloads',
  Phantom: 'https://phantom.app/download',
  Solflare: 'https://solflare.com/download',
  OKX: 'https://www.okx.com/download',
  OKXWallet: 'https://www.okx.com/download',
  'OKX Wallet': 'https://www.okx.com/download',
  Binance: 'https://www.bnbchain.org/en/binance-wallet',
  Coinbase: 'https://www.coinbase.com/wallet/downloads'
}

export function useWallet() {
  const walletStore = useWalletStore()
  const pointsStore = usePointsStore()
  const nftStore = useNftStore()
  const userStore = useUserStore()
  const modalStore = useModalStore()
  const { connectAsync, connectors } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { signMessageAsync } = useSignMessage()
  const chainId = useChainId()
  const chains = useChains()
  const account = useAccount()
  const {
    connect,
    signMessage: signMessageOfSolana,
    wallets: solanaWallets,
    wallet: solanaWallet,
    select,
    ready,
    publicKey,
    connected,
    disconnect: disconnectSolana
  } = useSolanaWallet()

  // 獲取當前EVM地址
  const getCurrentAddress = (): string => {
    return account.address?.value?.toString() ?? ''
  }

  // 獲取編碼的簽名消息
  const getEncodedSignatureMessage = (): Uint8Array => {
    return new TextEncoder().encode(SIGNATURE_MESSAGE)
  }

  // 設置錢包信息並獲取相關數據
  const setWallet = async (): Promise<void> => {
    try {
      await walletStore.setWallet({
        chainId: chainId.value,
        address: getCurrentAddress()
      })
      message.success('Connected successful!')
      await Promise.all([
        userStore.fetchAccountInfo(),
        nftStore.fetchWalletInfo(getCurrentAddress())
      ])
    } catch (error) {
      console.error('Error setting wallet:', error)
      message.error('Failed to set wallet information')
    }
  }

  // 打開錢包下載頁面
  const openWalletDownloadPage = (walletType: string): void => {
    const url = WALLET_DOWNLOAD_URLS[walletType as keyof typeof WALLET_DOWNLOAD_URLS]
    if (url) {
      window.open(url, '_blank')
    }
  }

  // 連接以太坊錢包
  const connectWallet = async (wallet: EvmWallet, type?: LoginEntryConnectType): Promise<void> => {
    // 檢查是否綁定
    if (!userStore.account.walletAddress && type !== 'bind' && type !== 'login') {
      modalStore.toggleBindNewWalletModal(true)
      modalStore.setBindNewWalletType('evm')
      return
    }

    // 檢查是否需要切換地址
    if (
      !!userStore.account.walletAddress &&
      !!getCurrentAddress() &&
      userStore.account.walletAddress !== getCurrentAddress()
    ) {
      return modalStore.toggleSwitchAddressModal(true)
    }

    // 如果錢包插件已登錄，但網站未登錄，則先斷開連接，然後再重新登錄網站
    if (!userStore.accessToken && getCurrentAddress()) {
      await disconnectAsync()
    }

    const connector = connectors.find((connector) => connector.id === wallet)
    if (!connector) {
      message.error(`Connector ${wallet} not found`)
      return
    }

    try {
      // 先斷開現有連接
      await disconnectAsync()
      await connectAsync({ connector, chainId: chainId.value })

      // 簽名函數
      const signWalletMessage = async () => {
        try {
          await signMessageAsync({
            account: getCurrentAddress() as `0x${string}`,
            connector: connector,
            message: SIGNATURE_MESSAGE
          }, {
            onSuccess: async () => {
              if (!type || type === 'login' || type === 'bind') {
                // 获取AccessToken
                await setWallet()
              }
            }
          })
        } catch (error: any) {
          console.error('Signing error:', error)
          message.error('Failed to sign message')
          throw error
        }
      }

      // 如果chain不支持，則添加鏈，如果鏈不支持，則提示錯誤，如果支持，則簽名
      const chain = chains.value.find((chain) => chain.id === connector.chainId)
      if (!chain) {
        const newChain = chains.value.find((chain) => chain.id === chainId.value)
        if (newChain) {
          await switchChainAsync({
            connector,
            chainId: newChain.id
          }, {
            onSuccess: async () => {
              await signWalletMessage()
            }
          })
        } else {
          message.error('Chain not supported')
          return
        }
      } else {
        await signWalletMessage()
      }
    } catch (error: any) {
      console.error('Connection error:', error)

      // 提取錯誤消息
      const errorMessage = error?.message || 'Failed to connect wallet'
      message.error(errorMessage)

      // 錢包未安裝處理
      if (errorMessage.includes('Provider not found')) {
        openWalletDownloadPage(wallet)
      }
    }
  }

  // 斷開所有錢包連接
  const disconnectWallet = async (): Promise<void> => {
    try {
      if (walletStore.wallet.address) {
        await disconnectAsync()
      }

      await disconnectSolana()

      // 清空所有存儲
      walletStore.emptyWallet()
      userStore.clearAll()
      pointsStore.emptyPoints()

      // message.success('Disconnected successful!')
    } catch (error) {
      console.error('Disconnect error:', error)
      message.error('Failed to disconnect wallet')
    }
  }

  // 獲取Phantom錢包
  const getPhantomWallet = () => {
    // 如果已經有Phantom錢包連接
    if (solanaWallet.value) {
      // 如果錢包未安裝，則打開下載頁面
      if (solanaWallet.value.readyState === 'NotDetected') {
        openWalletDownloadPage('Phantom')
        return null
      }
      return solanaWallet.value
    }

    // 尋找Phantom錢包
    const wallet = solanaWallets.value.find((wallet) => wallet.adapter.name === 'Phantom')
    if (!wallet) return null

    if (wallet.readyState === 'NotDetected') {
      openWalletDownloadPage('Phantom')
      return null
    } else if (wallet.readyState === 'Installed') {
      select(wallet.adapter.name)
      return wallet
    }

    return null
  }

  // 連接Phantom錢包（帶有超時選項）
  const connectPhantomOnly = async (needSignMessage: boolean = true, timeoutMs: number = 30000): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // 獲取Phantom錢包
      getPhantomWallet()

      // 設置超時處理
      const timeout = setTimeout(() => {
        clearInterval(interval)
        reject(new Error('Connection timeout'))
      }, timeoutMs)

      // 輪詢，直到Phantom錢包連接成功
      const interval = setInterval(async () => {
        if (solanaWallet.value && ready.value) {
          try {
            await connect()

            if (connected.value) {
              clearInterval(interval)
              clearTimeout(timeout)

              if (needSignMessage && signMessageOfSolana.value) {
                try {
                  await signMessageOfSolana.value(getEncodedSignatureMessage())
                  resolve(true)
                } catch (error) {
                  console.error('Failed to sign message:', error)
                  reject(error)
                }
              } else {
                resolve(true)
              }
            }
          } catch (error) {
            clearInterval(interval)
            clearTimeout(timeout)
            reject(error)
          }
        }
      }, 300)
    })
  }

  // 連接Solana錢包（無登錄操作）
  const connectSolanaOnly = async (wallet: Wallet): Promise<boolean> => {
    if (['NotDetected', 'Loadable'].includes(wallet.readyState)) {
      openWalletDownloadPage(wallet.adapter.name)
      throw new Error(`${wallet.adapter.name} wallet not detected`)
    }

    try {
      // 如果是同一個錢包，直接連接
      if (wallet.adapter.name === solanaWallet.value?.adapter.name) {
        await solanaWallet.value?.adapter.connect()
      } else {
        // 否則斷開現有連接，選擇新錢包並連接
        await disconnectSolana()
        select(wallet.adapter.name)
        await wallet?.adapter.connect()
      }

      // 簽名確認
      if (signMessageOfSolana.value) {
        await signMessageOfSolana.value(getEncodedSignatureMessage())
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error)
      throw error
    }
  }

  // 連接Solana錢包並登錄
  const connectSolana = async (wallet: Wallet, type?: LoginEntryConnectType): Promise<boolean> => {
    try {
      await connectSolanaOnly(wallet)

      // 檢查是否綁定
      if (!userStore.account.solanaAddress && type !== 'bind' && type !== 'login') {
        modalStore.toggleBindNewWalletModal(true)
        modalStore.setBindNewWalletType('solana')
        return true
      }

      // 檢查是否需要切換地址
      if (
        !!userStore.account.solanaAddress &&
        !!publicKey.value?.toBase58() &&
        userStore.account.solanaAddress !== publicKey.value?.toBase58()
      ) {
        modalStore.toggleSwitchAddressModal(true)
        modalStore.setSwitchAddressType('solana')
        return true
      }

      // 登錄
      if (publicKey.value && (!type || type === 'login')) {
        await walletStore.loginSolanaWallet(publicKey.value.toBase58())
        message.success('Solana wallet connected successfully')
        return true
      }

      throw new Error('Failed to get Solana public key')
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error)
      message.error('Failed to connect Solana wallet')
      throw error
    }
  }

  // 綁定Solana錢包
  const bindSolana = async (wallet: Wallet): Promise<boolean> => {
    try {
      await connectSolanaOnly(wallet)

      if (publicKey.value) {
        await walletStore.bindSolanaWallet(publicKey.value.toBase58())
        message.success('Bind successful!')
        return true
      }

      throw new Error('Failed to get Solana public key')
    } catch (error) {
      console.error('Failed to bind Solana wallet:', error)
      message.error('Failed to bind Solana wallet')
      throw error
    }
  }

  // 使用Phantom錢包進行簽到
  const checkInWithPhantom = async (): Promise<string> => {
    try {
      // 檢查是否綁定Solana錢包
      if (!userStore.account.solanaAddress) {
        modalStore.toggleBindNewWalletModal(true)
        modalStore.setBindNewWalletType('solana')
        throw new Error('Please bind your Solana wallet first')
      }

      // 檢查是否連接Solana錢包
      if (!connected.value || !publicKey.value) {
        modalStore.toggleLoginEntryModal(true)
        modalStore.setLoginEntryConnectType('connect')
        modalStore.setLoginEntryType('solana')
        throw new Error('Phantom wallet not connected')
      }

      // 檢查綁定的錢包地址是否正確
      if (
        !!userStore.account.solanaAddress &&
        !!publicKey.value.toBase58() &&
        userStore.account.solanaAddress !== publicKey.value.toBase58()
      ) {
        modalStore.toggleSwitchAddressModal(true)
        modalStore.setSwitchAddressType('solana')
        throw new Error('Please switch to the correct wallet')
      }
      // 顯示加載狀態
      message.loading({ content: 'Processing check-in...', key: 'checkInStatus' });

      // 創建Solana連接
      const rpc = import.meta.env.VITE_APP_RPC || 'https://api.devnet.solana.com'
      const connection = new Connection(rpc, 'confirmed')

      // 創建Memo程序的指令
      const memoProgram = new PublicKey('FT76o9KjJCXuznwVy699ebwQkDsCxXhbAauoUQH4hov8')
      const checkInMessage = `GamerBoom Daily Check-in on Solana!`

      const instruction = new TransactionInstruction({
        keys: [],
        programId: memoProgram,
        data: Buffer.from(checkInMessage)
      })

      // 創建交易
      const transaction = new Transaction().add(instruction)

      // 獲取最新的blockhash並設置交易參數
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.lastValidBlockHeight = lastValidBlockHeight
      transaction.feePayer = publicKey.value

      // 發送交易進行簽名
      const signedTx = await (solanaWallet.value?.adapter as any).signTransaction(transaction)
      if (!signedTx) {
        message.error('Transaction signing failed')
        throw new Error('Transaction signing failed')
      }

      // 發送交易並等待確認
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature, 'confirmed')

      message.success('Check-in Success!')
      return signature
    } catch (error) {
      console.error('Check-in failed:', error)
      throw error;
    }
  }

  // 定義常量
  const EVM_NETWORK_CONFIG = {
    production: {
      chainId: opBNB.id,
      networkName: 'opBNB Mainnet'
    },
    development: {
      chainId: opBNBTestnet.id,
      networkName: 'opBNB Testnet'
    }
  };

  // 獲取當前EVM環境配置
  const getCurrentEVMNetwork = () => {
    const isProduction = import.meta.env.VITE_APP_ENV === 'production';
    return isProduction ? EVM_NETWORK_CONFIG.production : EVM_NETWORK_CONFIG.development;
  };

  const { data: checkInHash, writeContractAsync, reset, isSuccess: isCheckInSuccess } = useWriteContract()
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: checkInReceipt,
  } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash: checkInHash,
    query: {
      enabled: !!checkInHash && isCheckInSuccess,
    }
  });

  // 在EVM鏈上進行簽到
  const checkInWithEVM = async () => {
    // 檢查是否綁定EVM錢包
    if (!userStore.account.walletAddress) {
      modalStore.toggleBindNewWalletModal(true)
      modalStore.setBindNewWalletType('evm')
      throw new Error('Please bind your EVM wallet first')
    }

    // 檢查是否連接EVM錢包
    if (!account.address?.value) {
      modalStore.toggleLoginEntryModal(true)
      modalStore.setLoginEntryConnectType('connect')
      modalStore.setLoginEntryType('evm')
      throw new Error('Please connect your EVM wallet first')
    }

    // 檢查綁定的錢包地址是否正確
    if (
      !!userStore.account.walletAddress &&
      !!getCurrentAddress() &&
      userStore.account.walletAddress !== getCurrentAddress()
    ) {
      modalStore.toggleSwitchAddressModal(true)
      modalStore.setSwitchAddressType('evm')
      throw new Error('Please switch to the correct wallet')
    }

    const { chainId: targetChainId, networkName } = getCurrentEVMNetwork();
    const contractAddress = import.meta.env.VITE_APP_OPBNB_CHECKIN_CONTRACT;

    try {
      reset()
      // 顯示加載狀態
      message.loading({ content: 'Processing check-in...', key: 'checkInStatus' });

      // 驗證錢包連接狀態
      if (!account.address?.value) {
        message.error('Wallet not connected')
        throw new Error('Wallet not connected');
      }

      // 檢查並切換到正確網絡
      if (chainId.value !== targetChainId) {
        message.loading({ content: `Switching to ${networkName}...`, key: 'checkInStatus' });

        try {
          await switchChainAsync({ chainId: targetChainId });
        } catch (switchError) {
          console.error(`Failed to switch network. Please manually switch to ${networkName}`);
          throw new Error(`Failed to switch network. Please manually switch to ${networkName}`);
        }
      }

      // 請求用戶簽名
      message.loading({ content: 'Please sign the message...', key: 'checkInStatus' });
      const signature = await signMessageAsync({
        account: account.address?.value as `0x${string}`,
        message: SIGNATURE_MESSAGE
      });

      // 發送交易
      message.loading({ content: 'Sending transaction...', key: 'checkInStatus' });
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: checkInAbi,
        functionName: "checkIn",
        args: [signature],
        account: account.address?.value,
        chainId: targetChainId,
      }, {
        onSuccess: async (txHash) => {
          console.log('Transaction sent:', txHash);
          isConfirming && message.loading({ content: 'Confirming transaction...', key: 'checkInStatus' });

          // 等待交易確認
          await isConfirmed && checkInReceipt;
          message.success({
            content: 'Check-in successful! Transaction hash: ' + txHash,
            key: 'checkInStatus'
          });
        }
      });
    } catch (error: any) {
      console.error('Check-in process failed:', error);
      throw error;
    }
  };

  return {
    connectors,
    solanaWallets,
    connectWallet,
    disconnectWallet,
    connectSolana,
    bindSolana,
    checkInWithPhantom,
    checkInWithEVM,
    connectPhantomOnly,
  }
}
