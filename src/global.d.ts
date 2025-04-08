/*
 * @Author: jingren renjing_123455@163.com
 * @Date: 2024-02-20 11:56:57
 * @LastEditors: jingren renjing_123455@163.com
 * @LastEditTime: 2024-08-31 15:50:47
 * @FilePath: /rinku/apps/web/src/global.d.ts
 */
// globals.d.ts
interface Window {
  ethereum: any
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
