import { createRouter, createWebHistory } from 'vue-router'
import { useDiscordStore } from '@/stores/discord'
import { useTwitterStore } from '@/stores/twitter'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    // {
    //   path: '/nft',
    //   name: 'nft',
    //   component: () => import('../views/NftView.vue')
    // },
    // {
    //   path: '/mini-game',
    //   name: 'miniGame',
    //   component: () => import('../views/MiniGameView.vue')
    // },
    // {
    //   path: '/quest',
    //   name: 'quest',
    //   component: () => import('../views/QuestView.vue')
    // },
    // // {
    // //   path: '/dashboard',
    // //   name: 'dashboard',
    // //   component: () => import('../views/HomeView.vue')
    // // },
    // {
    //   path: '/leaderboard',
    //   name: 'leaderboard',
    //   component: () => import('../views/RankView.vue')
    // },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const { code, invite, oauth_token, oauth_verifier } = to.query || {}

  // 如果code存在，则处理discord认证
  if (code && typeof code === 'string') {
    const discordType = sessionStorage.getItem('discordType')
    const { discordAuthorization, discordLoginOrRegister } = useDiscordStore()
    discordType === 'verify' ? discordAuthorization(code) : discordLoginOrRegister(code)

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
      }
    }

    sessionStorage.setItem('isWelcomeShow', 'false')
    return next({ name: 'quest', replace: true })
  }

  return next(true)
})

export default router
