<script setup lang="ts">
import useClipboard from 'vue-clipboard3';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/stores/user';
import { usePerceptronStore } from '@/stores/perceptron';
import { useWalletStore } from '@/stores/wallet';
import { useSolanaStore } from '@/stores/solana';
import { assertAccountExists } from '@metaplex-foundation/umi';

import { useWallet } from 'solana-wallets-vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalStore } from '@/stores/modal';

const { publicKey, connect } = useWallet();
const perceptronStore = usePerceptronStore();
const { toClipboard } = useClipboard();
const userStore = useUserStore();
const route = useRoute();
const walletStore = useWalletStore();
const solanaStore = useSolanaStore();
const modalStore = useModalStore();

const invitedCode = ref<string>((route.params.invite as string) || '');
sessionStorage.setItem('invite', invitedCode.value);
const mintNum = ref<number>(1);
const isDetailLoading = ref<boolean>(true);
const currentLocation = computed(() => {
  return `${location.origin}/i/${userStore.account.gbInviteCode}`;
})
const videoLoaded = ref<boolean>(false);
const isPolling = ref(false);
const observer = ref<IntersectionObserver | null>(null);

const handleCopy = async (type: 'code' | 'link') => {
  if (!userStore.account.gbInviteCode) return;
  try {
    const text = type === 'code' ? userStore.account.gbInviteCode : currentLocation.value;
    await toClipboard(text);
    message.success('Copied success!');
  } catch (error) {
    console.error(error);
  }
}

const handleVideoLoaded = async () => {
  await nextTick();
  videoLoaded.value = true;
}

// 监听用户登录状态和solana地址, 如果登录则获取白名单类型
watch(
  () => [userStore.accessToken, userStore.account.solanaAddress],
  async ([newVal, solanaAddress]) => {
    // 如果用户登录了，并且绑定的有solana地址，则获取白名单类型
    if (newVal && solanaAddress) {
      // 如果用户没有连接钱包，则连接钱包
      if (!publicKey.value) {
        await connect()
      }

      try {
        isDetailLoading.value = true
        // 用户登录的情况，就走这里登录
        await perceptronStore.fetchPerceptronDetail()
        isDetailLoading.value = false
      } catch (error) {
        isDetailLoading.value = false
        console.error(error)
      }
      await perceptronStore.fetchWhitelistGroup()

      // if (route.params.invite) {
      //   invitedCode.value = route.params.invite as string
      //   sessionStorage.setItem('invite', invitedCode.value)
      // }
      // else {
      //   perceptronStore.whiteType === 'GW' &&
      //     (invitedCode.value = import.meta.env.VITE_APP_GLOBAL_INVITE_CODE)
      // }

      // 获取umi
      await solanaStore.getUmi();
      await solanaStore.fetchCandyMachineAndGuard();
      await solanaStore.getButtonGuardList();
    } else {
      perceptronStore.whiteType = null;
    }
  },
  {
    immediate: true
  }
);

// 计算倒计时
const countdown = computed(() => {
  const now = new Date().getTime()
  const startTime = new Date(perceptronStore.perceptronDetail.startTime).getTime()
  const endTime = new Date(perceptronStore.perceptronDetail.closeTime).getTime()
  if (now < startTime) {
    return startTime
  } else if (now > startTime && now < endTime) {
    return endTime
  }
  return 0
});

// 格式化倒计时
const formatCountdown = computed(() => {
  const now = new Date().getTime()
  const startTime = new Date(perceptronStore.perceptronDetail.startTime).getTime()
  const endTime = new Date(perceptronStore.perceptronDetail.closeTime).getTime()
  if (now < startTime) {
    return 'DD[d] : HH[h] : mm[m] : ss[s]'
  } else if (now > startTime && now < endTime) {
    if (perceptronStore.perceptronDetail.currentRound === 1) {
      return '[First hour:] mm[m] : ss[s]'
    } else if (perceptronStore.perceptronDetail.currentRound === 2) {
      return '[Second hour:] mm[m] : ss[s]'
    } else {
      return 'DD[d] : HH[h] : mm[m] : ss[s]'
    }
  } else {
    return ''
  }
});

const isLiveWaitingFirstRound = computed(() => {
  return (
    perceptronStore.perceptronDetail.currentRound === 1 &&
    Date.now() < new Date(perceptronStore.perceptronDetail.startTime).getTime()
  );
});

const isFirstRound = computed(() => {
  return (
    perceptronStore.perceptronDetail.currentRound === 1 &&
    new Date(perceptronStore.perceptronDetail.startTime).getTime() < Date.now()
  );
});

const isLiveWaitingSecondRound = computed(() => {
  return (
    perceptronStore.perceptronDetail.currentRound === 2 &&
    Date.now() < new Date(perceptronStore.perceptronDetail.startTime).getTime()
  );
});

const isSecondRound = computed(() => {
  return (
    perceptronStore.perceptronDetail.currentRound === 2 &&
    new Date(perceptronStore.perceptronDetail.startTime).getTime() < Date.now()
  );
});

const isPublicRound = computed(() => {
  return perceptronStore.perceptronDetail.currentRound > 2
});

const isSoldOut = computed(() => {
  return perceptronStore.perceptronDetail.mintedNumber >= perceptronStore.perceptronDetail.maxNumber
});

const showWaitingNextRound = computed(() => {
  return !(
    new Date(perceptronStore.perceptronDetail.startTime).getTime() <= Date.now() &&
    Date.now() <= new Date(perceptronStore.perceptronDetail.closeTime).getTime()
  );
});

const isDisabledMintButton = computed(() => {
  return (
    !publicKey.value ||
    !userStore.accessToken ||
    !solanaStore.publicGuard ||
    isLiveWaitingFirstRound.value ||
    isLiveWaitingSecondRound.value ||
    (isFirstRound.value && perceptronStore.whiteType !== 'GTD') ||
    (isFirstRound.value &&
      perceptronStore.whiteType === 'GTD' &&
      perceptronStore.perceptronDetail.minted) ||
    (isSecondRound.value && !['GTD', 'GW', 'FCFS'].includes(perceptronStore.whiteType ?? '')) ||
    isSoldOut.value ||
    solanaStore.publicGuard?.minting ||
    perceptronStore.perceptronDetail.mintedNumber + mintNum.value >
    perceptronStore.perceptronDetail.maxNumber ||
    showWaitingNextRound.value
  )
});

// 监听是否是轮次间隔等待时间
const timer = ref<NodeJS.Timeout | undefined>()
watch(
  showWaitingNextRound, // 直接使用计算属性，而不是函数形式
  (newV) => {
    console.log('showWaitingNextRound changed:', newV)
    // 是，开启轮询
    if (newV) {
      // 非第一轮也非最后一轮
      if (
        perceptronStore.perceptronDetail.currentRound > 1 &&
        perceptronStore.perceptronDetail.currentRound < 6
      ) {
        // 清除可能存在的旧定时器
        if (timer.value) {
          clearInterval(timer.value)
        }
        timer.value = setInterval(() => {
          perceptronStore.requestSolanaPolling()
        }, 10000)
      }
    } else {
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = undefined
      }
    }
  },
  {
    immediate: true // 添加immediate选项，确保初始化时也执行一次
  }
)

watch(
  () => perceptronStore.perceptronDetail.currentRound,
  (newVal) => {
    if (newVal > 2) {
      perceptronStore.whiteType = 'public'
    }
  }
);

// 倒计时结束
const handleCountdownFinish = () => {
  // 如果当前时间大于结束时间，则重新请求接口，更新数据
  perceptronStore.fetchPerceptronDetail()
};

