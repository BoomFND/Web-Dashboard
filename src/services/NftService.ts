import Web3 from 'web3'
import { notifyBlockchainOperation } from '@/apis/assets'
import { useWalletStore } from '@/stores/wallet'
import { useNftStore } from '@/stores/nft'
import { message } from 'ant-design-vue'
import type { WalletType } from '@/types/models'

// 封装成一个切换网络的函数
export async function switchNetwork(targetChainId: string): Promise<boolean> {
  if (window.ethereum) {
    try {
      const web3 = new Web3(window.ethereum)
      const currentChainId = await web3.eth.getChainId()
      if (currentChainId.toString() !== targetChainId) {
        const chainIdInt = parseInt(targetChainId, 10) // 将字符串转换为整数
        const hexChainId = Web3.utils.toHex(chainIdInt) // 将整数转换为十六进制字符串
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }]
          })
        } catch (switchError: any) {
          // 如果链未被识别，添加新链
          if (switchError.code === 4902) {
            let chainName: string | undefined
            let currencyName: string | undefined
            let currencySymbol: string | undefined
            let rpcUrls: string[] | undefined
            let blockExplorerUrls: string[] | undefined
            if (targetChainId == '200810') {
              chainName = 'Bitlayer Testnet'
              currencyName = 'BTC'
              currencySymbol = 'BTC'
              rpcUrls = ['https://testnet-rpc.bitlayer.org']
              blockExplorerUrls = ['https://testnet-scan.bitlayer.org']
            } else if (targetChainId == '200901') {
              chainName = 'Bitlayer Mainnet'
              currencyName = 'BTC'
              currencySymbol = 'BTC'
              rpcUrls = [
                'https://rpc.bitlayer.org',
                'https://rpc.bitlayer-rpc.com',
                'https://rpc.ankr.com/bitlayer'
              ]
              blockExplorerUrls = ['https://www.btrscan.com']
            } else if (targetChainId == '204') {
              chainName = 'opBNB Mainnet'
              currencyName = 'BNB'
              currencySymbol = 'BNB'
              rpcUrls = ['https://opbnb-mainnet-rpc.bnbchain.org', 'https://opbnb-rpc.bnbchain.org']
              blockExplorerUrls = ['https://opbnb.bscscan.com']
            }

            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: hexChainId,
                    chainName: chainName, // 链名称
                    nativeCurrency: {
                      name: currencyName,
                      symbol: currencySymbol, // 货币符号
                      decimals: 18
                    },
                    rpcUrls: rpcUrls, // RPC URL
                    blockExplorerUrls: blockExplorerUrls // 区块浏览器 URL
                  }
                ]
              })
              // 添加成功后再次切换网络
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }]
              })
            } catch (addError) {
              console.error('Failed to add network:', addError)
              return false // 添加网络失败
            }
          } else {
            console.error('Failed to switch network:', switchError)
            return false // 切换网络失败
          }
        }
      }
      return true // 网络切换成功或已在目标网络
    } catch (error) {
      console.error('Failed to switch network:', error)
      return false // 网络切换失败
    }
  } else {
    console.error('Ethereum object not found!')
    return false // Ethereum对象未找到
  }
}

