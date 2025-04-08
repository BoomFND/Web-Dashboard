import { createRouter, createWebHistory } from 'vue-router'
import { useDiscordStore } from '@/stores/discord'
import { useTwitterStore } from '@/stores/twitter'
import { useUserStore } from '@/stores/user'
import { connectWallet } from '@/services/NftService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/quest'
    },
    {
      path: '/campaign',
      name: 'campaign',
      component: () => import('../views/CampaignView.vue')
    },
    {
      path: '/quest',
      name: 'quest',
      component: () => import('../views/QuestView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('../views/LeaderboardView.vue')
    },
    {
      path: '/perceptron',
      name: 'Perceptron',
      component: () => import('../views/PerceptronView.vue')
    },
    {
      path: '/i/:invite',
      name: 'nftInvite',
      component: () => import('../views/PerceptronView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const { code, invite, oauth_token, oauth_verifier } = to.query || {}
  const userStore = useUserStore()
  // 如果code存在，则处理discord认证
  if (code && typeof code === 'string') {
    const discordType = sessionStorage.getItem('discordType')
    sessionStorage.removeItem('discordType')
    const { discordAuthorization, discordLoginOrRegister } = useDiscordStore()
    if (discordType === 'verify') {
      discordAuthorization(code)
    } else {
      discordLoginOrRegister(code)
      if (userStore.accessToken) {
        connectWallet('metaMaskSDK')
      }
    }

    sessionStorage.setItem('isWelcomeShow', 'false')

    // 去除code,防止刷新页面，重复发送请求到后端
    return next({ name: 'quest', replace: true })
  } else if (invite && typeof invite === 'string') {
    // 如果有邀请码，则保存邀请码到sessionStorage中
    sessionStorage.setItem('invite', invite)
    sessionStorage.setItem('isWelcomeShow', 'false')
  } else if (
    oauth_token &&
    oauth_verifier &&
    typeof oauth_token === 'string' &&
    typeof oauth_verifier === 'string'
  ) {
    const twitterType = sessionStorage.getItem('twitterType')
    sessionStorage.removeItem('twitterType')
    const path = to.redirectedFrom?.path

    const { twitterAuthorization, twitterVideoAuthorization, twitterLoginOrRegister } =
      useTwitterStore()

    if (twitterType === 'verify') {
      twitterAuthorization(oauth_token, oauth_verifier)
    } else {
      if (path?.includes('video')) {
        twitterVideoAuthorization(oauth_token, oauth_verifier)
      } else {
        twitterLoginOrRegister(oauth_token, oauth_verifier)
        if (userStore.accessToken) {
          connectWallet('metaMaskSDK')
        }
      }
    }

    sessionStorage.setItem('isWelcomeShow', 'false')
    return next({ name: 'quest', replace: true })
  }

  return next(true)
})

export default router
