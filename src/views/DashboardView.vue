<script lang="ts" setup>
const activeType = ref('overview')
</script>

<template>
  <section class="dashboard">
    <div class="title">
      Welcome to <br />
      GamerBoom World
    </div>
    <SeasonPicker></SeasonPicker>
    <main class="container">
      <div class="left">
        <div class="top">
          <Earnings></Earnings>
          <Referrals></Referrals>
        </div>
        <Statistics></Statistics>
        <ComingSoon :width="996" :height="295"></ComingSoon>
      </div>
      <div class="right">
        <div class="navs">
          <div
            class="nav__item"
            :class="{ active: activeType === 'overview' }"
            @click="activeType = 'overview'"
          >
            Overview
          </div>
          <div
            class="nav__item"
            :class="{ active: activeType === 'delegation' }"
            @click="activeType = 'delegation'"
          >
            My Delegation
          </div>
        </div>
        <div class="content">
          <template v-if="activeType === 'overview'">
            <Overview></Overview>
          </template>
          <template v-else-if="activeType === 'delegation'">
            <Delegation></Delegation>
          </template>
        </div>
      </div>
    </main>
  </section>
</template>

<style lang="scss" scoped>
.dashboard {
  color: #fff;

  .title {
    margin-bottom: 48px;
    color: #fff;
    font-family: Urbanist;
    font-size: 68px;
    font-style: normal;
    font-weight: 800;
    line-height: 68px; /* 100% */
    text-transform: capitalize;
  }

  .container {
    margin-top: 28px;
    display: flex;
    gap: 28px;

    .left {
      width: 996px;

      .top {
        display: flex;
        gap: 28px;
        margin-bottom: 28px;

        .earnings {
          width: 539px;
          height: 312px;
          border-radius: 32px;
          background: #090c0f;
        }

        .referrals {
          flex: 1;
        }
      }

      .statistics {
        margin-bottom: 28px;
        width: 100%;
        height: 495px;
        border-radius: 32px;
        background: #090c0f;
      }
    }

    .right {
      width: 581px;

      .navs {
        margin-bottom: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 84px;
        flex-shrink: 0;
        border-radius: 43px;
        border: 2px solid #1c1c1c;
        background: #0f1012;
        box-shadow: 0px 0px 8px 0px #1c1c1c;

        .nav__item {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          height: 60px;
          border-radius: 51px;
          text-align: center;
          font-family: Urbanist;
          font-size: 32px;
          font-style: normal;
          font-weight: 800;
          line-height: 30px; /* 93.75% */
          color: #8d8d8d;
          cursor: pointer;

          &.active {
            background: #fff;
            color: #0f1012;
          }
        }
      }
    }
  }
}
</style>
