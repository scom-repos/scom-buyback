import { ChainNativeTokenByChainId } from "@scom/scom-token-list";

export const Tokens_ZK = [
  {
    "name": "OpenSwap",
    "address": "0x69a74BEcce13C9D2499C5C9C941F786428ec40F7",
    "symbol": "OSWAP",
    "decimals": 18,
    "isCommon": true
  },
  {
    "name": "USDC",
    "address": "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4",
    "symbol": "USDC",
    "decimals": 6,
    "isCommon": true
  },
  {
    "name": "Zyfi Token",
    "address": "0x5d0d7BCa050e2E98Fd4A5e8d3bA823B49f39868d",
    "symbol": "ZFI",
    "decimals": 18,
    "isCommon": true
  },
  {
    ...ChainNativeTokenByChainId[300]
  }
]