export interface Wallet {
  // 定义 Wallet 接口的属性
  publicKey: string
  connected: boolean
  adapter: any // 根据实际情况定义适当的类型
}