// 假设这是signGenesisProof函数，用于用户签名
export async function signGenesisProof(nftId: number, nftStore: any) {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const web3 = new Web3(window.ethereum)
      const accounts = await web3.eth.getAccounts()
      const account = accounts[0] // 使用第一个账户

      // 这里需要智能合约中相应的方法和参数，假设是someContractMethod
      // 例如，我们需要一个智能合约实例和调用它的方法
      const nft = nftStore.nfts.find((n: any) => n.id === nftId)
      if (!nft) {
        console.error('NFT not found')
        return false
      }

      console.log('-----------------')
      console.log(nft.network.chainId)

      console.log('-----------------')

      const switchSuccess = await switchNetwork(nft.network.chainId)
      if (!switchSuccess) {
        console.error('Failed to switch to the correct network.')
        return false // 如果网络切换失败，则不继续执行
      }

      const contract = new web3.eth.Contract(JSON.parse(nft.abi), nft.contractAddress)
      const estimatedGas = await contract.methods
        .signDailyCheckProof()
        .estimateGas({ from: account })
      // 将bigint转换为字符串，以符合Web3的期望
      const gasLimit = estimatedGas.toString()
      console.log('Estimated gas:', estimatedGas)
      let transactionHash
      const transactionReceipt = await contract.methods
        .signDailyCheckProof()
        .send({ from: account, gas: gasLimit })
        .on('transactionHash', (hash) => {
          transactionHash = hash
        })

      const nftAddress = nft.contractAddress

      // Mint操作成功后，通知服务端
      await notifyBlockchainOperation('SignProof', {
        chainId: nft.network.chainId,
        nftAddress: nftAddress,
        walletAddress: account, // MetaMask账户地址
        transactionHash: transactionHash
      })

      // 如果wallet没有连接，那就自动连接上
      const walletStore = useWalletStore()
      const chainIdBigInt = await web3.eth.getChainId()
      const chainIdNumber = Number(chainIdBigInt) // Convert to Number
      const chainIdString = chainIdNumber.toString()

      // Prepare wallet info
      const walletInfo = {
        chainId: chainIdString,
        address: account
      }

      // Update wallet store if the address or chainId has changed
      if (
        walletStore.wallet.address !== account ||
        walletStore.wallet.chainId !== walletInfo.chainId
      ) {
        // 因为是async函数，所以需要等待setWallet函数执行完毕
        await walletStore.setWallet(walletInfo)
      }

      // 记得同时updateSignedGenesisProof
      walletStore.updateSignedGenesisProof(true)

      console.log('Genesis proof signed successfully')
      return true
    } catch (error) {
      console.error('Failed to sign genesis proof:', error)
      return false
    }
  } else {
    console.log('Please install MetaMask!')
    return false
  }
}

