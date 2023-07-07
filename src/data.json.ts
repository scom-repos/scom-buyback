export default {
  "infuraId": "adc596bf88b648e2a8902bc9093930c5",
  "networks": [  
    {
      "chainId": 97,
      "isMainChain": true,
      "isCrossChainSupported": true,
      "explorerName": "BSCScan",
      "explorerTxUrl": "https://testnet.bscscan.com/tx/",
      "explorerAddressUrl": "https://testnet.bscscan.com/address/",
      "isTestnet": true
    },    
    {
      "chainId": 43113,
      "shortName": "AVAX Testnet",
      "isCrossChainSupported": true,
      "explorerName": "SnowTrace",
      "explorerTxUrl": "https://testnet.snowtrace.io/tx/",
      "explorerAddressUrl": "https://testnet.snowtrace.io/address/",
      "isTestnet": true
    }    
  ],
  "proxyAddresses": {
    "97": "0x9602cB9A782babc72b1b6C96E050273F631a6870",
    "43113": "0x7f1EAB0db83c02263539E3bFf99b638E61916B96"
  },
  "ipfsGatewayUrl": "https://ipfs.scom.dev/ipfs/",
  "embedderCommissionFee": "0.01",
  "defaultBuilderData": {
    "defaultChainId": 97,
    "chainId": 97,
    "projectName": "OSwap IDO Buyback",
    "description": "This is the second IDO Buyback of OSWAP with a buyback price at 20% of the IDO Price. 90% of the IDO Amount will be covered on a prorated basis.",
    "offerIndex": 35,
    "tokenIn": "0x45eee762aaeA4e5ce317471BDa8782724972Ee19",
    "tokenOut": "0xDe9334C157968320f26e449331D6544b89bbD00F",
    "networks": [
      {
        "chainId": 43113
      },
      {
        "chainId": 97
      }
    ],
    "wallets": [
      {
        "name": "metamask"
      }
    ]
  }
}