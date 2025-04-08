<script lang="ts" setup>
import { gsap } from 'gsap'
import { message } from 'ant-design-vue'
import useClipboard from 'vue-clipboard3'
import { useUserStore } from '@/stores/user'
import { usePointsStore } from '@/stores/points'
import { useQuestStore } from '@/stores/quest'
import type { SharingTask } from '@/types/models'
import { request } from '@/apis/request'
import { useWallet } from '@/hooks/useWallet'
import { nextTick, onMounted, ref, watch } from 'vue'
import { toThousands } from '@/utils/number'
import { getPerceptronCount, getRetweetList } from '@/apis/game_tasks'
import { useModalStore } from '@/stores/modal'

const userStore = useUserStore();
const questStore = useQuestStore();
const pointsStore = usePointsStore();
const modalStore = useModalStore();

const perceptronCount = ref<number | string>(0)
const { checkInWithPhantom, solanaWallets, checkInWithEVM } = useWallet();
const { toClipboard } = useClipboard();

const isSubmitting = ref<boolean>(false);
const currentQuest = ref<SharingTask | null>(null);
const showModalDownload = ref<boolean>(false);

const isCustomSchemeSupported = (scheme: string) => {
  return new Promise((resolve) => {
    const originalFocus = document.hasFocus(); // 记录当前页面是否聚焦

    // 尝试跳转
    window.location.href = scheme;

    // 检测页面是否失去焦点
    setTimeout(() => {
      const isFocused = document.hasFocus();
      resolve(!isFocused); // 如果页面失去焦点，说明协议存在
    }, 100); // 100ms 后检测
  });
}
const handleClick = async (item: SharingTask) => {
  const oneTime = item?.dailyLimit === 0 && item.rewardDirect === true && item.code !== 'sol_checkin' && item.code !== 'evm_checkin' && item?.code !== 'client_active';
  const daily = item?.dailyLimit === 1 && item.code !== 'sol_checkin' && item.code !== 'evm_checkin' && item.code !== 'client_active';
  const taptap = item?.code === 'sol_checkin' || item?.code === 'evm_checkin';
  const clientActive = item?.code === 'client_active';

  if (!userStore.accessToken) {
    modalStore.toggleLoginEntryModal(true);
    return;
  }

  if ((item.completed && item.code !== 'sol_checkin' && item.code !== 'evm_checkin' && item.code !== 'client_active') || !item.isEnabled || item.loading) return;

  if (daily) {
    currentQuest.value = item;
    currentQuest.value.loading = true;
    currentQuest.value.clickTime = new Date().getTime();
  } else {
    currentQuest.value = item;
    currentQuest.value.loading = true;
  }

  item.loading = true
  try {
    // 分享视频
    if (item.code === 'share_video' && item.action) {
      const res: any = await request({
        url: item.action,
        method: 'GET'
      })

      await questStore.shareVideo()
      const redirectUrl = res.redirectUrl

      window.open(redirectUrl, '_blank')
    } else if (item.code === 'sol_checkin') {
      // 在这里我希望实现通过solana-wallets-vue来唤起phantom钱包，然后去memo程序签到，发送一段字符串
      try {
        await checkInWithPhantom()
        // 签到成功后更新任务状态
        await questStore.directRewardQuest(item.code)
      } catch (error) {
        console.error(error)
      }
    } else if (item.code === 'evm_checkin') {
      try {
        await checkInWithEVM()
        // 签到成功后更新任务状态
        await questStore.directRewardQuest(item.code)
      } catch (error) {
        console.error(error)
      }
    } else if (item.code === 'client_active') {
      try {
        isCustomSchemeSupported('gamerboom://desktop/index.html?status=').then((isSupported) => {
          if (!isSupported) {
            showModalDownload.value = true
          }
        });
      } catch (error) {
        console.error('not install client.', error)
        showModalDownload.value = true
      }
      item.loading = false;
    } else if (item.code.includes('share') && item.action) {
      const res: any = await request({
        url: item.action,
        method: 'GET'
      })
      const redirectUrl = res.redirectUrl
      window.open(redirectUrl, '_blank')
    } else if (item.code === '@1') {
      try {
        // 在请求开始时设置加载状态
        item.loading = true
        // 等待获取用户名列表
        await handleGetRetweetList(item.redirectUrl ?? '')
        await questStore.directRewardQuest(item.code)
      } catch (error) {
        console.error('获取用户名列表失败:', error)
        message.error('获取数据失败，请稍后再试')
      } finally {
        // 确保无论成功或失败都重置加载状态
        setTimeout(() => {
          item.loading = false
        }, 1000)
      }
    } else if (item.rewardDirect) {
      if (isSubmitting.value) return;
      isSubmitting.value = true;
      // await questStore.directRewardQuest(item.code)
      setTimeout(() => {
        isSubmitting.value = false;
      }, 1000);
      if (item.redirectUrl) window.open(item.redirectUrl, '_blank')
    } else if (item.redirectUrl) {
      window.open(item.redirectUrl, '_blank')
    } else if (item.code.toLowerCase().includes('invite')) {
      handleShare()
    }

    if (oneTime) {
      currentQuest.value.loading = true;
      await questStore.directRewardQuest(item.code);
      // 一次性任务，5秒后刷新任务列表
      setTimeout(async () => {
        await questStore.fetchTaskList(pointsStore.currentSeason.id);
      }, 5000);
    } else if (taptap) {
      // TapTap任务，立即刷新任务列表
      currentQuest.value.loading = true;
      await questStore.fetchTaskList(pointsStore.currentSeason.id);
    }
  } catch (error) {
    isSubmitting.value = false;
    currentQuest.value.loading = true;
    item.loading = false;
    console.error(error);
  }
}

