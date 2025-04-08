<script lang="ts" setup>
import { message } from 'ant-design-vue'
import useClipboard from 'vue-clipboard3'
import { useUserStore } from '@/stores/user'
import { useQuestStore } from '@/stores/quest'

const userStore = useUserStore()
const questStore = useQuestStore()
const { toClipboard } = useClipboard()

// 监听用户登录，登录后，要请求我的邀请数据
watch(
  () => userStore.accessToken,
  (newV) => {
    if (newV) {
      questStore.fetchReferralsCount()
    }
  },
  { immediate: true }
)

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
</script>

<template>
  <div class="referrals">
    <div class="title">
      Referrals
      <boom-tip title="About Referrals">
        <p>
          Boost your rewards by inviting friends to join the fun! Both the referrer and the referred
          friends receive GPT rewards with a valid invitation.
          <span class="primary-color">
            It's a win-win: invite more, earn more GPT rewards together.
          </span>
        </p>
      </boom-tip>
    </div>
    <div class="number">{{ userStore.accessToken ? questStore.referralsCount : '--' }}</div>
    <div class="button" @click="handleShare">Share my Link</div>
  </div>
</template>

<style lang="scss" scoped>
.referrals {
  position: relative;
  padding: 28px;
  background-image: url('@/assets/images/dashboard/referrals-bg.png');
  background-size: contain;
  background-position: right top;
  background-repeat: no-repeat;
  border-radius: 32px;
  background-color: #090c0f;

  .title {
    color: #fff;
    font-family: Urbanist;
    font-size: 32px;
    font-style: normal;
    font-weight: 800;
    line-height: 30px; /* 93.75% */
  }

  .number {
    margin-top: 40px;
    color: #fff;
    font-family: Urbanist;
    font-size: 88px;
    font-style: normal;
    font-weight: 700;
    line-height: 72px; /* 81.818% */
  }

  .button {
    position: absolute;
    right: 28px;
    bottom: 28px;
    width: 155px;
    height: 46px;
    flex-shrink: 0;
    color: #0f1012;
    font-family: Urbanist;
    font-size: 14px;
    font-style: normal;
    font-weight: 900;
    line-height: 12px; /* 85.714% */
    letter-spacing: 0.24px;
    text-transform: uppercase;
  }
}
</style>
