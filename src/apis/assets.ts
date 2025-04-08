import { request } from './request'
import type { WalletInfoResponse } from '@/types/models'

interface WalletConnectParams {
  chainId: string | number
  address: string
}

interface NFTActionParams {
  account_id: number
  nft_address: string
  minted?: boolean
  genesis_signed?: boolean
}

/**
 * Connect wallet
 * @param data {
 *  "network": "Ethereum",
 *  "address": "0x...",
 * }
 * @returns
 */
export const connectWallet = (data: WalletConnectParams) =>
  request({
    url: '/assets/wallet/connect/',
    method: 'POST',
    data,
  })

/**
 * Get wallet information
 * @returns
 */
export const getWalletInfo = (walletaddress?: string): Promise<WalletInfoResponse> => {
  let url = '/assets/wallet/info/'
  if (walletaddress) {
    url += `?walletaddress=${encodeURIComponent(walletaddress)}`
  }
  return request({
    url: url,
    method: 'GET',
  }) as Promise<WalletInfoResponse>
}

/**
 * 通知服务端关于区块链操作的完成
 * @param action 操作类型，例如 'mint', 'signGenesisProof', 'claimAirdrop'
 * @param data 操作相关的数据，可以是任何结构，根据后端API的需求
 */
export const notifyBlockchainOperation = async (action: string, data: any) => {
  try {
    // 构建请求数据
    const payload = { action, ...data }
    // 发送请求到服务端的特定端点
    await request(
      {
        url: '/assets/blockchain/operation/',
        method: 'POST',
        data: payload,
      },
      false,
      true,
      true,
    )
    console.log(`${action} notification sent to server successfully.`)
  } catch (error) {
    console.error(`Failed to notify server about ${action}:`, error)
  }
}

export const confirmAccount = (accountId: number) =>
  request({
    url: '/assets/confirm_account/',
    method: 'POST',
    data: { accountId },
  })