const mintabledNumber = computed(() => {
  return perceptronStore.perceptronDetail.mintLimit - perceptronStore.perceptronDetail.mintedNumber
});

// 增加mint数量
const handleMintNumAdd = () => {
  if (mintNum.value >= mintabledNumber.value) {
    return
  }
  mintNum.value++
};

const handleMint1 = async () => {
  window.open(
    'https://magiceden.us/marketplace/perceptron',
    '_blank'
  )
  return
}

const handleMint = async () => {
  if (isDisabledMintButton.value) return

  // 判断用户是否已经登录solana，没有，则打开钱包登录
  if (walletStore.walletConnectType !== 'sol') {
    // TODO: 打开钱包登录，无法切换钱包账号
    modalStore.toggleLoginEntryModal(true)
    return
  }

  try {
    const account = await solanaStore.umi.rpc.getAccount(solanaStore.umi.identity.publicKey)
    assertAccountExists(account)
    const solBalance = Number(account.lamports.basisPoints) / 1_000_000_000
    console.log('mint', solBalance)
    if (solBalance < Number(perceptronStore.perceptronDetail.price) * mintNum.value) {
      message.error('Not enough balance')
      return
    }
  } catch (error) {
    console.error(error)
    message.error('Not enough balance')
    return
  }

  try {
    // MINT前数据验证
    const res: any = await perceptronStore.requestMintValidate({
      solanaAddress: userStore.account.solanaAddress,
      transactionHash:
        'mKheAWNVfmQcc4QkGosp6RyMaVQLo7d9EqGYqEDbqA6ENrNNxWrkMZcFtSZfVgHtJPR5ronX8eikJqkhtmanzxq',
      quantity: mintNum.value,
      gbInviteCode: invitedCode.value
    })
    console.log(res, 'res')
    const result = JSON.parse(res)
    if (result?.detail === 'success') {
      // 只使用public gard
      await solanaStore.mint(
        mintNum.value,
        userStore.account.solanaAddress || '',
        invitedCode.value
      )
    }
  } catch (error: any) {
    console.error(error)
    message.error(error.detail)
  } finally {
    // 重新调用接口，计算可MINT进度数量
    setTimeout(() => {
      perceptronStore.fetchPerceptronDetail()
    }, 1000)
  }
}

const handleFetchPerceptronDetail = async () => {
  // 如果用户未登录，或者未使用solana账号登录，就走这里获取perceptron详情
  if (!userStore.accessToken || (userStore.accessToken && !userStore.account.solanaAddress)) {
    console.log(2)
    try {
      isDetailLoading.value = true
      await perceptronStore.fetchPerceptronDetail()
      isDetailLoading.value = false
    } catch (error) {
      isDetailLoading.value = false
      console.error(error)
    }
  }
};

handleFetchPerceptronDetail();

const handleInvitedCodeChange = () => {
  console.log(invitedCode.value)
  invitedCode.value && perceptronStore.requestInviteCodeConfirm(invitedCode.value)
};

// 如果当前invitedCode有值，则请求邀请码确认
handleInvitedCodeChange();

const startPolling = () => {
  isPolling.value = true
  // Replace with your polling logic
  const fetchData = async () => {
    if (isPolling.value) {
      await perceptronStore.fetchMintRecords()
      console.log(1, perceptronStore.mintRecords)
      setTimeout(fetchData, 5000) // Poll every 5 seconds
    }
  }
  fetchData()
};

const stopPolling = () => {
  isPolling.value = false
};

const mintRecordSectionRef = ref<HTMLElement>();
const observerMarquee = async () => {
  // Wait for next tick to ensure DOM is updated
  await nextTick();

  if (observer.value) {
    observer.value.disconnect()
  }

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startPolling()
      } else {
        stopPolling()
      }
    })
  })

  const target = mintRecordSectionRef.value
  if (target) {
    observer.value.observe(target)
  }
}

onMounted(async () => {
  await perceptronStore.fetchMintRecords()

  // Then setup the observer after records are loaded and DOM is updated
  if (perceptronStore.mintRecords.length > 0) {
    await observerMarquee()
  }
});

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
  stopPolling()

  if (timer.value) {
    clearInterval(timer.value)
    timer.value = undefined
  }
});
</script>