// Copy Referral Link
const handleShare = async () => {
  const inviteCode = userStore.account.socialInviteCode
  const url = `${location.href}?invite=${inviteCode}`

  try {
    await toClipboard(url)
    message.success('Copied success!')
  } catch (error) {
    console.error(error)
  }
}

const isFirstLoad = ref(true)
const isTaskListLoading = ref(false)

// 切换赛季，更新日常任务列表
watch(
  () => pointsStore.currentSeason,
  async (newVal) => {
    if (!newVal.id) return
    isTaskListLoading.value = true
    await questStore.fetchTaskList(newVal.id)
    await nextTick()
    isTaskListLoading.value = false
  },
  {
    immediate: true
  }
)

document.addEventListener('visibilitychange', async function () {
  const daily = currentQuest.value?.dailyLimit === 1 && currentQuest.value.code !== 'sol_checkin' && currentQuest.value.code !== 'evm_checkin' && currentQuest.value.code !== 'client_active';

  if (document.visibilityState !== 'visible' || !currentQuest.value?.clickTime || !daily) return;

  // 保存当前任务的引用，避免异步操作期间值被改变
  const current = currentQuest.value;
  const time = current.clickTime;
  const now = Date.now();
  const duration = now - (time ?? 0);

  try {
    if (duration > 5000) {
      // 确保任务代码存在后再执行
      if (!current.code) {
        console.error('Quest code is missing');
        return;
      }

      await questStore.directRewardQuest(current.code);

      // 使用保存的任务引用，避免闭包问题
      setTimeout(() => {
        current.loading = false;
        current.failed = false;

        // 确保赛季ID存在
        const seasonId = pointsStore.currentSeason?.id;
        if (seasonId) {
          questStore.fetchTaskList(seasonId);
        } else {
          console.warn('No active season found');
        }

        // 安全清空当前任务
        currentQuest.value = null;
      }, 5000);
    } else {
      console.log('Task not completed, retrying in 5 seconds');
      current.failed = true;
      current.loading = false;
      // 立即清空任务（根据业务需求决定）
      currentQuest.value = null;
    }
  } catch (error) {
    console.error('Error handling visibility change:', error);
    current.failed = true;
    current.loading = false;
    currentQuest.value = null;
  }
});

const handleAnimation = () => {
  const tl = gsap.timeline()
  tl.from('.share-card', {
    delay: 1.11
  })
    .from('.share-card .wrapper .title', {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'circ.out'
    })
    .from(
      '.share-card .view',
      {
        opacity: 0,
        ease: 'circ.out'
      },
      '<=0.3'
    )
    .from(
      '.share-card .view .notes',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.1'
    )
    .from(
      '.share-card .view .list',
      {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'circ.out'
      },
      '<=0.3'
    )
}

// NFT相关方法
const handleEarningsBoost = () => {
  window.open('https://magiceden.us/marketplace/perceptron', '_blank')
}