// 假设用户点击Mint按钮时调用此函数
export async function mintNft(nftId: number, nftStore: any, mintFunction: string) {
  // 检查是否安装了MetaMask
  if (window.ethereum) {
    try {
      // 请求用户授权连接MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const web3 = new Web3(window.ethereum)

      // 获取当前选择的地址
      const accounts = await web3.eth.getAccounts()
      const account = accounts[0] // 使用第一个账户

      // 从store中获取NFT信息
      const nft = nftStore.nfts.find((n: any) => n.id === nftId)
      if (!nft) {
        console.error('NFT not found')
        return
      }

      const switchSuccess = await switchNetwork(nft.network.chainId)
      if (!switchSuccess) {
        console.error('Failed to switch to the correct network.')
        return false // 如果网络切换失败，则不继续执行
      }

      const ABI = JSON.parse(nft.abi)
      // 创建智能合约实例
      const contract = new web3.eth.Contract(ABI, nft.contractAddress)
      let transactionReceipt
      // 计算需要发送的 ETH 数量
      let valueToSend = '0' // 默认为 0，适用于 freemint

      // 需要把promise改成正常的数组
      const merkleProofArray = Array.isArray(nft.merkleProof)
        ? [...nft.merkleProof]
        : [nft.merkleProof]

      if (nft.mintPriceEther) {
        valueToSend = web3.utils.toWei(nft.mintPriceEther, 'ether')
      }

      let estimatedGas: bigint = 0n
      try {
        // 根据是否有 merkleProof 参数来估算 gas
        if (merkleProofArray && merkleProofArray[0]) {
          // estimatedGas = await contract.methods[mintFunction](merkleProofArray).estimateGas({
          if (mintFunction == 'whitelistMint') {
            estimatedGas = await contract.methods.whitelistMint(merkleProofArray).estimateGas({
              from: account,
              value: valueToSend // No need to convert to string again
            })
          } else if (mintFunction == 'airdrop') {
            estimatedGas = await contract.methods.airdrop(merkleProofArray).estimateGas({
              from: account,
              value: valueToSend // No need to convert to string again
            })
          }
        } else {
          estimatedGas = await contract.methods[mintFunction]().estimateGas({
            from: account,
            value: valueToSend // No need to convert to string again
          })
        }
      } catch (error) {
        console.warn('Error estimating gas, using fallback estimate:', error)
        if (nft.mintPriceEther) {
          estimatedGas = 4800000n // Convert number to bigint
        } else {
          estimatedGas = 70000n // Convert number to bigint
        }
      }

      // 将bigint转换为字符串，以符合Web3的期望
      const gasLimit = estimatedGas.toString()

      // Setting the maxPriorityFeePerGas to meet Bitlayer's requirements
      const maxPriorityFeePerGas = Web3.utils.toWei('0.1', 'gwei')

      // Sending the mint transaction with the required gas parameters
      if (merkleProofArray && merkleProofArray[0]) {
        // transactionReceipt = contract.methods[mintFunction](merkleProofArray).send({
        if (mintFunction === 'whitelistMint') {
          transactionReceipt = contract.methods.whitelistMint(merkleProofArray).send({
            from: account,
            gas: gasLimit,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            value: valueToSend
          })
        } else if (mintFunction === 'airdrop') {
          transactionReceipt = contract.methods.airdrop(merkleProofArray).send({
            from: account,
            gas: gasLimit,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            value: valueToSend
          })
        }
      } else {
        transactionReceipt = await contract.methods[mintFunction]().send({
          from: account,
          gas: gasLimit,
          maxPriorityFeePerGas: maxPriorityFeePerGas,
          value: valueToSend
        })
      }

      const resolvedReceipt = await transactionReceipt
      if (resolvedReceipt) {
        const nftAddress = nft.contractAddress
        const transactionHash = resolvedReceipt.transactionHash
        // Mint操作成功后，通知服务端
        await notifyBlockchainOperation('mint', {
          chainId: nft.network.chainId,
          nftAddress: nftAddress,
          walletAddress: account, // MetaMask账户地址
          transactionHash: transactionHash
        })
      } else {
        console.error('Transaction receipt is undefined')
        // Handle the error as needed, e.g., retry the operation or notify the user
      }

      // 更新nftstore
      nftStore.setNftMinted(nftId, true)

      console.log('Mint successful')
      return true
    } catch (error: any) {
      if (error.message.includes('insufficient funds')) {
        alert(
          'Error: Insufficient funds for gas and price. Please ensure your account has enough ETH to cover the gas fee.'
        )
      }
      console.error('Mint failed', error)
    }
  } else {
    console.log('Please install MetaMask!')
  }
}

// 把连接钱包放到service里面
export async function connectWallet(item: WalletType) {
  const walletStore = useWalletStore()
  const walletEntries = {
    meta: 'Meta Mask',
    okx: 'OKX Wallet',
    math: 'Math Wallet',
    coinbase: 'Coinbase Smart Wallet'
  }
  try {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' }) // Updated method to request accounts
      const accounts = await web3.eth.getAccounts()

      if (accounts.length === 0) throw new Error('No accounts found')
      const accountAddress = accounts[0]

      // Getting the chain ID
      const chainIdBigInt = await web3.eth.getChainId()
      const chainIdNumber = Number(chainIdBigInt) // Convert to Number
      const chainIdString = chainIdNumber.toString()

      // Prepare wallet info
      const walletInfo = {
        chainId: chainIdString,
        address: accountAddress
      }

      // Check if the current wallet address is the same as the new one
      if (walletStore.wallet.address && walletStore.wallet.address === accountAddress) {
        console.log('Wallet address is the same. No need to update.')
      } else {
        // Update wallet store with new wallet info
        walletStore.setWallet(walletInfo)
        console.log('Wallet info updated.')
        message.success('Connected successful!')
        // Update the NFT store after the wallet is connected
        const nftStore = useNftStore()
        nftStore.fetchWalletInfo(accountAddress)
        console.log('NFT store updated!')
      }
    } else {
      console.error('MetaMask is not installed!')
      message.error(`${walletEntries[item]} is not installed!`)
    }
  } catch (error) {
    console.error('An error occurred while connecting to MetaMask:', error)
  }
}

export async function disconnectWallet() {
  const walletStore = useWalletStore()
  // 清除钱包信息
  // 更新钱包状态
  walletStore.emptyWallet()
}