<template>
  <div class="perceptron-view">
    <section ref="mintRecordSectionRef" class="mint-record-section">
      <template v-if="perceptronStore.mintRecords.length > 0">
        <n-marquee :auto-fill="true">
          <div class="mint-record-list">
            <div class="mint-record-item" v-for="item in perceptronStore.mintRecords" :key="item.id">
              <div class="text">{{ item.walletAddress }}</div>
              <div class="action">mint</div>
              <div class="text">{{ item.amount }}SOL</div>
            </div>
          </div>
        </n-marquee>
      </template>
    </section>
    <section class="nft-section">
      <div class="nft-header">
        <div class="nft-title">Perceptron NFT</div>
        <div class="nft-desc">Secure Your Early Access Pass to the Future!</div>
      </div>
      <div class="nft-container">
        <div class="nft-image-box">
          <img v-if="!videoLoaded" src="@/assets/images/nft.jpg" alt="" />
          <video preload="auto" muted loop :autoplay="true" :controls="false" :playsinline="true"
            :webkit-playsinline="true" :x5-playsinline="true" @loadeddata="handleVideoLoaded">
            <source src="@/assets/media/nft.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="nft-trade-box">
          <a-skeleton v-if="isDetailLoading" :active="true" :paragraph="{ rows: 20 }" />
          <template v-else>
            <div class="nft-trade-top-box">
              <div class="top-box">
                <div class="countdown">
                  <template v-if="
                    (!userStore.accessToken && isSoldOut) ||
                    (perceptronStore.perceptronDetail.currentRound === 3 &&
                      !showWaitingNextRound &&
                      isSoldOut)
                  ">
                    Sold Out
                  </template>
                  <a-statistic-countdown v-else-if="perceptronStore.perceptronDetail.currentRound < 3" title=""
                    :value="countdown" :format="formatCountdown" @finish="handleCountdownFinish" />
                  <template v-else>Close
                    <a-statistic-countdown v-show="false" title="" :value="countdown" :format="formatCountdown"
                      @finish="handleCountdownFinish" />
                  </template>
                </div>
                <div class="coming-soon" v-if="
                  !(
                    showWaitingNextRound && perceptronStore.perceptronDetail.currentRound === 6
                  ) &&
                  !(
                    perceptronStore.perceptronDetail.currentRound === 3 &&
                    !showWaitingNextRound &&
                    isSoldOut
                  )
                ">
                  <template v-if="isLiveWaitingFirstRound"> Coming Soon </template>
                  <template v-else-if="showWaitingNextRound">Waiting for next round</template>
                  <template v-else>Live</template>
                </div>
              </div>
              <div class="bottom-box">
                <div class="bottom-box-title">
                  We're launching Perceptron NFTs, exclusive to whitelisted Genesis NFT holders.
                </div>
                <div class="bottom-box-desc">
                  As GamerBoom's core asset and Early Access Pass, Perceptron NFTs enable data
                  consensus, behavior capture, and AI Agent access. They power decentralized AI data
                  labeling, generating validation credentials from gaming behavior to establish
                  on-chain asset value.<br />
                  Holders can also deploy modular AI Agents, creating a decentralized
                  Agent-as-a-Service (AaaS) that propels gaming into an AI-driven Web3 paradigm.
                </div>
              </div>
            </div>
            <div class="nft-progress-box">
              <div class="progress-info">
                <div class="info-left">
                  <SvgIcon name="perceptron-round" />
                  <div class="info-left-text">
                    <!--                    {{-->
                    <!--                      `Round ${perceptronStore.perceptronDetail.currentRound < 4 ? 1 : perceptronStore.perceptronDetail.currentRound - 2}/${perceptronStore.perceptronDetail.rounds} Supply`-->
                    <!--                    }}-->
                    Supply
                  </div>
                </div>
                <div class="info-right">
                  <div class="info-right-text minted">
                    {{
                      perceptronStore.perceptronDetail.maxNumber -
                      perceptronStore.perceptronDetail.mintedNumber
                    }}
                  </div>
                  <div class="info-right-text total">
                    /{{ perceptronStore.perceptronDetail.maxNumber }}
                  </div>
                </div>
              </div>
              <a-progress :percent="((perceptronStore.perceptronDetail.maxNumber -
                perceptronStore.perceptronDetail.mintedNumber) /
                perceptronStore.perceptronDetail.maxNumber) *
                100
                " :size="6" :show-info="false" stroke-color="#1d1d1f" />
            </div>
            <div class="nft-trade-action">
              <div class="mint-box">
                <div class="mint-limit">
                  <div class="mint-limit-label">
                    Perceptron NFT Minting Limits
                    {{ perceptronStore.perceptronDetail.mintLimit ? ':' : '' }}
                  </div>
                  <div v-if="
                    perceptronStore.perceptronDetail.mintLimit <
                    perceptronStore.perceptronDetail.maxNumber
                  " class="mint-limit-label">
                    {{ perceptronStore.perceptronDetail.mintLimit }}
                  </div>
                  <div v-else class="mint-limit-value">Unlimited</div>
                </div>
                <div class="mint-box-form">
                  <div class="mint-box-left">
                    <div class="price-box">
                      <!--                      <div class="price-box-label">Price</div>-->
                      <div class="price-box-value">
                        <!--                        <SvgIcon name="perceptron-sol" />-->
                        <div v-if="isLiveWaitingFirstRound || isLiveWaitingSecondRound" class="price-box-value-text">
                          <!--                          {{ perceptronStore.perceptronDetail.originPrice }} SOL-->
                        </div>
                        <div v-else-if="isFirstRound || isSecondRound" class="price-box-value-text">
                          <!--                          <div class="text">{{ perceptronStore.perceptronDetail.price }} SOL</div>-->
                          <div class="text origin">
                            <!--                            {{ perceptronStore.perceptronDetail.originPrice }} SOL-->
                          </div>
                        </div>
                        <div v-else class="price-box-value-text">
                          <!--                          {{ perceptronStore.perceptronDetail.price }} SOL-->
                        </div>
                      </div>
                    </div>
                    <div class="mint-num-box">
                      <div v-if="isFirstRound" class="mint-num-box-input">
                        <a-input-number type="number" v-model:value="mintNum" min="1" max="1" disabled />
                      </div>
                      <div v-else class="mint-num-box-input">
                        <div class="mint-num-box-input-icon" :class="{ disabled: mintNum <= 1 }"
                          @click="mintNum <= 1 ? null : mintNum--">
                          <SvgIcon name="perceptron-substract" />
                        </div>
                        <a-input-number type="number" v-model:value="mintNum" :min="1" :max="mintabledNumber" />
                        <div class="mint-num-box-input-icon" :class="{
                          disabled: mintNum >= mintabledNumber
                        }" @click="handleMintNumAdd">
                          <SvgIcon name="perceptron-add" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mint-box-right">
                    <div class="referral-code-label">Referral Code</div>
                    <div class="referral-code-input">
                      <input type="text" placeholder="Optional" v-model="invitedCode"
                        @change="handleInvitedCodeChange" />
                      <!-- <div v-if="!invitedCode" class="error-text">Cannot be empty</div> -->
                    </div>
                  </div>
                </div>
              </div>
              <!--              <div-->
              <!--                class="button button-primary mint-button"-->
              <!--                :class="{ disabled: isDisabledMintButton }"-->
              <!--                @click="handleMint"-->
              <!--              >-->
              <div class="button button-primary mint-button" @click="handleMint1">
                Buy
                <!--                <template v-if="!userStore.accessToken">-->
                <!--                  {{ isSoldOut ? 'Sold Out' : 'Mint' }}-->
                <!--                </template>-->
                <!--                <template v-else-if="isLiveWaitingFirstRound || isLiveWaitingSecondRound">-->
                <!--                  <template v-if="perceptronStore.whiteType === 'GTD'">-->
                <!--                    You are already GTD Whitelisted-->
                <!--                  </template>-->
                <!--                  <template v-else-if="perceptronStore.whiteType === 'FCFS'">-->
                <!--                    You are already FCFS Whitelisted-->
                <!--                  </template>-->
                <!--                  <template v-else-if="perceptronStore.whiteType === 'GW'">-->
                <!--                    You are already Whitelisted-->
                <!--                  </template>-->
                <!--                  <template v-else>In Preparation</template>-->
                <!--                </template>-->

                <!--                <template v-else-if="isFirstRound && perceptronStore.whiteType !== 'GTD'">-->
                <!--                  Only for GTD Whitelist-->
                <!--                </template>-->
                <!--                <template-->
                <!--                  v-else-if="-->
                <!--                    isSecondRound &&-->
                <!--                    !['GTD', 'GW', 'FCFS'].includes(perceptronStore.whiteType ?? '')-->
                <!--                  "-->
                <!--                >-->
                <!--                  Only for Whitelist-->
                <!--                </template>-->
                <!--                <template v-else-if="isSoldOut"> Sold Out </template>-->
                <!--                <template-->
                <!--                  v-else-if="-->
                <!--                    (isFirstRound && perceptronStore.whiteType === 'GTD') ||-->
                <!--                    (isSecondRound &&-->
                <!--                      ['GTD', 'GW', 'FCFS'].includes(perceptronStore.whiteType ?? '')) ||-->
                <!--                    isPublicRound-->
                <!--                  "-->
                <!--                >-->
                <!--                  <loading-outlined v-if="solanaStore.publicGuard?.minting" />-->
                <!--                  {{ solanaStore.publicGuard?.loadingText || 'Mint' }}-->
                <!--                </template>-->
              </div>
            </div>
            <div class="nft-trade-bottom-box">
              <div class="my-code-box">
                <div class="my-code-label">Copy My Referral Code</div>
                <div class="my-code-value">
                  <div class="code-text">{{ userStore.account.gbInviteCode ?? '--' }}</div>
                  <SvgIcon name="perceptron-copy" @click="handleCopy('code')" />
                </div>
              </div>
              <div class="my-link-box">
                <div class="my-link-label">Copy My Referral Link</div>
                <div class="my-link-value">
                  <div class="code-text">
                    {{ userStore.account.gbInviteCode ? currentLocation : '--' }}
                  </div>
                  <SvgIcon name="perceptron-copy" @click="handleCopy('link')" />
                </div>
              </div>
              <div class="my-friends-box">
                <div class="my-friends-label">Invitees Who Minted</div>
                <div class="my-friends-value">
                  {{
                    userStore.accessToken ? perceptronStore.perceptronDetail.inviteMintCount : '--'
                  }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>

    <section class="round-section" v-if="false">
      <div class="round-title">Minting Rounds</div>
      <div class="round-list">
        <div class="round-item" :class="{ active: perceptronStore.perceptronDetail.currentRound <= 3 }">
          <div class="round-item-top">
            <div class="round-item-title">Round 1</div>
            <div class="quantity">Quantity: 5,000</div>
            <div class="price">1 SOL</div>
          </div>
          <div class="round-item-bottom">
            <img src="@/assets/images/round-1.svg" alt="" />
          </div>
        </div>
        <div class="round-item" :class="{ active: perceptronStore.perceptronDetail.currentRound === 4 }">
          <div class="round-item-top">
            <div class="round-item-title">Round 2</div>
            <div class="quantity">Quantity: 5,000</div>
            <div class="price">1.5 SOL</div>
          </div>
          <div class="round-item-bottom">
            <img src="@/assets/images/round-2.svg" alt="" />
          </div>
        </div>
        <div class="round-item" :class="{ active: perceptronStore.perceptronDetail.currentRound === 5 }">
          <div class="round-item-top">
            <div class="round-item-title">Round 3</div>
            <div class="quantity">Quantity: 5,000</div>
            <div class="price">2 SOL</div>
          </div>
          <div class="round-item-bottom">
            <img src="@/assets/images/round-3.svg" alt="" />
          </div>
        </div>
        <div class="round-item" :class="{ active: perceptronStore.perceptronDetail.currentRound === 6 }">
          <div class="round-item-top">
            <div class="round-item-title">Round 4</div>
            <div class="quantity">Quantity: 5,000</div>
            <div class="price">2.5 SOL</div>
          </div>
          <div class="round-item-bottom">
            <img src="@/assets/images/round-4.svg" alt="" />
          </div>
        </div>
      </div>
    </section>

    <section class="feature-section">
      <div class="feature-header">
        <div class="feature-title">Perceptron NFT Features</div>
      </div>

      <div class="feature-card">
        <div class="card">
          <div class="card-title">Exclusive Early Access to Innovative Features</div>
          <div class="list">
            <div class="list-item">
              <SvgIcon name="perceptron-game" />
              <div class="list-item-title">Game Behavior Capture</div>
              <div class="list-item-desc">
                Priority access to a neural network-based behavior capture model.
              </div>
            </div>
            <div class="list-item">
              <SvgIcon name="perceptron-ai" />
              <div class="list-item-title">AI Data Training</div>
              <div class="list-item-desc">
                Be among the first to experience our cutting-edge AI training data labeling system.
              </div>
            </div>
            <div class="list-item">
              <SvgIcon name="perceptron-modular" />
              <div class="list-item-title">Modular AI Agent Access</div>
              <div class="list-item-desc">
                Gain early qualifications for experiencing modular AI Agents.
              </div>
            </div>
            <div class="list-item">
              <SvgIcon name="perceptron-esports" />
              <div class="list-item-title">Esports Referee Services</div>
              <div class="list-item-desc">
                Enjoy priority access to AI Agent referee services in esports environments.
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Intelligent Event Tracking and Trading</div>
          <div class="list">
            <div class="list-item">
              <SvgIcon name="perceptron-automated" />
              <div class="list-item-title">Automated Event Tracking</div>
              <div class="list-item-desc">
                Effortlessly track trending game events on Twitter and trigger Agent Token launches.
              </div>
            </div>
            <div class="list-item">
              <SvgIcon name="perceptron-smart" />
              <div class="list-item-title">Smart Trading Decisions</div>
              <div class="list-item-desc">
                Leverage intelligent analysis of major gaming events for automated trading
                decisions.
              </div>
            </div>
            <div class="list-item full-width">
              <SvgIcon name="perceptron-market" />
              <div class="list-item-title">Game Prediction Market</div>
              <div class="list-item-desc">
                Unlock valuable data-driven insights through our AI Agent-powered game prediction
                market.
                <div class="br-tag">&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Enhanced Virtual Companionship and Social Interaction</div>
          <div class="list">
            <div class="list-item">
              <SvgIcon name="perceptron-mmersive" />
              <div class="list-item-title">Immersive Virtual Companionship</div>
              <div class="list-item-desc">
                Experience enhanced interactions through our AI Agent virtual companionship feature.
                <div class="br-tag">&nbsp;</div>
              </div>
            </div>
            <div class="list-item">
              <SvgIcon name="perceptron-personalized" />
              <div class="list-item-title">Personalized Long-term Memory</div>
              <div class="list-item-desc">
                Benefit from a personalized long-term memory profile for continuous engagement.
              </div>
            </div>
            <div class="list-item full-width">
              <SvgIcon name="perceptron-exclusive" />
              <div class="list-item-title">Exclusive Access to AI KOL Tools</div>
              <div class="list-item-desc">
                Enjoy early access to intelligent tools for AI Key Opinion Leaders on platforms like
                Twitter and Telegram.
                <div class="br-tag2">&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Ecosystem Building and Governance</div>
          <div class="list">
            <div class="list-item">
              <SvgIcon name="perceptron-creation" />
              <div class="list-item-title">Exclusive AaaS Creation</div>
              <div class="list-item-desc">
                Perceptron NFT holders are given priority access to develop advanced AI-as-a-Service
                (AaaS) Agents within the ecosystem.
              </div>
            </div>
            <div class="list-item">
              <SvgIcon name="perceptron-participation" />
              <div class="list-item-title">Governance Participation</div>
              <div class="list-item-desc">
                Perceptron NFT holders enjoy governance privileges, including voting on new
                features, policies, and strategies.
              </div>
            </div>
            <div class="list-item full-width">
              <SvgIcon name="perceptron-innovation" />
              <div class="list-item-title">Shaping Innovation</div>
              <div class="list-item-desc">
                Perception validators' input can lead to new gaming data solutions, from analyzing
                player behavior to creating AI - powered in - game experiences.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="benefits-section">
      <div class="benefits-title">Perceptron NFT Benefits</div>
      <div class="card-list">
        <div class="card">
          <div class="info">
            <div class="card-title">Validation Reward Boosts</div>
            <div class="card-desc">
              Enjoy exclusive multipliers on rewards as an AI Data Tagging validator, incentivizing
              deep involvement in AI Agent governance.
            </div>
          </div>
          <SvgIcon name="perceptron-validation" />
        </div>
        <div class="card">
          <div class="info">
            <div class="card-title">Seasonal Reward Enhancements</div>
            <div class="card-desc">
              Maximize your mining returns with seasonal reward multipliers on Work Proof Points
              (GPT).
            </div>
          </div>
          <SvgIcon name="perceptron-seasonal" />
        </div>
        <div class="card">
          <div class="info">
            <div class="card-title">Token Airdrops</div>
            <div class="card-desc">
              As the unique and core asset within the GamerBoom protocol, Perceptron NFT holders
              will receive exclusive GamerBoom token airdrops.
            </div>
          </div>
          <SvgIcon name="perceptron-tokens" />
        </div>
      </div>
    </section>
    <ModalMintFailed v-model="solanaStore.showMintFailedModal" />
    <ModalMintSuccess v-model="solanaStore.showMintSuccessModal" />
  </div>
</template>

<style lang="scss" scoped>
.perceptron-view {
  display: flex;
  width: 100%;
  padding: 28px 44px;
  flex-direction: column;
  align-items: flex-start;
  gap: 72px;

  .mint-record-section {
    margin-top: -12px;
    margin-left: -44px;
    margin-right: -44px;
    margin-bottom: -68px;
    display: flex;
    padding: 12px 0px;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    align-self: stretch;
    background: rgba(10, 194, 194, 0.08);

    :deep(.n-marquee__group) {
      gap: 24px;

      &:not(:first-child) {
        margin-left: 24px;
      }
    }

    .mint-record-list {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .mint-record-item {
      display: flex;
      padding: 4px 6px;
      align-items: center;
      gap: 12px;
      border-radius: 6px;
      background: #fff;

      .text {
        color: #0ac2c2;
        font-feature-settings:
          'ss01' on,
          'cv01' on,
          'cv11' on;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
      }

      .action {
        color: #1d1d1f;
        font-feature-settings:
          'ss01' on,
          'cv01' on,
          'cv11' on;
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: 20px;
      }
    }
  }

  .nft-section {
    display: flex;
    // height: 1143px;
    padding-top: 40px;
    flex-direction: column;
    align-items: flex-start;
    gap: 64px;
    flex-shrink: 0;
    align-self: stretch;

    .nft-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      align-self: stretch;

      .nft-title {
        color: #1d1d1f;
        text-align: center;
        font-family: Urbanist;
        font-size: 44px;
        font-style: normal;
        font-weight: 800;
        line-height: 130%;
        /* 57.2px */
      }

      .nft-desc {
        color: #86868b;
        text-align: center;
        font-family: Urbanist;
        font-size: 18px;
        font-style: normal;
        font-weight: 600;
        line-height: 130%;
        /* 23.4px */
      }
    }

    .nft-container {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      width: 100%;
      max-height: 960px;

      .nft-image-box {
        position: relative;
        flex: 1;
        align-self: stretch;
        border-radius: 24px;
        overflow: hidden;

        img {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      }

      .nft-trade-box {
        width: 548px;
        flex-shrink: 0;
        display: flex;
        padding: 24px;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        align-self: stretch;
        border-radius: 32px;
        background: #fff;

        .nft-trade-top-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          align-self: stretch;

          .top-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            align-self: stretch;

            .countdown,
            .countdown :deep(.ant-statistic-content-value) {
              color: #1d1d1f;
              font-family: Urbanist;
              font-size: 32px;
              font-style: normal;
              font-weight: 800;
              line-height: 130%;
              /* 41.6px */
              letter-spacing: var(--letter-spacing--0_08, -0.076px);
            }

            .coming-soon {
              display: flex;
              padding: 6px 8px;
              justify-content: center;
              align-items: center;
              gap: 8px;
              border-radius: 6px;
              background: #f5f5f7;
              color: #1d1d1f;
              text-align: center;
              font-family: Urbanist;
              font-size: 16px;
              font-style: normal;
              font-weight: 600;
              line-height: 130%;
              /* 20.8px */
            }
          }

          .bottom-box {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .bottom-box-title {
              color: #1d1d1f;
              font-family: Urbanist;
              text-align: left;
              font-size: 16px;
              font-style: normal;
              font-weight: 700;
              line-height: 150%;
              /* 24px */
              letter-spacing: 0.048px;
            }

            .bottom-box-desc {
              color: #1d1d1f;
              font-family: Urbanist;
              font-size: 14px;
              font-style: normal;
              font-weight: 500;
              line-height: 150%;
              /* 21px */
              letter-spacing: 0.048px;
            }
          }
        }

        .nft-progress-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          align-self: stretch;

          .progress-info {
            display: flex;
            height: 22px;
            justify-content: space-between;
            align-items: center;
            align-self: stretch;

            .info-left {
              display: flex;
              align-items: center;
              gap: 8px;

              .svg-icon {
                width: 24px;
                height: 24px;
              }

              .info-left-text {
                color: #1d1d1f;
                font-family: Urbanist;
                font-size: 16px;
                font-style: normal;
                font-weight: 600;
                line-height: 130%;
                /* 20.8px */
              }
            }

            .info-right {
              display: flex;
              align-items: center;
              gap: 4px;

              .info-right-text {
                font-family: Urbanist;
                font-size: 16px;
                font-style: normal;
                font-weight: 600;
                line-height: 130%;
                /* 20.8px */
              }

              .info-right-text.minted {
                color: #1d1d1f;
              }

              .info-right-text.total {
                color: #86868b;
              }
            }
          }
        }

        .nft-trade-action {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-start;
          gap: 24px;
          align-self: stretch;

          .mint-box {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-start;
            gap: 24px;
            align-self: stretch;

            .mint-limit {
              display: flex;
              align-items: center;
              gap: 12px;
              align-self: stretch;

              .mint-limit-label {
                color: #1d1d1f;
                font-family: Urbanist;
                font-size: 16px;
                font-style: normal;
                font-weight: 600;
                line-height: 130%;
                /* 20.8px */
              }

              .mint-limit-value {
                display: flex;
                padding: 2px 8px;
                align-items: center;
                gap: 4px;
                border-radius: 4px;
                background: #0ac2c2;
                color: #fff;
                font-feature-settings:
                  'ss01' on,
                  'cv01' on,
                  'cv11' on;
                font-family: Urbanist;
                font-size: 11px;
                font-style: normal;
                font-weight: 600;
                line-height: 130%;
                /* 14.3px */
              }
            }

            .mint-box-form {
              display: flex;
              align-items: center;
              gap: 24px;
              align-self: stretch;

              .mint-box-left {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
                flex: 1 0 0;

                .price-box {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  align-self: stretch;
                  height: 20px;

                  .price-box-label {
                    color: #86868b;
                    font-family: Urbanist;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 500;
                    line-height: 130%;
                    /* 18.2px */
                  }

                  .price-box-value {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .svg-icon {
                      width: 13.878px;
                      height: 11.226px;
                    }

                    .price-box-value-text {
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      color: #1d1d1f;
                      font-family: Urbanist;
                      font-size: 16px;
                      font-style: normal;
                      font-weight: 600;
                      line-height: 130%;
                      /* 20.8px */

                      .text {
                        font-weight: 600;

                        &.origin {
                          text-decoration: line-through;
                          color: #1d1d1f;
                          opacity: 0.5;
                        }
                      }
                    }
                  }
                }

                .mint-num-box {
                  width: 100%;

                  .mint-num-box-input {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    align-self: stretch;

                    .ant-input-number {
                      flex: 1;
                      height: 48px;
                      outline: none;
                      border-radius: 12px;
                      border: 1.5px solid rgba(110, 110, 115, 0.2);

                      &:focus {
                        outline: none;
                        border: 1.5px solid rgba(110, 110, 115, 0.2);
                        box-shadow: none;
                      }
                    }

                    :deep(.ant-input-number-input-wrap) {
                      outline: none;
                    }

                    :deep(.ant-input-number-handler-wrap) {
                      border-radius: 12px;
                    }

                    :deep(.ant-input-number-input) {
                      text-align: center;
                      color: #1d1d1f;
                      font-family: Urbanist;
                      font-size: 16px;
                      font-style: normal;
                      font-weight: 700;
                      line-height: 18px;
                      /* 112.5% */
                      height: 48px;
                    }

                    .mint-num-box-input-icon {
                      display: flex;
                      width: 28px;
                      height: 28px;
                      justify-content: center;
                      align-items: center;
                      border-radius: 28px;
                      background: rgba(210, 210, 215, 0.64);
                      cursor: pointer;

                      &.disabled {
                        cursor: not-allowed;
                        opacity: 0.42;
                      }

                      .svg-icon {
                        width: 28px;
                        height: 28px;
                      }
                    }
                  }
                }
              }

              .mint-box-right {
                display: flex;
                width: 180px;
                flex-direction: column;
                justify-content: flex-end;
                align-items: flex-start;
                gap: 12px;

                .referral-code-label {
                  color: #86868b;
                  font-family: Urbanist;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 130%;
                  /* 18.2px */
                }

                .referral-code-input {
                  // position: relative;

                  input {
                    width: 100%;
                    display: flex;
                    height: 48px;
                    padding: 0px 16px;
                    flex-direction: column;
                    justify-content: center;
                    align-items: flex-start;
                    flex: 1 0 0;
                    border-radius: 12px;
                    border: 1.5px solid rgba(110, 110, 115, 0.2);
                    color: #1d1d1f;
                    font-family: Urbanist;
                    font-size: 16px;
                    font-style: normal;
                    font-weight: 700;
                    line-height: 18px;
                    /* 112.5% */

                    &::placeholder {
                      color: #86868b;
                      font-family: Urbanist;
                      font-size: 16px;
                      font-style: normal;
                      font-weight: 500;
                      line-height: 130%;
                      /* 20.8px */
                    }

                    &:focus-visible {
                      outline: none;
                    }
                  }

                  // .error-text {
                  //   position: absolute;
                  //   bottom: -20px;
                  //   left: 0;
                  //   color: #ff0000;
                  //   font-size: 14px;
                  // }
                }
              }
            }
          }

          .mint-button {
            font-weight: 600;

            &.disabled::after {
              background: rgba(255, 255, 255, 0.8);
            }
          }
        }

        .nft-trade-bottom-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          align-self: stretch;

          .my-code-box,
          .my-link-box {
            display: flex;
            padding: 12px 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            align-self: stretch;
            border-radius: 12px;
            background: #fafafc;

            .my-code-label,
            .my-link-label {
              color: #1d1d1f;
              font-family: Urbanist;
              font-size: 14px;
              font-style: normal;
              font-weight: 800;
              line-height: 130%;
              /* 18.2px */
            }

            .my-code-value {
              display: flex;
              justify-content: space-between;
              align-items: center;
              align-self: stretch;
              color: #1d1d1f;
              font-family: Urbanist;
              font-size: 14px;
              font-style: normal;
              font-weight: 800;
              line-height: 130%;
              /* 18.2px */

              .code-text {
                color: #222426;
                font-family: Urbanist;
                font-size: 18px;
                font-style: normal;
                font-weight: 400;
                line-height: 130%;
                /* 23.4px */
                letter-spacing: 4px;
              }

              .svg-icon {
                width: 20px;
                height: 20px;
                cursor: pointer;
              }
            }

            .my-link-value {
              display: flex;
              justify-content: space-between;
              align-items: center;
              align-self: stretch;

              .code-text {
                color: #86868b;
                font-family: Urbanist;
                font-size: 14px;
                font-style: normal;
                font-weight: 500;
                line-height: 130%;
                /* 18.2px */
              }

              .svg-icon {
                width: 20px;
                height: 20px;
                cursor: pointer;
              }
            }
          }

          .my-friends-box {
            display: flex;
            padding: 12px 16px;
            justify-content: space-between;
            align-items: center;
            align-self: stretch;
            border-radius: 12px;
            background: #fafafc;

            .my-friends-label {
              color: #1d1d1f;
              font-family: Urbanist;
              font-size: 14px;
              font-style: normal;
              font-weight: 800;
              line-height: 130%;
              /* 18.2px */
            }

            .my-friends-value {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 6.095px;
              border-radius: 6.095px;
              color: #1d1d1f;
              text-align: center;
              font-family: Urbanist;
              font-size: 24px;
              font-style: normal;
              font-weight: 800;
              line-height: 130%;
              /* 31.2px */
            }
          }
        }
      }
    }
  }

  .round-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    align-self: stretch;

    .round-title {
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 32px;
      font-style: normal;
      font-weight: 800;
      line-height: 125%;
      letter-spacing: -0.076px;
    }

    .round-list {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(4, minmax(386px, 1fr));
      row-gap: 36px;
      column-gap: 36px;

      .round-item {
        display: flex;
        flex-direction: column;
        height: 480px;
        padding: 28px 36px;
        align-items: center;
        flex: 1;
        border-radius: 24px;
        background: rgba(250, 250, 252, 0.69);
        flex-shrink: 0;

        .round-item-top {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 32px;
          align-self: stretch;

          .round-item-title {
            color: #1d1d1f;
            font-family: Urbanist;
            font-size: 32px;
            font-style: normal;
            font-weight: 800;
            line-height: 130%;
          }

          .quantity {
            color: #86868b;
            text-align: center;
            font-family: Urbanist;
            font-size: 16px;
            font-style: normal;
            font-weight: 500;
            line-height: 130%;
          }

          .price {
            display: flex;
            padding: 6px 12px;
            justify-content: center;
            align-items: center;
            border-radius: 80px;
            border: 1px solid #1d1d1f;
            color: #1d1d1f;
            text-align: center;
            font-family: Urbanist;
            font-size: 16px;
            font-style: normal;
            font-weight: 500;
            line-height: 130%;
          }
        }

        .round-item-bottom {
          display: flex;
          align-items: flex-end;
          flex: 1;
        }

        &:first-child {
          .round-item-bottom {
            img {
              width: 200px;
              height: 200px;
            }
          }
        }

        &:nth-child(2) {
          .round-item-bottom {
            margin-bottom: -28px;

            img {
              width: 200px;
              height: 242px;
            }
          }
        }

        &:nth-child(3) {
          .round-item-bottom {
            img {
              width: 314px;
              height: 160px;
            }
          }
        }

        &:nth-child(4) {
          .round-item-bottom {
            margin-bottom: -28px;

            img {
              width: 314px;
              height: 218px;
            }
          }
        }

        &.active {
          background: #fff;
        }
      }
    }
  }

  .feature-section {
    display: flex;
    flex-direction: column;
    // align-items: center;
    gap: 24px;
    align-self: stretch;

    .feature-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .feature-title {
        color: #1d1d1f;
        font-family: Urbanist;
        font-size: 32px;
        font-weight: 800;
        line-height: 40px;
        letter-spacing: -0.076px;
      }
    }

    .feature-card {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      row-gap: 24px;
      column-gap: 24px;

      .card {
        display: flex;
        padding: 24px;
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
        flex: 1 0 0;
        border-radius: 24px;
        background: #fff;

        .card-title {
          color: #1d1d1f;
          font-family: Urbanist;
          font-size: 24px;
          font-style: normal;
          font-weight: 800;
          line-height: 130%;
          /* 31.2px */
        }

        .list {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          row-gap: 16px;
          column-gap: 16px;

          .list-item {
            display: flex;
            // height: 160px;
            padding: 16px;
            flex-direction: column;
            align-items: flex-start;
            flex: 1 0 0;
            border-radius: 16px;
            background: rgba(250, 250, 252, 0.69);

            .svg-icon {
              width: 24px;
              height: 24px;
            }

            .list-item-title {
              margin-top: 12px;
              color: #1d1d1f;
              font-family: Urbanist;
              font-size: 18px;
              font-style: normal;
              font-weight: 800;
              line-height: 130%;
              /* 23.4px */
            }

            .list-item-desc {
              margin-top: 8px;
              color: #86868b;
              font-family: Urbanist;
              font-size: 16px;
              font-style: normal;
              font-weight: 500;
              line-height: 130%;
              /* 20.8px */

              .br-tag {
                display: block;
              }
            }
          }

          .list-item.full-width {
            grid-column: span 2;
          }
        }
      }
    }
  }

  .benefits-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    align-self: stretch;

    .benefits-title {
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 32px;
      font-style: normal;
      font-weight: 800;
      line-height: 40px;
      /* 125% */
      letter-spacing: var(--letter-spacing--0_08, -0.076px);
    }

    .card-list {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      row-gap: 24px;
      column-gap: 24px;
    }

    .card {
      display: flex;
      // height: 200px;
      padding: 28px 36px;
      justify-content: center;
      align-items: center;
      gap: 72px;
      flex: 1 0 0;
      border-radius: 24px;
      background: #fff;

      .info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        flex: 1 0 0;

        .card-title {
          color: #1d1d1f;
          font-family: Urbanist;
          font-size: 18px;
          font-style: normal;
          font-weight: 800;
          line-height: 130%;
          /* 23.4px */
        }

        .card-desc {
          color: #86868b;
          font-family: Urbanist;
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
          line-height: 130%;
          /* 20.8px */
        }
      }

      .svg-icon {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
      }
    }
  }
}

