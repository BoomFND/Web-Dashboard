<template>
  <boom-layout>
    <template #header>
      <boom-header />
    </template>
    <template #sider>
      <boom-sider />
    </template>
    <template #content>
      <RouterView></RouterView>
    </template>
    <template #footer>
      <boom-footer />
    </template>
  </boom-layout>
</template>
