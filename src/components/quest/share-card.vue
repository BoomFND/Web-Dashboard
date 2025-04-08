<script lang="ts" setup>
import { message } from 'ant-design-vue'
import useClipboard from 'vue-clipboard3'
import { useUserStore } from '@/stores/user'
import { usePointsStore } from '@/stores/points'
import { useQuestStore } from '@/stores/quest'
import type { SharingTask } from '@/types/models'
import { request } from '@/apis/request'

const userStore = useUserStore()
const questStore = useQuestStore()
const pointsStore = usePointsStore()

const { toClipboard } = useClipboard()
const isSubmitting = ref(false)
const handleClick = async (item: SharingTask) => {
  if (item.completed || !item.isEnabled) return
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
    } else if (item.code.includes('share') && item.action) {
      const res: any = await request({
        url: item.action,
        method: 'GET'
      })
      const redirectUrl = res.redirectUrl
      window.open(redirectUrl, '_blank')
    } else if (item.rewardDirect) {
      if (isSubmitting.value) return
      isSubmitting.value = true
      await questStore.directRewardQuest(item.code)
      setTimeout(() => {
        isSubmitting.value = false
      }, 1000)
      if (item.redirectUrl) window.open(item.redirectUrl, '_blank')
    } else if (item.redirectUrl) {
      window.open(item.redirectUrl, '_blank')
    } else if (item.code.toLowerCase().includes('invite')) {
      handleShare()
    }
  } catch (error) {
    isSubmitting.value = false
    console.error(error)
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

questStore.fetchTaskList()

// 切换赛季，更新日常任务列表
watch(
  () => pointsStore.currentSeason,
  (newVal) => {
    if (newVal) {
      questStore.fetchTaskList()
    }
  }
)

// 适配小屏幕，修改share结构
const isWap = ref(false)

const handleResize = () => {
  isWap.value = window.innerWidth <= 638
}

onMounted(() => {
  isWap.value = window.innerWidth <= 638

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听用户将网站切换到前台
document.addEventListener('visibilitychange', function () {
  !document.hidden && questStore.fetchTaskList()
})
</script>

<template>
  <div class="share-card">
    <div class="card">
      <div class="left">
        <div class="wrapper">
          <div class="title">
            <span class="text">Social Tasks</span>
            <!-- <SvgIcon v-if="userStore.account.boomerHolder" name="quest-buff"></SvgIcon> -->
            <!-- <boom-tip title="About Daily Sharing Quest">
              <p>
                The daily social sharing tasks are designed to test our social sharing subsystem.
                Users can interact with our social accounts and share UGC to earn GPT rewards.
              </p>
              <p>
                Note: Tasks will be
                <span class="primary-color">verified every 24 hours.</span>
              </p>
            </boom-tip> -->
          </div>
          <!-- <div class="desc">Earn GPT by engaging with us on X/Twitter</div> -->
        </div>
        <div class="notes">
          <div class="label">Notes:</div>
          <div class="sub-title">To participate in Social Tasks, follow these steps:</div>
          <div class="content">
            <div class="item">
              <div class="mark"></div>
              <div>Sign Up & Log In: Create your GamerBoom account.</div>
            </div>
            <div class="item">
              <div class="mark"></div>
              <div>Connect Twitter and Telegram.</div>
            </div>
            <div class="item">
              <div class="mark"></div>
              <div>Once connected, start completing tasks and invite your friends!</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="list">
          <div
            class="item"
            :class="{ disabled: item.completed || !item.isEnabled }"
            v-for="item in questStore.rewardTaskList"
            :key="item.id"
            @click="handleClick(item)"
          >
            <template v-if="!isWap">
              <div class="item__left">
                <img :src="item.icon" />
                <span class="item__left-text" v-html="item.displayText"> </span>
              </div>
              <div class="item__right">
                <span v-html="item.completeText"></span>
              </div>
            </template>
            <template v-else>
              <div class="item__top" v-html="item.displayText"></div>
              <div class="item__bottom">
                <img :src="item.icon" />
                <div v-html="item.completeText"></div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.share-card {
  width: 100%;
  height: 100%;
  container-type: inline-size;

  border-radius: 32px;
  border: 1px solid var(--4, rgba(255, 255, 255, 0.04));
  background: url('@/assets/images/quest/bg_share.png') 50% / cover no-repeat;

  .card {
    display: flex;
    padding: 24px;
    align-items: flex-start;
    gap: 16px;
    align-self: stretch;
  }

  .left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    align-self: stretch;
    flex: 1;
    gap: 16px;

    .wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .title {
      color: var(--100, #fff);
      font-family: Quicksand;
      font-size: 28px;
      font-style: normal;
      font-weight: 700;
      line-height: 120%; /* 33.6px */

      .svg-icon {
        margin-left: 4px;
      }
    }

    .desc {
      color: var(--60, rgba(255, 255, 255, 0.6));
      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
    }

    .notes {
      display: flex;
      padding: 8px;
      flex-direction: column;
      align-items: flex-start;

      border-radius: 12px;
      border: 1px solid var(--20, rgba(255, 255, 255, 0.2));
      background: var(--4, rgba(255, 255, 255, 0.04));

      .label {
        color: var(--60, rgba(255, 255, 255, 0.6));
        font-family: Quicksand;
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        line-height: 160%; /* 19.2px */
      }

      .sub-title {
        color: var(--60, rgba(255, 255, 255, 0.6));
        font-family: Quicksand;
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        line-height: 160%; /* 19.2px */
      }

      .content {
        .item {
          display: flex;
          align-items: flex-start;

          color: var(--60, rgba(255, 255, 255, 0.6));
          font-family: Quicksand;
          font-size: 12px;
          font-style: normal;
          font-weight: 700;
          line-height: 18px; /* 133.333% */

          // &:last-child {
          //   color: rgba(201, 88, 254, 0.8);
          // }
        }

        .mark {
          margin-top: 6px;
          margin-right: 8px;
          border-radius: 100%;
          width: 4px;
          height: 4px;
          background-color: var(--60, rgba(255, 255, 255, 0.6));
          flex-shrink: 0;
        }
      }
    }
  }

  .right {
    width: max(50%, 490px);
    .list {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .item {
        display: flex;
        padding: 12px;
        justify-content: space-between;
        align-items: center;
        align-self: stretch;

        border-radius: 12px;
        border: 1px solid #9f9f9f;

        &__left {
          display: flex;
          align-items: center;

          color: var(--60, rgba(255, 255, 255, 0.6));
          font-family: Quicksand;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;

          img {
            margin-right: 8px;
            width: 24px;
            height: 24px;
          }
        }

        &__right {
          color: var(--60, rgba(255, 255, 255, 0.6));
          font-family: Quicksand;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
          flex-shrink: 0;

          &-unit {
            margin-left: 8px;
            text-transform: uppercase;
          }
        }

        &.disabled {
          color: #9f9f9f;
          border: 1px solid var(--4, rgba(255, 255, 255, 0.04));
          opacity: 0.5;
          background: rgba(88, 101, 242, 0);
          text-transform: capitalize;
        }
      }
    }
  }

  @container (max-width: 890px) {
    .card {
      flex-direction: column;
    }

    .right {
      width: max(100%, 490px);
    }
  }

  @container (max-width: 537px) {
    .right {
      width: 100%;

      .item {
        display: flex;
        padding: 12px;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        gap: 12px;
        align-self: stretch;

        &__top {
          width: 100%;
          color: var(--60, rgba(255, 255, 255, 0.6));
          font-size: 16px;
          font-weight: 700;
          line-height: 160%; /* 25.6px */
        }

        &__bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          align-self: stretch;

          color: var(--60, rgba(255, 255, 255, 0.6));
          font-family: Quicksand;
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;

          img {
            margin-right: 8px;
            width: 24px;
            height: 24px;
          }
        }
      }
    }
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
