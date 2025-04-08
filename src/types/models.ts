interface Network {
  id: number
  name: string
  chainId: string
  currencySymbol: string | null
  blockExplorerUrl: string | null
}

export interface Nft {
  id: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
  contractAddress: string
  abi: string
  name: string
  displayName: string
  image: string | null
  description: string
  closeTime: string
  maxNumber: number
  mintedNumber: number
  normalPrice: number
  price: number
  priceUnit: string
  mintPriceEther: string
  network: Network
  countDownSeconds: number
  minted: boolean
  mintFunction: string
  whitelistInfo: any
  mintButtonText: string
  mintEnabled: boolean
  merkleProof: string[]
}

export interface WalletInfoResponse {
  walletAddresses: Array<{
    id: number
    isEnabled: boolean
    createdAt: string
    updatedAt: string
    address: string
    account: number
    network: number
  }>
  nfts: Nft[]
}

enum GAME_TYPE {
  LOL = '英雄联盟',
  DOTA2 = 'DOTA2',
  VALORANT = '瓦兰特',
  APEX = 'Apex英雄',
  GLOBAL = '',
  QUEST = ''
}

export interface GameInfo {
  id: number | null
  season: Season
  type: keyof typeof GAME_TYPE
  points: number
  todayPoints: number
  questPoints: number
  ranking: string | number
  rankingRise: string | number
  totalRanking: string | number
  totalRankingRise: string | number
  userInviteRanking: number | string
  userInviteRankingRise: number | string
  userInvitePoints: number | string
  userInviteCount: number | string
  unit: string
  lastPlayed: number | null
}

export interface Statistics {
  boomerHolders: number
  userRegistered: number
  totalTransactions: number
}

export interface SharingTask {
  name: string
  code: string
  displayText: string
  id: number
  icon: string
  amount: number
  sectionName: string
  visible: boolean
  completed: boolean
  redirectUrl: string | URL | undefined
  completeText: string
  [key: string]: any
}

export type GameType = keyof typeof GAME_TYPE

export interface Moment {
  id: number
  brief: string
  coverUrl: string
  videoUrl: string
  order: number
  type?: string
}

export interface Rewards {
  id: number
  name: string
  startAt: string
  endAt: string
  totalRefferals: number
  seasonRewards: number
  rewardPoints: string
}

export interface NavMenu {
  path: string
  icon: string
  title: string
}

export interface Game {
  id: number
  name: GameType
  overwolfId: string
}

export interface Season {
  id: number
  name: string
  startAt: string
  endAt: string
  default: boolean
  display: boolean
  live?: boolean
  highlight: boolean
  order: number
  games: Game[]
}
