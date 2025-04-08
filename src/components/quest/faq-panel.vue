<script lang="ts" setup>
const activeKey = ref<string[]>(['1'])

const faqList = ref([
  {
    key: '1',
    title: 'Q: What is Boomer Buff?',
    content:
      'A: Boomer Buff is an exclusive privilege for Genesis Boomer NFT holders. Under the same conditions, users with the Boomer Buff will receive more GPT rewards. Furthermore, we will verify whether users hold a Genesis Boomer NFT through random snapshots.'
  },
  {
    key: '2',
    title: 'Q: How can I earn GPT rewards through Social Engagement Quests?',
    content:
      'A: Every user can earn GPT rewards by completing daily social tasks. Start by linking your Twitter and Discord accounts, and proceed to complete the quest tasks one by one. All task rewards will be allocated into your account after verification. Engage, connect, and reap the benefits.'
  },
  {
    key: '3',
    title: 'Q: Can I earn rewards by referring friends?',
    content:
      'A: Yes, you and your referred friends can earn GPT rewards with every successful invitation. Each invitation benefits both the referrer and the referred, enhancing your GPT earnings.'
  },
  {
    key: '4',
    title: 'Q: How do Daily Sharing Quests work?',
    content:
      'A: Complete tasks listed in the daily quest to earn GPT rewards. Task completion is verified every 24 hours, and GPT are allocated based on achievements. Check your panel after 24 hours to see your task status and GPT score.'
  },
  {
    key: '5',
    title: "Q: Why should I engage with GamerBoom's Twitter posts?",
    content:
      'A: Engaging with our Twitter posts keeps you updated on our most significant events, including daily highlights and major partnership news. Stay informed and connected by following our Twitter updates.'
  }
])
</script>

<template>
  <div class="faq-view">
    <div class="title">Common Questions</div>
    <div class="content">
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel
          v-for="item in faqList"
          :key="item.key"
          :header="item.title"
          :showArrow="false"
        >
          <template #extra>
            <SvgIcon v-if="activeKey?.includes(item.key)" name="quest-subtract"></SvgIcon>
            <SvgIcon v-else name="quest-add"></SvgIcon>
          </template>
          <p>
            {{ item.content }}
          </p>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.faq-view {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;

  .title {
    padding-left: 24px;
    color: #fff;
    font-family: Urbanist;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .content {
    display: flex;
    padding: 12px 24px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    align-self: stretch;
    background: #191a27;
    border-radius: 32px;
  }
}

:deep(.ant-collapse) {
  width: 100%;
  .ant-collapse-item {
    .ant-collapse-header {
      height: 44px;
      align-items: center;
      padding-left: 0;
      padding-right: 0;

      .ant-collapse-header-text {
        color: var(--60, rgba(255, 255, 255, 0.6));
        font-family: Urbanist;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
      }

      .ant-collapse-extra {
        font-size: 24px;
        color: #fff;
        line-height: 1;
      }
    }

    .ant-collapse-content {
      color: var(--40, rgba(255, 255, 255, 0.4));
      font-family: Urbanist;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 160%; /* 22.4px */

      .ant-collapse-content-box {
        padding-left: 0;
        padding-right: 0;
      }
    }

    &:not(:last-child) {
      border-bottom: 2px solid rgba(39, 43, 64, 0.36);
    }
  }

  .ant-collapse-extra {
    .svg-icon {
      &:hover {
        opacity: 0.8;
      }

      &:active {
        opacity: 0.5;
      }
    }
  }
}
</style>