const handleGetPerceptronCount = async () => {
  try {
    const res: any = await getPerceptronCount()
    perceptronCount.value = res.count
  } catch (error) {
    perceptronCount.value = '--'
  }
}
const extractUsernames = (data: any[]) => {
  return data.map((item) => {
    // 匹配URL中域名后面的字符串部分
    const regex = /https?:\/\/[^\/]+\/([^\/\s]+)/
    const match = item.url.match(regex)
    return {
      id: item.id,
      name: item.name,
      url: item.url,
      username: match ? '@' + match[1] : null
    }
  })
}
const handleGetRetweetList = async (redirectUrl: any) => {
  try {
    const res: any = await getRetweetList()
    console.log('res', res)
    const usernamesResult = extractUsernames(res)
    const usernames = usernamesResult.map((item) => item.username)
    const usernamesString = usernames.join(' ')
    window.open(`${redirectUrl}${usernamesString}`, '_blank')
  } catch (error) {
    console.error(error)
  }
}
onMounted(() => {
  handleAnimation()
  handleGetPerceptronCount()
})

// 监视用户是否登录和solanaWallets, 刷取任务列表
watch([() => userStore.accessToken, solanaWallets], async () => {
  await questStore.fetchTaskList(pointsStore.currentSeason.id)
  isFirstLoad.value = false
})
</script>

<template>
  <div class="shareCardContainer">
    <div class="shareCardWrapper">
      <div class="shareCardTitle">Social Quests</div>
      <!-- <div class="shareCardDesc">Earn GPT by engaging with us on X/Twitter</div> -->
    </div>
    <div class="shareCardContent">
      <div class="shareCardContentNotes">
        <div class="shareCardContentNotesTitle">
          <SvgIcon name="social-anchor" />
          <span>Notes</span>
        </div>
        <div class="notes-nft-container">
          <div class="shareCardContentNotesWrapper">
            <!-- <p>Before participating in Social Quests, please link your social media accounts.</p> -->
            <p>Take part in Social Quests to earn points and exciting rewards.</p>
            <p>Invite friends and share the benefits together! Both you and your invitees win.</p>
            <p>NFT holders will unlock an exclusive mystery bonus.</p>
          </div>

          <!-- NFT信息块 -->
          <div class="nft-card">
            <div class="nft-info">
              <div class="nft-icon-wrapper">
                <div class="nft-icon">
                  <svg-icon name="nft-icon" />
                </div>
                <div class="nft-text">
                  <div class="nft-label">
                    <span>NFT Quantity</span>
                    <div class="info-icon">
                      <svg-icon name="info-circle" />
                      <div class="tooltip">
                        <p>Boosts can stack—the more you hold, the higher the cumulative bonus.</p>
                        <p>The system will periodically scan and update your holdings status.</p>
                      </div>
                    </div>
                  </div>
                  <div class="nft-value">{{ perceptronCount }}</div>
                </div>
              </div>
            </div>
            <button class="earnings-boost" @click="handleEarningsBoost">Buy</button>
          </div>
        </div>
      </div>

      <div class="shareCardContentQuests">
        <div class="shareCardContentQuestsTitle">
          <SvgIcon name="social-anchor" />
          <span>Quests</span>
        </div>
        <a-skeleton v-if="isTaskListLoading" :active="true" :paragraph="{ rows: 8 }" />

        <div v-else-if="!questStore.rewardTaskList.length" class="emptyWrapper">
          <Empty>
            <template #description>
              <div class="emptyWrapperTitle">No quests yet</div>
              <div class="emptyWrapperDesc">Please follow the latest season.</div>
            </template>
          </Empty>
        </div>
        <div v-else class="shareCardContentQuestsItem" :class="{
          disable: (item?.completed || !item?.isEnabled) && item?.code !== 'sol_checkin' && item?.code !== 'evm_checkin' && item?.code !== 'client_active',
          oneTime:
            item?.dailyLimit === 0 && item.rewardDirect === true && item.code !== 'sol_checkin' && item.code !== 'evm_checkin' && item?.code !== 'client_active',
          daily: item?.dailyLimit === 1 && item.code !== 'sol_checkin' && item.code !== 'evm_checkin',
          taptap: item?.code === 'sol_checkin' || item?.code === 'evm_checkin',
        }" v-for="item in questStore.rewardTaskList" :key="item.id">
          <div class="shareCardContentQuestsItemLeft">
            <div class="shareCardContentQuestsItemLeftIcon">
              <img :src="item.icon" />
            </div>
            <div class="shareCardContentQuestsItemLeftInfo">
              <div class="shareCardContentQuestsItemLeftInfoTitle" v-html="item.displayText || item.name"></div>
              <div class="shareCardContentQuestsItemLeftInfoTypeOneTime"
                v-if="item.dailyLimit === 0 && item.code !== 'sol_checkin' && item.code !== 'evm_checkin'">
                <span>One-Time Quest</span>
              </div>
              <div class="shareCardContentQuestsItemLeftInfoTypeDaily"
                v-if="item.dailyLimit === 1 && item.code !== 'sol_checkin' && item.code !== 'evm_checkin'">
                <span>Daily Quests</span>
              </div>
            </div>
          </div>
          <div class="shareCardContentQuestsItemCount">
            <SvgIcon name="dashboard-check" v-if="item.completed" />
            <span>{{ toThousands(item.amount ?? 0) }}</span>
            <SvgIcon name="dashboard-score" />
          </div>
          <div class="shareCardContentQuestsItemRight">
            <div class="shareCardContentQuestsItemRightButton" :class="{
              loading: item.loading || currentQuest?.value?.loading,
              disabled: (item.completed || !item.isEnabled) && item.code !== 'sol_checkin' && item.code !== 'evm_checkin' && item.code !== 'client_active',
              taptap: item.code === 'sol_checkin' || item.code === 'evm_checkin',
            }" @click="handleClick(item)">
              <span v-if="(item.loading || currentQuest?.value?.loading) && item.code !== 'client_active'">
                <SvgIcon name="dashboard-loading" class="loading" />
                Verifying
              </span>
              <span v-else-if="item.failed || currentQuest?.value?.failed">
                Retry
              </span>
              <span v-else-if="
                item.completed &&
                item.dailyLimit === 0 &&
                item.rewardDirect === true &&
                item.code !== 'sol_checkin' &&
                item.code !== 'evm_checkin' &&
                item.code !== 'client_active'
              ">
                Completed
              </span>
              <span
                v-else-if="item.completed && item.dailyLimit === 1 && item.code !== 'sol_checkin' && item.code !== 'evm_checkin' && item.code !== 'client_active'">
                Next Day
              </span>
              <span v-else-if="!item.isEnabled">Disabled</span>
              <span v-else-if="item.code === 'sol_checkin' || item.code === 'evm_checkin'">TapTap</span>
              <span v-else>Go</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <modal-download-confirm v-model="showModalDownload" />
