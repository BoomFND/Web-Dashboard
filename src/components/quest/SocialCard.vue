<script lang="ts" setup>
import { gsap } from 'gsap';
import { message } from 'ant-design-vue';
import useClipboard from 'vue-clipboard3';
import { useUserStore } from '@/stores/user';
import { usePointsStore } from '@/stores/points';
import { computed, onMounted } from 'vue';

const { toClipboard } = useClipboard();

const userStore = useUserStore();
const pointsStore = usePointsStore();

const currentLocation = computed(() => {
  return `${location.origin}/i/${userStore.account.gbInviteCode}`
});

// Copy Referral Link
const handleShare = async () => {
  if (!userStore.accessToken) return;

  try {
    await toClipboard(currentLocation.value)
    message.success('Copied success!')
  } catch (error) {
    console.error(error)
  }
};

const headerAnimation = () => {
  gsap.from('.social-card-view .social-card', {
    opacity: 0,
    y: 24,
    duration: 0.5,
    stagger: 0.1,
    ease: 'circ.out',
    delay: 0.8
  })
}

onMounted(() => {
  headerAnimation()
})
</script>

<template>
  <section class="social-card-view">
    <div class="social-card">
      <div class="card-item-wrapper">
        <div class="card-item referral-rewards">
          <div class="title">
            <SvgIcon name="dashboard-score" />
            <div class="text">Referral rewards</div>
            <boom-tip>
              <p>Total referral rewards = Sign-in Invites rewards + Event Invites rewards.</p>
            </boom-tip>
          </div>
          <div class="value">
            <div class="text">
              {{ userStore.accessToken ? pointsStore.myGameInfo.userInvitePoints : '--' }}
            </div>
            <div class="unit">GPT</div>
          </div>
        </div>
        <div class="card-item successful-referrals">
          <div class="title">
            <div class="text">Sign-in Invites</div>
            <boom-tip>
              <p>Invites count only after registration and one on-chain check-in.</p>
            </boom-tip>
          </div>
          <div class="value">
            <div class="text">
              {{ userStore.accessToken ? pointsStore.myGameInfo.userInviteCount : '--' }}
            </div>
          </div>
        </div>
        <div class="card-item successful-referrals">
          <div class="title">
            <div class="text">Event Invites</div>
            <boom-tip>
              <p>Number of invites who completed specific events.</p>
            </boom-tip>
          </div>
          <div class="value">
            <div class="text">
              {{ userStore.accessToken ? pointsStore.myGameInfo.mintInviteCount : '--' }}
            </div>
          </div>
        </div>
      </div>
      <div class="action">
        <div class="button-wrap">
          <div
            class="button button-default button-share"
            :class="{ disabled: !userStore.accessToken }"
            @click="handleShare"
          >
            <SvgIcon name="common-copy" />
            <div class="text">Invite friends for GPT rewards</div>
            <boom-tip @click.stop>
              <p>Step 1. Register through the invitation link.</p>
              <p>Step 2. Complete a sign-in task.</p>
              <p>Step 3. Invitation is successful, points increase</p>
            </boom-tip>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.social-card-view {
  width: 100%;
  display: flex;
  padding: 16px 28px;
  gap: 24px;

  .social-card {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    gap: 12px;
    border-radius: 16px;
    background: #fff;

    .card-item-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      align-self: stretch;

      .card-item {
        width: 200px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        align-self: stretch;

        .title {
          display: flex;
          align-items: center;
          gap: 4px;

          .text {
            font-weight: 600;
          }

          .svg-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }
        }

        .value {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: baseline;
          gap: 4px;
          color: #1d1d1f;
          font-family: Urbanist;
          letter-spacing: 0.196px;
          .text {
            font-size: 40px;
            font-weight: 800;
            line-height: 120%;
          }
        }

        &.referral-rewards {
          .value {
            color: #1d1d1f;
            font-family: Urbanist;
            letter-spacing: 0.196px;
            .text {
              font-size: 40px;
              font-weight: 800;
              line-height: 120%;
            }

            .unit {
              font-size: 20px;
              font-weight: 800;
              line-height: 140%;
            }
          }
        }

        &.successful-referrals {
          align-items: center;
        }
      }
    }

    .action {
      display: flex;
      align-items: flex-end;
      width: 270px;
      height: 100%;
    }

    .button {
      padding: 0 12px;
      font-size: 14px;
      font-weight: 600;
      height: 36px;

      .svg-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      .text {
        flex-shrink: 0;
      }

      &.disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      &::after {
        content: none;
      }
    }
  }
}

@media screen and (min-width: 1921px) {
  .social-card-view {
    padding: calc(16 * 100vw / 1920) calc(28 * 100vw / 1920);
    gap: calc(24 * 100vw / 1920);

    .social-card {
      padding: calc(16 * 100vw / 1920) calc(24 * 100vw / 1920);
      border-radius: calc(16 * 100vw / 1920);
      gap: calc(12 * 100vw / 1920);

      .card-item {
        width: calc(200 * 100vw / 1920);
        gap: calc(12 * 100vw / 1920);

        .title {
          gap: calc(4 * 100vw / 1920);

          .svg-icon {
            width: calc(16 * 100vw / 1920);
            height: calc(16 * 100vw / 1920);
          }
        }

        .value {
          gap: calc(4 * 100vw / 1920);
          .text {
            font-size: calc(40 * 100vw / 1920);
          }
        }

        &.referral-rewards {
          .value {
            .text {
              font-size: calc(40 * 100vw / 1920);
            }

            .unit {
              font-size: calc(20 * 100vw / 1920);
            }
          }
        }
        &.button-wrap {
          width: calc(270 * 100vw / 1920);

          .button {
            height: calc(36 * 100vw / 1920);
            font-size: calc(14 * 100vw / 1920);

            .svg-icon {
              width: calc(14 * 100vw / 1920);
              height: calc(14 * 100vw / 1920);
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1000px) {
  .social-card-view {
    padding: 16px clamp(16px, calc(24px - 8 / 459 * (834px - 100vw)), 24px);

    .social-card {
      flex-direction: column;
      align-items: flex-start;
      border-radius: 12px;
    }
  }
}
</style>