@media (min-width: 1921px) {
  .perceptron-view {
    padding: calc(44 * 100vw / 1920) calc(28 * 100vw / 1920);
    gap: calc(72 * 100vw / 1920);

    .nft-section {
      padding-top: calc(40 * 100vw / 1920);
      gap: calc(64 * 100vw / 1920);

      .nft-header {
        gap: calc(12 * 100vw / 1920);

        .nft-title {
          font-size: calc(44 * 100vw / 1920);
        }

        .nft-desc {
          font-size: calc(18 * 100vw / 1920);
        }
      }

      .nft-container {
        gap: calc(24 * 100vw / 1920);
        max-height: calc(960 * 100vw / 1920);

        .nft-image-box {
          border-radius: calc(24 * 100vw / 1920);
        }

        .nft-trade-box {
          width: calc(548 * 100vw / 1920);
          padding: calc(24 * 100vw / 1920);
          gap: calc(24 * 100vw / 1920);
          border-radius: calc(32 * 100vw / 1920);

          .nft-trade-top-box {
            gap: calc(20 * 100vw / 1920);

            .top-box {
              .countdown {
                font-size: calc(32 * 100vw / 1920);
              }

              .coming-soon {
                padding: calc(6 * 100vw / 1920) calc(8 * 100vw / 1920);
                gap: calc(8 * 100vw / 1920);
                border-radius: calc(6 * 100vw / 1920);
                font-size: calc(16 * 100vw / 1920);
              }
            }

            .bottom-box {
              gap: calc(12 * 100vw / 1920);

              .bottom-box-title {
                font-size: calc(16 * 100vw / 1920);
              }

              .bottom-box-desc {
                font-size: calc(14 * 100vw / 1920);
              }
            }
          }

          .nft-progress-box {
            gap: calc(12 * 100vw / 1920);

            .progress-info {
              height: calc(22 * 100vw / 1920);

              .info-left {
                gap: calc(8 * 100vw / 1920);

                .svg-icon {
                  width: calc(24 * 100vw / 1920);
                  height: calc(24 * 100vw / 1920);
                }

                .info-left-text {
                  font-size: calc(16 * 100vw / 1920);
                }
              }

              .info-right {
                gap: calc(4 * 100vw / 1920);

                .info-right-text {
                  font-size: calc(16 * 100vw / 1920);
                }
              }
            }
          }

          .nft-trade-action {
            gap: calc(24 * 100vw / 1920);

            .mint-box {
              gap: calc(24 * 100vw / 1920);

              .mint-limit {
                gap: calc(12 * 100vw / 1920);

                .mint-limit-label {
                  font-size: calc(16 * 100vw / 1920);
                }

                .mint-limit-value {
                  padding: calc(2 * 100vw / 1920) calc(8 * 100vw / 1920);
                  gap: calc(4 * 100vw / 1920);
                  border-radius: calc(4 * 100vw / 1920);
                  font-size: calc(11 * 100vw / 1920);
                }
              }

              .mint-box-form {
                gap: calc(24 * 100vw / 1920);

                .mint-box-left {
                  gap: calc(12 * 100vw / 1920);

                  .price-box {
                    .price-box-label {
                      font-size: calc(14 * 100vw / 1920);
                    }

                    .price-box-value {
                      gap: calc(8 * 100vw / 1920);

                      .svg-icon {
                        width: calc(13.878 * 100vw / 1920);
                        height: calc(11.226 * 100vw / 1920);
                      }

                      .price-box-value-text {
                        font-size: calc(16 * 100vw / 1920);
                      }
                    }
                  }

                  .mint-num-box {
                    .mint-num-box-input {
                      gap: calc(12 * 100vw / 1920);

                      .ant-input-number {
                        height: calc(48 * 100vw / 1920);
                        border-radius: calc(12 * 100vw / 1920);
                      }

                      :deep(.ant-input-number-handler-wrap) {
                        border-radius: calc(12 * 100vw / 1920);
                      }

                      :deep(.ant-input-number-input) {
                        font-size: calc(16 * 100vw / 1920);
                        line-height: calc(18 * 100vw / 1920);
                        height: calc(48 * 100vw / 1920);
                      }

                      .mint-num-box-input-icon {
                        width: calc(28 * 100vw / 1920);
                        height: calc(28 * 100vw / 1920);
                        border-radius: calc(28 * 100vw / 1920);

                        .svg-icon {
                          width: calc(28 * 100vw / 1920);
                          height: calc(28 * 100vw / 1920);
                        }
                      }
                    }
                  }
                }

                .mint-box-right {
                  width: calc(180 * 100vw / 1920);
                  gap: calc(12 * 100vw / 1920);

                  .referral-code-label {
                    font-size: calc(14 * 100vw / 1920);
                  }

                  .referral-code-input input {
                    height: calc(48 * 100vw / 1920);
                    padding: 0px calc(16 * 100vw / 1920);
                    border-radius: calc(12 * 100vw / 1920);
                    font-size: calc(16 * 100vw / 1920);

                    &::placeholder {
                      font-size: calc(16 * 100vw / 1920);
                    }
                  }
                }
              }
            }
          }

          .nft-trade-bottom-box {
            gap: calc(12 * 100vw / 1920);

            .my-code-box,
            .my-link-box {
              padding: calc(12 * 100vw / 1920) calc(16 * 100vw / 1920);
              gap: calc(8 * 100vw / 1920);
              border-radius: calc(12 * 100vw / 1920);

              .my-code-label,
              .my-link-label {
                font-size: calc(14 * 100vw / 1920);
              }

              .my-code-value {
                font-size: calc(14 * 100vw / 1920);

                .code-text {
                  font-size: calc(18 * 100vw / 1920);
                  letter-spacing: calc(4 * 100vw / 1920);
                }

                .svg-icon {
                  width: calc(20 * 100vw / 1920);
                  height: calc(20 * 100vw / 1920);
                }
              }

              .my-link-value {
                .code-text {
                  font-size: calc(14 * 100vw / 1920);
                }

                .svg-icon {
                  width: calc(20 * 100vw / 1920);
                  height: calc(20 * 100vw / 1920);
                }
              }
            }

            .my-friends-box {
              padding: calc(12 * 100vw / 1920) calc(16 * 100vw / 1920);
              border-radius: calc(12 * 100vw / 1920);

              .my-friends-label {
                font-size: calc(14 * 100vw / 1920);
              }

              .my-friends-value {
                gap: calc(6.095 * 100vw / 1920);
                border-radius: calc(6.095 * 100vw / 1920);
                font-size: calc(24 * 100vw / 1920);
              }
            }
          }
        }
      }
    }

    .round-section {
      gap: calc(24 * 100vw / 1920);

      .round-title {
        font-size: calc(32 * 100vw / 1920);
      }

      .round-list {
        row-gap: calc(36 * 100vw / 1920);
        column-gap: calc(36 * 100vw / 1920);

        .round-item {
          height: calc(480 * 100vw / 1920);
          padding: calc(28 * 100vw / 1920) calc(36 * 100vw / 1920);
          border-radius: calc(24 * 100vw / 1920);

          .round-item-top {
            gap: calc(32 * 100vw / 1920);

            .round-item-title {
              font-size: calc(32 * 100vw / 1920);
            }

            .quantity {
              font-size: calc(16 * 100vw / 1920);
            }

            .price {
              padding: calc(6 * 100vw / 1920) calc(12 * 100vw / 1920);
              border-radius: calc(80 * 100vw / 1920);
              font-size: calc(16 * 100vw / 1920);
            }
          }

          &:first-child {
            .round-item-bottom {
              img {
                width: calc(200 * 100vw / 1920);
                height: calc(200 * 100vw / 1920);
              }
            }
          }

          &:nth-child(2) {
            .round-item-bottom {
              margin-bottom: calc(-28 * 100vw / 1920);

              img {
                width: calc(200 * 100vw / 1920);
                height: calc(242 * 100vw / 1920);
              }
            }
          }

          &:nth-child(3) {
            .round-item-bottom {
              img {
                width: calc(314 * 100vw / 1920);
                height: calc(160 * 100vw / 1920);
              }
            }
          }

          &:nth-child(4) {
            .round-item-bottom {
              margin-bottom: calc(-28 * 100vw / 1920);

              img {
                width: calc(314 * 100vw / 1920);
                height: calc(218 * 100vw / 1920);
              }
            }
          }
        }
      }
    }

    .feature-section {
      gap: calc(24 * 100vw / 1920);

      .feature-header {
        gap: calc(8 * 100vw / 1920);

        .feature-title {
          font-size: calc(32 * 100vw / 1920);
          line-height: calc(40 * 100vw / 1920);
        }
      }

      .feature-card {
        row-gap: calc(24 * 100vw / 1920);
        column-gap: calc(24 * 100vw / 1920);

        .card {
          padding: calc(24 * 100vw / 1920);
          gap: calc(24 * 100vw / 1920);
          border-radius: calc(24 * 100vw / 1920);

          .card-title {
            font-size: calc(24 * 100vw / 1920);
          }

          .list {
            row-gap: calc(16 * 100vw / 1920);
            column-gap: calc(16 * 100vw / 1920);

            .list-item {
              padding: calc(16 * 100vw / 1920);
              border-radius: calc(16 * 100vw / 1920);
              background: rgba(250, 250, 252, 0.69);

              .svg-icon {
                width: calc(24 * 100vw / 1920);
                height: calc(24 * 100vw / 1920);
              }

              .list-item-title {
                margin-top: calc(12 * 100vw / 1920);
                font-size: calc(18 * 100vw / 1920);
              }

              .list-item-desc {
                margin-top: calc(8 * 100vw / 1920);
                font-size: calc(16 * 100vw / 1920);
              }
            }

            .list-item.full-width {
              grid-column: span 2;
            }
          }
        }
      }
    }

    .benefits-section {
      gap: calc(24 * 100vw / 1920);

      .benefits-title {
        font-size: calc(32 * 100vw / 1920);
        line-height: calc(40 * 100vw / 1920);
      }

      .card-list {
        row-gap: calc(24 * 100vw / 1920);
        column-gap: calc(24 * 100vw / 1920);
      }

      .card {
        padding: calc(28 * 100vw / 1920) calc(36 * 100vw / 1920);
        gap: calc(72 * 100vw / 1920);
        border-radius: calc(24 * 100vw / 1920);

        .info {
          gap: calc(16 * 100vw / 1920);

          .card-title {
            font-size: calc(18 * 100vw / 1920);
          }

          .card-desc {
            font-size: calc(16 * 100vw / 1920);
          }
        }

        .svg-icon {
          width: calc(80 * 100vw / 1920);
          height: calc(80 * 100vw / 1920);
        }
      }
    }
  }
}

