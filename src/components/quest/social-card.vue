<script lang="ts" setup>
import { message } from 'ant-design-vue'
import useClipboard from 'vue-clipboard3'
import { useUserStore } from '@/stores/user'
// import { useWalletStore } from '@/stores/wallet'
import { useDiscordStore } from '@/stores/discord'
import { useTwitterStore } from '@/stores/twitter'

// import { connectWallet } from '@/services/NftService'
import { useQuestStore } from '@/stores/quest'

const open = ref(false)

const { toClipboard } = useClipboard()

const userStore = useUserStore()
// const walletStore = useWalletStore()
const discordStore = useDiscordStore()
const twitterStore = useTwitterStore()
const questStore = useQuestStore()

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

questStore.fetchTaskList()

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

// collect discord
const handleDiscord = () => {
  const { discordVerified, joinGuild } = userStore.account
  // 如果已经认证过，并且加过群，则直接返回
  // if (discordVerified && joinGuild) return
  //已认证，未加群，则文案变成JOIN DISCORD，并且允许用户继续进行交互，再次点击，进入群
  if (discordVerified && !joinGuild) {
    // 调起入群链接
    return window.open('https://discord.com/invite/gamerboom', '_black')
  }

  // 判断用户是否已登录，如果已登录，并且连接了钱包，则进行discord验证
  // else if (userStore.accessToken && walletStore.wallet.signedGenesisProof) {
  else if (userStore.accessToken) {
    discordStore.fetchUrl()
  }
  // else if (userStore.accessToken && !walletStore.wallet.signedGenesisProof) {
  //   // 已登录，未链接钱包，则连接钱包
  //   connectWallet('meta')
  // }
  else {
    // 1.0 未注册，同时也未连接钱包，打开欢迎弹窗
    open.value = true
  }
}

// collect twitter
const collectTwitter = () => {
  // const { twitterVerified } = userStore.account
  // 如果已经认证过，则直接返回
  // if (twitterVerified) return
  // 判断用户是否已登录，如果已登录，并且连接了钱包，则进行twitter验证
  // else if (userStore.accessToken && walletStore.wallet.signedGenesisProof) {
  if (userStore.accessToken) {
    twitterStore.fetchUrl()
  }
  // else if (userStore.accessToken && !walletStore.wallet.signedGenesisProof) {
  //   // 已登录，未链接钱包，则连接钱包
  //   connectWallet('meta')
  // }
  else {
    // 1.0 未注册，同时也未连接钱包，打开欢迎弹窗
    open.value = true
  }
}
</script>

<template>
  <div class="social-card">
    <div class="card">
      <div class="left">
        <!-- <div class="title">
          <span class="text">Social Engagement Quests</span>
          <SvgIcon v-if="userStore.account.boomerHolder" name="quest-buff"></SvgIcon>
          <boom-tip title="about Social Engagement Quest">
            <p>
              Earn GPT rewards by completing our social quests. Start by linking your Twitter and
              Discord accounts, and proceed to complete the quest tasks one by one. All task rewards
              will be allocated into your account after verification.
            </p>
            <p>
              <span class="primary-color">Engage, connect, and reap the benefits.</span>
            </p>
          </boom-tip>
        </div>
        <div class="desc">Earn GPT rewards for social engagement.</div> -->
        <div class="actions">
          <div
            class="btn btn-twitter"
            :class="{ disabled: userStore.account.twitterVerified }"
            @click="collectTwitter"
          >
            <div class="text-wrapper">
              <SvgIcon name="quest-twitter" /> <span>Connect Twitter</span>
            </div>
            <div class="reward-wrapper">
              <template v-if="userStore.account.twitterVerified"> done </template>
            </div>
          </div>
          <div
            class="btn btn-discord"
            :class="{ disabled: userStore.account.discordVerified }"
            @click="handleDiscord"
          >
            <div class="text-wrapper">
              <SvgIcon name="quest-discord" /> <span>Connect Discord</span>
            </div>

            <div class="reward-wrapper">
              <template v-if="userStore.account.discordVerified"> done </template>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="label">
          Referrals:

          <boom-tip title="About Referrals">
            <p>
              Boost your rewards by inviting friends to join the fun! Both the referrer and the
              referred friends receive GPT rewards with a valid invitation.
              <span class="primary-color">
                It's a win-win: invite more, earn more GPT rewards together.
              </span>
            </p>
          </boom-tip>
        </div>
        <div class="value">{{ userStore.accessToken ? questStore.referralsCount : '--' }}</div>
        <div class="desc">Each Referral can +1400GPT</div>

        <div class="btn btn-link" @click="handleShare">Share My Link for GPT</div>
      </div>
    </div>
    <modal-register v-model="open"></modal-register>
  </div>