</template>

<style lang="scss" scoped>
.shareCardContainer {
  display: flex;
  padding: 0px 28px 16px 28px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;

  .shareCardWrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .shareCardTitle {
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 32px;
      font-style: normal;
      font-weight: 800;
      line-height: 125%;
      letter-spacing: var(--letter-spacing--0_08, -0.076px);
    }

    .shareCardDesc {
      max-width: 658px;
      color: #1d1d1f;
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 157.143%;
    }
  }

  .shareCardContent {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    gap: 24px;

    .shareCardContentNotes {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      border-radius: 16px;
      background: #fff;
      padding: 16px;
      width: 50%;
      gap: 16px;

      .shareCardContentNotesTitle {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;

        .svg-icon {
          width: 20px;
          height: 20px;
        }

        span {
          color: var(--color-primary);
          font-size: 16px;
          font-weight: 700;
          line-height: 150%;
          letter-spacing: 0.196px;
        }
      }

      .notes-nft-container {
        display: flex;
        gap: 16px;
        width: 100%;

        .shareCardContentNotesWrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          align-self: stretch;

          p {
            padding: 8px;
            font-size: 12px;
            color: #1d1d1f;
            background-color: #f5f5f5;
            border-radius: 6px;
            letter-spacing: 0.196px;
            width: 100%;
          }
        }

        .nft-card {
          flex: 1;
          background: #fafafa;
          border-radius: 12px;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 8px;

          .nft-info {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            padding: 16px;
            border-radius: 8px;

            .nft-icon-wrapper {
              display: flex;
              align-items: center;
              gap: 16px;

              .nft-icon {
                width: 56px;
                height: 56px;
                // background: #1d1d1f;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;

                .svg-icon {
                  width: 56px;
                  height: 56px;
                  color: #1d1d1f;
                }
              }

              .nft-text {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .nft-label {
                  color: #575757;
                  text-align: center;
                  font-family: Urbanist;
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: 140%;
                  /* 19.6px */
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }

                .nft-value {
                  color: #0d0d0d;
                  font-family: Urbanist;
                  font-size: 24px;
                  font-style: normal;
                  font-weight: 700;
                  line-height: 120%;
                  /* 28.8px */
                  letter-spacing: -0.12px;
                }
              }
            }

            .info-icon {
              width: 16px;
              height: 16px;
              color: #86868b;
              cursor: pointer;
              position: relative;
              margin-bottom: 4px;

              .tooltip {
                display: none;
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-top: 8px;
                padding: 8px 12px;
                background: #1d1d1f;
                border-radius: 8px;
                font-size: 12px;
                line-height: 16px;
                color: #ffffff;
                white-space: nowrap;
                z-index: 1000;
                text-align: start;
              }

              &:hover .tooltip {
                display: block;
              }

              .svg-icon {
                width: 16px;
                height: 16px;
              }
            }
          }

          .earnings-boost {
            width: 100%;
            height: 48px;
            background-color: white;
            border: 1px solid #0d0d0d;
            border-radius: 100px;
            font-family: 'Urbanist', sans-serif;
            font-size: 16px;
            font-weight: 600;
            line-height: 24px;
            color: #0d0d0d;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background-color: rgba(0, 0, 0, 0.02);
              border-color: rgba(0, 0, 0, 0.15);
            }
          }
        }
      }
    }
  }

  .shareCardContentQuests {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    border-radius: 16px;
    background: #fff;
    padding: 16px;
    width: 50%;
    gap: 16px;

    .shareCardContentQuestsTitle {
      display: flex;
      align-items: center;
      gap: 12px;

      .svg-icon {
        width: 20px;
        height: 20px;
      }

      span {
        color: var(--color-primary);
        font-size: 16px;
        font-weight: 700;
        line-height: 150%;
        letter-spacing: 0.196px;
      }
    }

    .emptyWrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      flex-shrink: 0;
      border-radius: 12px;
      background: #f5f5f7;

      :deep(.svg-icon) {
        opacity: 1;
      }

      :deep(.text) {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        align-self: stretch;

        .emptyWrapperTitle {
          color: #1d1d1f;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          line-height: 112.5%;
        }

        .emptyWrapperDesc {
          color: #6e6e73;
          text-align: center;
          font-size: 12px;
          font-weight: 400;
          line-height: 150%;
        }
      }
    }

    .shareCardContentQuestsItem {
      display: flex;
      padding: 13px 12px;
      justify-content: space-between;
      align-items: center;
      align-self: stretch;
      border-radius: 12px;
      background: #f5f5f7;
      width: 100%;
      gap: 20px;
      transition: all 0.3s ease-in-out;

      &.oneTime {
        background: #f6ecfc;
      }

      &.daily {
        background: #fff4e6;
      }

      &.disable {
        background: #f5f5f7;
        cursor: not-allowed;

        .shareCardContentQuestsItemRight {
          .shareCardContentQuestsItemRightButton {
            background: #f5f5f7;
            color: #1c1c1c;
            border: 1.5px solid #1c1c1c;
            cursor: not-allowed;

            &:hover {
              background: #f5f5f7;
              color: #1c1c1c;
            }
          }
        }
      }

      &.taptap {
        background: #e7f9f9;
      }

      .shareCardContentQuestsItemLeft {
        flex: 3;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        max-width: 60%;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        gap: 8px;

        .shareCardContentQuestsItemLeftIcon {
          width: 24px;
          height: 24px;
          aspect-ratio: 1/1;

          img {
            width: 100%;
            height: 100%;
            aspect-ratio: 1/1;
          }
        }

        .shareCardContentQuestsItemLeftInfo {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          .shareCardContentQuestsItemLeftInfoTitle {
            font-size: 16px;
            font-family: 'Urbanist';
            color: #1d1d1f;
            font-weight: 700;
            line-height: normal;
            width: 100%;

            * {
              font-size: 16px;
              font-family: 'Urbanist';
              color: #1d1d1f;
              font-weight: 700 !important;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 100%;
            }
          }

          .shareCardContentQuestsItemLeftInfoTypeOneTime {
            font-weight: 500;
            font-size: 12px;
            color: #a945e3;
          }

          .shareCardContentQuestsItemLeftInfoTypeDaily {
            font-weight: 500;
            font-size: 12px;
            color: #ff9300;
          }
        }
      }

      .shareCardContentQuestsItemCount {
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        max-width: 20%;
        width: 100%;
        gap: 4px;

        span {
          font-family: 'Urbanist';
          font-size: 16px;
          font-weight: 600;
          color: #1d1d1f;
          max-width: 100%;
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .svg-icon {
          width: 16px;
          height: 16px;
        }
      }

      .shareCardContentQuestsItemRight {
        flex: 3;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        max-width: 20%;
        width: 100%;

        .shareCardContentQuestsItemRightButton {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-radius: 999px;
          color: #1c1c1c;
          background: transparent;
          border: 1.5px solid #1c1c1c;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          gap: 6.5px;

          .svg-icon {
            width: 14px;
            height: 14px;
            color: #1c1c1c;
          }

          span {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-family: 'Urbanist';
            font-weight: 600;
            font-size: 16px;
            line-height: normal;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .svg-icon {
              width: 14px;
              height: 14px;
              aspect-ratio: 1/1;

              &.loading {
                animation: spin 1s linear infinite;
              }
            }
          }

          &:hover {
            background: #1c1c1c;
            color: #fff;
          }

          &.disabled {
            background: #f5f5f7;
            cursor: not-allowed;
          }

          &.taptap {
            color: #fff;
            background: #1c1c1c;

            span {
              color: #fff;

              .svg-icon {
                color: #fff;
              }
            }

            &:hover {
              background: #2e2e2e;
            }

            &:active {
              background: #000000;
              color: #bfbfbf;
            }
          }

          &.loading {
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

@media screen and (min-width: 1921px) {
  .shareCardContainer {
    padding: 0 calc(28 * 100vw / 1920) calc(16 * 100vw / 1920) calc(28 * 100vw / 1920);
    gap: calc(24 * 100vw / 1920);

    .shareCardWrapper {
      gap: calc(8 * 100vw / 1920);

      .shareCardTitle {
        font-size: calc(32 * 100vw / 1920);
      }

      .shareCardDesc {
        font-size: calc(14 * 100vw / 1920);
      }
    }

    .shareCardContent {
      padding: calc(16 * 100vw / 1920) calc(24 * 100vw / 1920);
      border-radius: calc(16 * 100vw / 1920);

      .shareCardContentNotes {
        gap: calc(24 * 100vw / 1920);

        .shareCardContentNotesTitle {
          gap: calc(12 * 100vw / 1920);

          .text {
            font-size: calc(16 * 100vw / 1920);
          }
        }

        .notes-nft-container {
          gap: calc(16 * 100vw / 1920);

          .shareCardContentNotesWrapper {
            gap: calc(12 * 100vw / 1920);

            p {
              font-size: calc(14 * 100vw / 1920);
            }
          }

          .nft-card {
            padding: calc(24 * 100vw / 1920);
            border-radius: calc(12 * 100vw / 1920);
          }
        }
      }

      .shareCardContentQuests {
        gap: calc(12 * 100vw / 1920);

        .shareCardContentQuestsTitle {
          gap: calc(12 * 100vw / 1920);

          span {
            font-size: calc(16 * 100vw / 1920);
          }
        }

        .emptyWrapper {
          padding: calc(12 * 100vw / 1920);
          border-radius: calc(12 * 100vw / 1920);

          :deep(.svg-icon) {
            opacity: 1;
          }

          :deep(.text) {
            gap: calc(4 * 100vw / 1920);

            .emptyWrapperTitle {
              font-size: calc(16 * 100vw / 1920);
            }

            .emptyWrapperDesc {
              font-size: calc(12 * 100vw / 1920);
            }
          }
        }

        .shareCardContentQuestsItem {
          padding: calc(13 * 100vw / 1920) calc(12 * 100vw / 1920);
          border-radius: calc(12 * 100vw / 1920);
          gap: calc(20 * 100vw / 1920);

          .shareCardContentQuestsItemLeft {
            .shareCardContentQuestsItemLeftInfo {
              .shareCardContentQuestsItemLeftInfoTitle {
                font-size: calc(16 * 100vw / 1920);

                * {
                  font-size: calc(16 * 100vw / 1920);
                }
              }

              .shareCardContentQuestsItemLeftInfoTypeOneTime {
                font-size: calc(12 * 100vw / 1920);
              }

              .shareCardContentQuestsItemLeftInfoTypeDaily {
                font-size: calc(12 * 100vw / 1920);
              }
            }
          }

          .shareCardContentQuestsItemCount {
            gap: calc(4 * 100vw / 1920);

            span {
              font-size: calc(16 * 100vw / 1920);
            }

            .svg-icon {
              width: calc(16 * 100vw / 1920);
              height: calc(16 * 100vw / 1920);
            }
          }

          .shareCardContentQuestsItemRight {
            .shareCardContentQuestsItemRightButton {
              padding: calc(12 * 100vw / 1920);
              border-radius: calc(999 * 100vw / 1920);
              gap: calc(6.5 * 100vw / 1920);

              .svg-icon {
                width: calc(14 * 100vw / 1920);
                height: calc(14 * 100vw / 1920);
              }

              span {
                font-size: calc(14 * 100vw / 1920);
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1280px) {
  .shareCardContainer {
    .shareCardContent {
      .shareCardContentQuests {
        .shareCardContentQuestsItem {
          .shareCardContentQuestsItemLeft {
            .shareCardContentQuestsItemLeftIcon {
              width: 20px;
              height: 20px;
            }

            .shareCardContentQuestsItemLeftInfo {
              .shareCardContentQuestsItemLeftInfoTitle {
                font-size: clamp(14px, calc(16px - 2 / 459 * (1280px - 100vw)), 16px);

                * {
                  font-size: clamp(14px, calc(16px - 2 / 459 * (1280px - 100vw)), 16px);
                }
              }

              .shareCardContentQuestsItemLeftInfoTypeOneTime {
                font-size: clamp(10px, calc(12px - 2 / 459 * (1280px - 100vw)), 12px);
              }

              .shareCardContentQuestsItemLeftInfoTypeDaily {
                font-size: clamp(10px, calc(12px - 2 / 459 * (1280px - 100vw)), 12px);
              }
            }
          }

          .shareCardContentQuestsItemCount {
            span {
              font-size: clamp(14px, calc(16px - 2 / 459 * (1280px - 100vw)), 16px);
            }

            .svg-icon {
              width: clamp(14px, calc(16px - 2 / 459 * (1280px - 100vw)), 16px);
              height: clamp(14px, calc(16px - 2 / 459 * (1280px - 100vw)), 16px);
            }
          }

          .shareCardContentQuestsItemRight {
            .shareCardContentQuestsItemRightButton {
              padding: clamp(10px, calc(12px - 2 / 459 * (1280px - 100vw)), 12px);
              gap: clamp(5px, calc(6.5px - 0.5 / 459 * (1280px - 100vw)), 6.5px);

              .svg-icon {
                width: clamp(12px, calc(14px - 2 / 459 * (1280px - 100vw)), 14px);
                height: clamp(12px, calc(14px - 2 / 459 * (1280px - 100vw)), 14px);
              }

              span {
                font-size: clamp(12px, calc(16px - 2 / 459 * (1280px - 100vw)), 16px);
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 834px) {
  .shareCardContainer {
    padding: 0 clamp(16px, calc(28px - 12 / 459 * (834px - 100vw)), 28px) 16px;
    gap: clamp(16px, calc(24px - 8 / 459 * (834px - 100vw)), 24px);

    .shareCardWrapper {
      .shareCardTitle {
        font-size: clamp(24px, calc(32px - 8 / 459 * (834px - 100vw)), 32px);
      }

      .shareCardDesc {
        font-size: clamp(12px, calc(14px - 2 / 459 * (834px - 100vw)), 14px);
      }
    }

    .shareCardContent {
      flex-direction: column;

      .shareCardContentNotes {
        max-width: 100%;
        width: 100%;

        .notes-nft-container {
          flex-direction: column;
          gap: 16px;

          .shareCardContentNotesWrapper,
          .nft-card {
            width: 100%;
          }
        }
      }

      .shareCardContentQuests {
        width: 100%;
        max-width: 100%;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
<style>
u {
  cursor: pointer;
}

.disabled u {
  cursor: not-allowed;
}
</style>