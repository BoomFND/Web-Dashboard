import { defineStore } from 'pinia'

import {
  getWhitelistGroup,
  getPerceptronDetail,
  getMintRecords,
  mintValidate,
  fetchMintInfo
} from '@/apis/perceptron'
import { inviteCodeConfirm } from '@/apis/uid'
import type { WhiteType, PerceptronDetail, MintRecord } from '@/types/models'

export const usePerceptronStore = defineStore('perceptron', () => {
  const whiteType = ref<WhiteType | null>(null)
  const whiteTypeClone = ref<WhiteType | null>(null)
  const perceptronDetail = ref<PerceptronDetail>({
    id: 0,
    currentRound: 1,
    rounds: 4,
    inviteMintCount: 0,
    minted: false,
    isEnabled: false,
    createdAt: '',
    updatedAt: '',
    isPasscard: false,
    contractAddress: '',
    abi: '',
    name: '',
    displayName: '',
    image: '',
    video: '',
    description: '',
    startTime: '',
    closeTime: '',
    mintLimit: 1,
    maxNumber: 5000,
    mintedNumber: 0,
    originPrice: 0,
    price: 0,
    priceUnit: '',
    mintPriceEther: '',
    order: 0,
    mintFunction: '',
    mintButtonText: '',
    mintEnabled: false,
    network: 0,
    season: ''
  })

  const mintRecords = ref<MintRecord[]>([])
  const canInviteMint = ref<boolean>(false)
  const fetchWhitelistGroup = async () => {
    try {
      const res: any = await getWhitelistGroup()
      if (res.whitelistGroup) {
        whiteType.value = res.whitelistGroup
        whiteTypeClone.value = res.whitelistGroup
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchPerceptronDetail = async () => {
    try {
      const res = await getPerceptronDetail()
      perceptronDetail.value = res as PerceptronDetail
      console.log(perceptronDetail.value, 'perceptronDetail')
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMintRecords = async () => {
    try {
      const res = await getMintRecords()
      console.log(res, 'mintRecords')
      mintRecords.value = res as MintRecord[]
    } catch (error) {
      console.error(error)
    }
  }

  const requestMintValidate = async (data: any) => {
    try {
      const res = await mintValidate(data)
      console.log(res, 'res')
      return Promise.resolve(res)
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }

  const requestSolanaPolling = async () => {
    try {
      const res: any = await fetchMintInfo()
      if (!res.nft) return
      perceptronDetail.value = { ...perceptronDetail.value, ...res.nft }
      return Promise.resolve(res)
    } catch (error) {
      console.error(error)

      return Promise.reject(error)
    }
  }

  const requestInviteCodeConfirm = async (gbInviteCode: string) => {
    try {
      const res: any = await inviteCodeConfirm({ gbInviteCode })
      console.log('#########################')

      console.log(res, 'res')
      canInviteMint.value = res.canInviteMint
      console.log(canInviteMint.value, 'canInviteMint')
      if (canInviteMint.value) {
        whiteType.value = 'GTD'
      } else {
        whiteType.value = whiteTypeClone.value
      }
    } catch (error) {
      console.error(error)
    }
  }

  return {
    whiteType,
    whiteTypeClone,
    perceptronDetail,
    mintRecords,
    canInviteMint,
    fetchWhitelistGroup,
    fetchPerceptronDetail,
    fetchMintRecords,
    requestMintValidate,
    requestSolanaPolling,
    requestInviteCodeConfirm
  }
})