</template>

<style lang="scss" scoped>
.social-card {
  width: 100%;
  container-type: inline-size;
}

.card {
  display: flex;
}

.left {
  padding: 12px 35px 12px 0;

  @container (min-width: 668px) {
    width: max(412px, 50%);
    flex-shrink: 0;
  }

  .title {
    display: block;
    color: #fff;
    font-size: 40px;
    font-weight: 700;
    line-height: 120%; /* 48px */

    .svg-icon {
      margin-left: 4px;
    }
  }

  .desc {
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    font-weight: 700;
    line-height: normal;
  }

  .actions {
    margin-top: 40px;

    .btn {
      display: flex;
      width: max(282px, 19.58vw);
      padding: 12px 16px 12px 12px;
      justify-content: space-between;
      align-items: center;

      border-radius: 48px;

      font-family: Quicksand;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;

      cursor: pointer;

      .text-wrapper {
        display: flex;
        align-items: center;

        .svg-icon {
          margin-right: 8px;
          font-size: 24px;
        }
      }

      .reward-wrapper {
        text-transform: uppercase;

        span + span {
          margin-left: 8px;
        }
      }

      & + .btn {
        margin-top: 16px;
      }

      &:hover {
        opacity: 0.8;
      }

      &:active {
        opacity: 0.5;
      }

      &.btn-twitter {
        color: #009dfa;
        border: 1px solid #009dfa;
        background: rgba(0, 157, 250, 0.08);
      }

      &.btn-discord {
        color: #5865f2;
        border: 1px solid #5865f2;
        background: rgba(88, 101, 242, 0.08);
      }

      &.disabled {
        color: #9f9f9f;
        border: 1px solid #9f9f9f;
        opacity: 0.5;
        background: rgba(88, 101, 242, 0);
        // cursor: not-allowed;

        .reward-wrapper {
          text-transform: capitalize;
        }
      }
    }

    .btn-link {
      @media screen and (max-width: 668px) {
        padding: 12px 16px 12px 12px;
      }
    }
  }
}

.right {
  flex: 1;
  border-radius: 32px;
  background: url('@/assets/images/quest/bg_social.png') 50% / cover no-repeat;
  min-height: 262px;

  display: flex;
  padding-top: 32px;
  padding-bottom: 40px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  box-sizing: border-box;

  .label {
    display: flex;
    align-items: flex-end;
    color: #fff;
    text-align: center;
    text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
    font-family: Quicksand;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: 100%; /* 24px */
  }

  .value {
    color: var(--100, #fff);
    text-align: center;
    text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
    font-family: Quicksand;
    font-size: 40px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 48px */
    text-transform: lowercase;
  }

  .desc {
    color: var(--60, rgba(255, 255, 255, 0.6));
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 19.2px */
  }

  .btn {
    display: flex;
    height: 48px;
    padding: 10px 24px;
    justify-content: center;
    align-items: center;
    gap: 10px;

    border-radius: 32px;
    border: 1px solid var(--100, #fff);

    color: var(--100, #fff);
    text-align: center;
    text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
    font-family: Quicksand;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 19.2px */

    cursor: pointer;

    @container (min-width: 668px) {
      width: clamp(193px, 90%, 360px);
    }
    @container (min-width: 780px) {
      width: 360px;
    }

    &:hover {
      opacity: 0.8;
    }

    &:active {
      opacity: 0.5;
    }
  }
}

@container (max-width: 667px) {
  .card {
    flex-direction: column;
    gap: 24px;
  }

  .left {
    padding: 0;
    .title {
      font-size: clamp(24px, 5.2vw, 40px);
      font-style: normal;
      font-weight: 700;
      line-height: 160%; /* 38.4px */
      text-transform: uppercase;
    }

    .desc {
      margin-top: 12px;
      font-size: 14px;
    }

    .actions .btn {
      width: 100%;
    }
  }

  .right {
    .label {
      font-size: clamp(20px, 3.125vw, 24px);
    }
    .value {
      font-size: clamp(24px, 5.2vw, 40px);
    }
    .desc {
      font-size: clamp(14px, 2.08vw, 16px);
    }
    .btn {
      width: 80%;
    }
  }
}
</style>