@media (max-width: 1920px) {
  .perceptron-view {
    .nft-section {
      gap: clamp(32px, calc(40px - 32 / 480 * (1920px - 100vw)), 40px);
    }

    .round-section .round-list {
      grid-template-columns: repeat(2, minmax(375px, 1fr));
    }
  }
}

@media (max-width: 1780px) {
  .perceptron-view {
    .feature-section .feature-card {
      grid-template-columns: repeat(1, 1fr);

      .card .list .list-item .list-item-desc {

        .br-tag,
        .br-tag2 {
          display: none;
        }
      }
    }

    .benefits-section .card-list {
      grid-template-columns: repeat(1, 1fr);
    }
  }
}

@media (max-width: 1280px) {
  .perceptron-view {
    padding: clamp(32px, calc(40px - 8 / 446 * (1280px - 100vw)), 40px) clamp(24px, calc(28px - 4 / 446 * (1280px - 100vw)), 28px);

    .nft-section {
      padding-top: 0;
    }

    .mint-record-section {
      margin-left: -24px;
      margin-right: -24px;
    }
  }
}

@media (max-width: 1100px) {
  .perceptron-view {
    .nft-section .nft-container {
      flex-direction: column;
      max-height: fit-content;

      .nft-trade-box {
        width: 100%;
      }
    }
  }
}

