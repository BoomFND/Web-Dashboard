import { defineStore } from 'pinia'
import {
  type Umi,
  type AddressLookupTableInput,
  type KeypairSigner,
  type Transaction,
  type PublicKey,
  publicKey,
  createBigInt,
  generateSigner,
  signAllTransactions
} from '@metaplex-foundation/umi'
import { fetchAddressLookupTable, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox'
import { base58 } from '@metaplex-foundation/umi/serializers'
import {
  fetchCandyMachine,
  safeFetchCandyGuard,
  type CandyGuard,
  type CandyMachine,
  AccountVersion
} from '@metaplex-foundation/mpl-candy-machine'
import {
  type DigitalAsset,
  type DigitalAssetWithToken,
  type JsonMetadata,
  fetchDigitalAsset
  // fetchJsonMetadata
} from '@metaplex-foundation/mpl-token-metadata'
import { message } from 'ant-design-vue'
import { useUmi } from '@/utils/useUmi'
import { getSolanaTime, type GuardReturn } from '@/utils/checkerHelper'
import { guardChecker } from '@/utils/checkAllowed'
import {
  type GuardButtonList,
  chooseGuardToUse,
  routeBuilder,
  mintArgsBuilder,
  buildTx,
  getRequiredCU
} from '@/utils/mintHelper'
import { verifyTx } from '@/utils/verifyTx'
import { fetchJSONMetadata, postMintInfo } from '@/apis/solana'
import { usePerceptronStore } from '@/stores/perceptron'

export const useSolanaStore = defineStore('solana', () => {
  const umi = ref<Umi>(useUmi())
  const candyMachineId = ref<PublicKey>(publicKey('11111111111111111111111111111111'))
  const candyGuard = ref<CandyGuard | null>(null)
  const candyMachine = ref<CandyMachine | null>(null)
  const solanaTime = ref<bigint>(0n)
  const guardReturn = ref<GuardReturn[]>([])
  const ownedTokens = ref<DigitalAssetWithToken[]>([])
  const mintsCreated = ref<{ mint: PublicKey; offChainMetadata: JsonMetadata }[]>([])
  const buttonGuardList = ref<GuardButtonList[]>([])
  const perceptronStore = usePerceptronStore()
  const showMintFailedModal = ref(false)
  const showMintSuccessModal = ref(false)

  const publicGuard = computed(() => {
    // if (perceptronStore.whiteType) {
    //   return buttonGuardList.value.find((elem) => elem.label === perceptronStore.whiteType)
    // }
    // return buttonGuardList.value.find((elem) => elem.label === 'public')
    return buttonGuardList.value.find((elem) => elem.label === 'public')
  })

  const getUmi = () => {
    umi.value = useUmi()
  }

  const fetchSolanaTime = async () => {
    console.log(umi.value, 'umi')
    if (!umi.value) return
    solanaTime.value = await getSolanaTime(umi.value)
    return Promise.resolve(solanaTime.value)
  }

  // 获取candyMachineId
  const getCandyMachineId = () => {
    if (import.meta.env.VITE_APP_CANDY_MACHINE_ID) {
      candyMachineId.value = publicKey(import.meta.env.VITE_APP_CANDY_MACHINE_ID)
    } else {
      message.error('No candy machine id found')
    }
  }

  // 获取candyMachine
  const getCandyMachine = async () => {
    if (!candyMachineId.value) {
      message.error('No candy machine id found')
      return
    }

    try {
      const machine = await fetchCandyMachine(umi.value, publicKey(candyMachineId.value))

      if (machine.version !== AccountVersion.V2) {
        message.error('Candy machine is not a v2')
        return
      }

      candyMachine.value = machine
      return Promise.resolve(candyMachine.value)
    } catch (error) {
      console.error(error)
      message.error('No candy machine found')
      return Promise.reject(error)
    }
  }

  // 获取candyGuard
  const getCandyGuard = async () => {
    if (!candyMachine.value) {
      message.error('No candy machine found')
      return
    }

    try {
      candyGuard.value = await safeFetchCandyGuard(umi.value, candyMachine.value.mintAuthority)
      console.log(candyGuard.value, 'candyGuard')
      return Promise.resolve(candyGuard.value)
    } catch (error) {
      message.error('No candy guard found')
      console.error(error)
      return Promise.reject(error)
    }
  }

  const getGuardCheckerResult = async () => {
    if (!candyGuard.value || !candyMachine.value) {
      message.error('No candy guard or candy machine found')
      return
    }

    const { guardReturn: guard, ownedTokens: tokens } = await guardChecker(
      umi.value,
      candyGuard.value,
      candyMachine.value,
      solanaTime.value,
      perceptronStore.whiteType ?? 'public'
    )
    guardReturn.value = guard
    ownedTokens.value = tokens || []
    return Promise.resolve({ guardReturn, ownedTokens })
  }

  const fetchCandyMachineAndGuard = async () => {
    getCandyMachineId()
    await fetchSolanaTime()
    await getCandyMachine()
    await getCandyGuard()
    await getGuardCheckerResult()
    return Promise.resolve({ candyMachine: candyMachine.value, candyGuard: candyGuard.value })
  }

  const getButtonGuardList = async () => {
    if (!candyMachine.value || !candyGuard.value) {
      message.error('No candy machine or candy guard found')
      return
    }

    // 去重
    let filteredGuardlist = guardReturn.value.filter(
      (guard, index, self) => index === self.findIndex((t) => t.label === guard.label)
    )

    if (!filteredGuardlist.length) {
      message.error('No guard return found')
      return
    }

    console.log(filteredGuardlist, 'filteredGuardlist')

    if (filteredGuardlist.length > 1) {
      filteredGuardlist = filteredGuardlist.filter((elem) => elem.label != 'default')
    }

    buttonGuardList.value = []
    for (const guard of filteredGuardlist) {
      // find guard by label in candyGuard
      const group = candyGuard.value.groups.find((elem) => elem.label === guard.label)
      let startTime = createBigInt(0)
      let endTime = createBigInt(0)
      if (group) {
        if (group.guards.startDate.__option === 'Some') {
          startTime = group.guards.startDate.value.date
        }
        if (group.guards.endDate.__option === 'Some') {
          endTime = group.guards.endDate.value.date
        }
      }
      const guardButton = {
        label: guard.label,
        allowed: guard.allowed,
        header: `${guard.label} MINT`,
        mintText: 'Mint',
        buttonLabel: 'Mint',
        startTime,
        endTime,
        tooltip: guard.reason,
        maxAmount: guard.maxAmount
      }
      buttonGuardList.value.push(guardButton)
    }

    return Promise.resolve(buttonGuardList.value)
  }

  const updateLoadingText = (loadingText: string, label: string) => {
    const guardIndex = buttonGuardList.value.findIndex((g) => g.label === label)
    if (guardIndex === -1) {
      console.error('guard not found')
      return
    }
    buttonGuardList.value[guardIndex].loadingText = loadingText
  }

  // 获取数字资产和其 JSON 元数据
  const fetchNft = async (nftAdress: PublicKey) => {
    let digitalAsset: DigitalAsset | undefined
    let jsonMetadata: JsonMetadata | undefined
    try {
      // 获取数字资产和其 JSON 元数据
      digitalAsset = await fetchDigitalAsset(umi.value, nftAdress)
      // const data = {
      //   address: digitalAsset.metadata.uri.split('/ipfs/')[1]
      // }
      // console.log(data, 'fetchJSONMetadata data')
      // const jsonStr = await fetchJSONMetadata(data)
      // jsonMetadata = JSON.parse(jsonStr as string)
      jsonMetadata = {}
    } catch (e) {
      console.error(e)
      // 如果获取数字资产和其 JSON 元数据失败，则显示错误信息
      message.error('Nft could not be fetched!')
    }

    console.log(digitalAsset, 'digitalAsset')
    console.log(jsonMetadata, 'jsonMetadata')

    // 返回数字资产和其 JSON 元数据
    return { digitalAsset, jsonMetadata }
  }

  const mint = async (amount: number, mintAddress: string, gbInviteCode: string) => {
    if (!candyMachine.value || !candyGuard.value) {
      console.log('mint error: No candy machine or candy guard found')
      if (!candyMachine.value) {
        await getCandyMachine()
      }
      if (!candyGuard.value) {
        await getCandyGuard()
      }

      if (!candyMachine.value || !candyGuard.value) return
      console.log('mint error: No candy machine or candy guard found')
    }

    if (!publicGuard.value) {
      message.error('No public guard found')
      return
    }

    // 选择要使用的guard
    const guardToUse = chooseGuardToUse(publicGuard.value, candyGuard.value)

    // 如果guardToUse没有guard，则显示错误信息
    if (!guardToUse.guards) {
      console.error('no guard defined!')
      return
    }

    try {
      // 设置当前守卫为正在铸造状态
      const guardIndex = buttonGuardList.value.findIndex((g) => g.label === guardToUse.label)
      if (guardIndex === -1) {
        console.error('guard not found')
        return
      }

      // 设置当前守卫为正在铸造状态
      buttonGuardList.value[guardIndex].minting = true

      // 构建交易
      let routeBuild = await routeBuilder(umi.value, guardToUse, candyMachine.value)

      if (routeBuild && routeBuild.items.length > 0) {
        // 设置计算单元价格
        routeBuild = routeBuild.prepend(
          setComputeUnitPrice(umi.value, {
            microLamports: parseInt(import.meta.env.VITE_APP_MICROLAMPORTS)
          })
        )
        // 获取最新区块哈希
        const latestBlockhash = await umi.value.rpc.getLatestBlockhash({ commitment: 'finalized' })
        // 设置区块哈希
        routeBuild = routeBuild.setBlockhash(latestBlockhash)
        // 构建交易
        const builtTx = await routeBuild.buildAndSign(umi.value)

        const sig = await umi.value.rpc
          .sendTransaction(builtTx, {
            skipPreflight: true,
            maxRetries: 1,
            preflightCommitment: 'finalized',
            commitment: 'finalized'
          })
          .then((signature) => {
            return { status: 'fulfilled', value: signature }
          })
          .catch((error) => {
            message.error('Allow List TX failed!')
            return { status: 'rejected', reason: error, value: new Uint8Array() }
          })

        // 验证交易
        if (sig.status === 'fulfilled')
          await verifyTx(umi.value, [sig.value], latestBlockhash, 'finalized')
      }

      // 获取地址查找表（LUT）
      let tables: AddressLookupTableInput[] = []
      const lut = import.meta.env.VITE_APP_LUT
      if (lut) {
        // 获取地址查找表（LUT）
        const lutPubKey = publicKey(lut)
        // 获取地址查找表（LUT）
        const fetchedLut = await fetchAddressLookupTable(umi.value, lutPubKey)
        tables = [fetchedLut]
      } else {
        // message.warning('The developer should really set a lookup table!')
      }

      // 构建铸造交易
      const mintTxs: Transaction[] = []
      const nftsigners = [] as KeypairSigner[]

      const latestBlockhash = await umi.value.rpc.getLatestBlockhash({ commitment: 'finalized' })

      const mintArgs = mintArgsBuilder(candyMachine.value, guardToUse, ownedTokens.value)
      const nftMint = generateSigner(umi.value)
      const txForSimulation = buildTx(
        umi.value,
        candyMachine.value,
        candyGuard.value,
        nftMint,
        guardToUse,
        mintArgs,
        tables,
        latestBlockhash,
        1_400_000
      )

      // 获取所需计算单元
      const requiredCu = await getRequiredCU(umi.value, txForSimulation)

      // 构建铸造交易
      for (let i = 0; i < amount; i++) {
        // 生成nft签名者
        const nftMint = generateSigner(umi.value)
        // 添加nft签名者
        nftsigners.push(nftMint)
        // 构建铸造交易
        const transaction = buildTx(
          umi.value,
          candyMachine.value,
          candyGuard.value,
          nftMint,
          guardToUse,
          mintArgs,
          tables,
          latestBlockhash,
          requiredCu
        )
        console.log(transaction)
        mintTxs.push(transaction)
      }
      if (!mintTxs.length) {
        console.error('no mint tx built!')
        return
      }

      // 更新loadingText
      updateLoadingText(`Please sign`, guardToUse.label)

      const signedTransactions = await signAllTransactions(
        mintTxs.map((transaction, index) => ({
          transaction,
          signers: [umi.value.payer, nftsigners[index]]
        }))
      )

      const signatures: Uint8Array[] = []
      let amountSent = 0
      // 发送交易
      const sendPromises = signedTransactions.map((tx, index) => {
        return umi.value.rpc
          .sendTransaction(tx, {
            skipPreflight: true,
            maxRetries: 1,
            preflightCommitment: 'finalized',
            commitment: 'finalized'
          })
          .then((signature) => {
            console.log(
              `Transaction ${index + 1} resolved with signature: ${
                base58.deserialize(signature)[0]
              }`
            )
            amountSent = amountSent + 1
            signatures.push(signature)
            return { status: 'fulfilled', value: signature }
          })
          .catch((error) => {
            console.error(`Transaction ${index + 1} failed:`, error)
            return { status: 'rejected', reason: error }
          })
      })

      await Promise.allSettled(sendPromises)

      if (!(await sendPromises[0]).status === true) {
        // throw error that no tx was created
        throw new Error('no tx was created')
      }
      updateLoadingText(`Finalizing transaction(s)`, guardToUse.label)
      message.success(`${signedTransactions.length} Transaction(s) sent!`)

      const successfulMints = await verifyTx(umi.value, signatures, latestBlockhash, 'finalized')

      updateLoadingText('Fetching your NFT', guardToUse.label)

      // Filter out successful mints and map to fetch promises
      const fetchNftPromises = successfulMints.map((mintResult) =>
        fetchNft(mintResult).then((nftData) => ({
          mint: mintResult,
          nftData
        }))
      )

      const newMintsCreated: { mint: PublicKey; offChainMetadata: JsonMetadata }[] = []
      const fetchedNftsResults = await Promise.all(fetchNftPromises)

      for (const acc of fetchedNftsResults) {
        if (acc.nftData.digitalAsset && acc.nftData.jsonMetadata) {
          newMintsCreated.push({
            mint: acc.mint,
            offChainMetadata: acc.nftData.jsonMetadata
          })
        }
      }

      // Update mintsCreated only if there are new mints
      if (newMintsCreated.length > 0) {
        mintsCreated.value = newMintsCreated
        console.log(mintsCreated.value, 'mintsCreated')
      }

      // 提交铸造信息
      const mintInfo = {
        solanaAddress: mintAddress,
        transactionHash: successfulMints[0],
        quantity: successfulMints.length,
        gbInviteCode
      }
      await postMintInfo(mintInfo)

      console.log('mint success')
      showMintSuccessModal.value = true
      return Promise.resolve(successfulMints)
    } catch (error) {
      console.error(`minting failed because of ${error}`)
      // message.error('Your mint failed! Please try again.')
      showMintFailedModal.value = true
    } finally {
      //find the guard by guardToUse.label and set minting to true
      const guardIndex = buttonGuardList.value.findIndex((g) => g.label === guardToUse.label)
      if (guardIndex === -1) {
        console.error('guard not found')
        return
      }
      buttonGuardList.value[guardIndex].minting = false
      updateLoadingText('', guardToUse.label)
    }
  }

  return {
    umi,
    solanaTime,
    candyMachineId,
    candyGuard,
    candyMachine,
    guardReturn,
    ownedTokens,
    mintsCreated,
    buttonGuardList,
    publicGuard,
    showMintFailedModal,
    showMintSuccessModal,
    getUmi,
    fetchSolanaTime,
    getCandyMachineId,
    getCandyMachine,
    getCandyGuard,
    fetchCandyMachineAndGuard,
    getButtonGuardList,
    mint
  }
})
