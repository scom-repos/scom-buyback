import { ITokenObject } from "@scom/scom-token-list";
import { Tokens_Avalanche, Tokens_BSC, Tokens_ZK } from "./mainnet/index";
import { Tokens_BSC_Testnet, Tokens_Fuji, Tokens_ZK_Sepolia } from "./testnet/index";

const SupportedERC20Tokens: { [chainId: number]: ITokenObject[] } = {
  56: Tokens_BSC.map(v => { return { ...v, chainId: 56 } }),
  97: Tokens_BSC_Testnet.map(v => { return { ...v, chainId: 97 } }),
  300: Tokens_ZK_Sepolia.map(v => { return { ...v, chainId: 300 } }),
  324: Tokens_ZK.map(v => { return { ...v, chainId: 324 } }),
  43113: Tokens_Fuji.map(v => { return { ...v, chainId: 43113 } }),
  43114: Tokens_Avalanche.map(v => { return { ...v, chainId: 43114 } }),
}

export {
  SupportedERC20Tokens
}