@media (max-width: 834px) {
  .perceptron-view {
    padding: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px) clamp(16px, calc(24px - 4 / 459 * (834px - 100vw)), 24px);
    gap: clamp(40px, calc(64px - 24 / 459 * (834px - 100vw)), 64px);

    .nft-section .nft-header {
      .nft-title {
        font-size: clamp(32px, calc(44px - 12 / 459 * (834px - 100vw)), 44px);
      }

      .nft-desc {
        font-size: clamp(16px, calc(18px - 2 / 459 * (834px - 100vw)), 18px);
      }
    }

    .nft-section .nft-container .nft-trade-box .nft-trade-top-box .top-box {
      .countdown {
        font-size: clamp(24px, calc(32px - 12 / 459 * (834px - 100vw)), 32px);
      }

      .countdown-label {
        font-size: clamp(14px, calc(16px - 2 / 459 * (834px - 100vw)), 16px);
      }
    }

    .round-section {
      .round-list {
        grid-template-columns: repeat(1, minmax(100%, 1fr));

        .round-item .round-item-top {
          gap: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px);

          .round-item-title {
            font-size: clamp(18px, calc(24px - 6 / 459 * (834px - 100vw)), 24px);
          }

          .quantity,
          .price {
            font-size: clamp(14px, calc(16px - 2 / 459 * (834px - 100vw)), 16px);
          }
        }
      }

      .round-title {
        font-size: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px);
      }
    }

    .mint-record-section {
      margin-left: -16px;
      margin-right: -16px;
    }
  }
}

@media (max-width: 540px) {
  .perceptron-view {
    .nft-section .nft-container .nft-trade-box .nft-trade-top-box .top-box {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .nft-section .nft-container .nft-trade-box .nft-trade-action .mint-box .mint-limit {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .nft-section .nft-container .nft-trade-box .nft-trade-action .mint-box .mint-box-form {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;

      .mint-box-left {
        width: 100%;
      }

      .mint-box-right {
        width: 100%;

        .referral-code-input {
          width: 100%;
        }
      }
    }
  }
}
</style>