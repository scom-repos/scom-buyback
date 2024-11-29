
export const CoreContractAddressesByChainId: { [chainId: number]: { [contract: string]: string } } = {
  1: {
    "WETH9": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  4: { // Rinkeby
    "WETH9": "0xc778417E063141139Fce010982780140Aa0cD5Ab",
  },
  42: { // Kovan
    "WETH9": "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
    "OSWAP_HybridRouter2": "0xf612B4879ADC5713A5c0781F0f431362a69030b5",
  },
  56: { // Binance Mainnet
    "WETH9": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    "OSWAP_HybridRouter2": "0xFc7261491753C53F0aa168CDB290e47f64C713bB",
    "OSWAP_RestrictedFactory": "0x91d137464b93caC7E2c2d4444a9D8609E4473B70",
  },
  97: { // Binance Test Chain
    "WETH9": "0xae13d989dac2f0debff460ac112a837c89baa7cd",
    "OSWAP_HybridRouter2": "0x58dD8dC6EbE7AE6bbDA3ba5DA10eC08f27D52D31",
    "OSWAP_RestrictedFactory": "0xa158FB71cA5EF59f707c6F8D0b9CC5765F97Fd60",
  },
  137: { // Polygon
    "WETH9": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  },
  300: { // zkSync Era Sepolia Testnet
    "WETH9": '0xe8FD21d796B963B508e4FFfaEF4DD641A9B3c938',
    "OSWAP_HybridRouter": '0x78a65fb41747a0454AB772e1398d6d12b3aEfA9E',
    "OSWAP_RestrictedFactory": '0xb7e7Fb350983cB87628bcc642a7c3Afc6A8101e0',
  },
  324: { // zkSync Era Mainnet
    "WETH9": '0x621Fb323C46085Ba44c5fE890d43737758Def9C8',
    "OSWAP_HybridRouter": '0x162E341beAe5d6ee4a5bdEF28Fa9f1898e3D2545',
    "OSWAP_RestrictedFactory": '0x3DA43301b428f72AB0204949267A77CBBEcd53AB',
  },
  1287: { // Moonbeam
    "WETH9": "0xd614547c5CF8619F8F40445e51c39F93E1D48BFf",
  },
  1337: {
    "WETH9": "0x5162B0a57734dd25865821b177d570827CADCb26",
  },
  31337: {
    "WETH9": "0xBB04C4927A05Cf7d3e329E6333658D48A9313356",
  },
  80001: {//polygon testnet
    "WETH9": '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    "OSWAP_HybridRouter2": "0x0304a5ca544ecf6b8cd04f07b32be10a10df2032",
  },
  43114: { //Avalanche Mainnet C-Chain
    "WETH9": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "OSWAP_RestrictedFactory": "0x739f0BBcdAd415127FE8d5d6ED053e9D817BdAdb",
    "OSWAP_HybridRouter2": "0xC3F6FE3da0A69621EE9c5bBFa5507f365ad9CFf8",
  },
  43113: {//Avalanche FUJI C-Chain                      
    "WETH9": "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    "OSWAP_HybridRouter2": "0x83445062a0685e47d8228881c594c0A8494E284a",
    "OSWAP_RestrictedFactory": "0x6C99c8E2c587706281a5B66bA7617DA7e2Ba6e48",
  },
  250: { // Fantom Opera
    "WETH9": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
  },
  4002: { // Fantom testnet
    "WETH9": "0xf1277d1Ed8AD466beddF92ef448A132661956621",
    "OSWAP_HybridRouter2": '0x1B0D217822719941a1ae3B38eB0A94663e9ad86E',
  },
  13370: { // Amino X Testnet
    "WETH9": "0xCb5e100fdF7d24f25865fa85673D9bD6Bb4674ab",
    "OSWAP_HybridRouter2": "0x567c6Af5Ec3EC2821143179DD4bBAcea5f7A9de9",
    "OSWAP_RestrictedFactory": "0x6B9215FCa70E2972182B7BF427C4D7fCcf5C24e5",
  },
  42161: { // Arbitrum Mainnet
    "WETH9": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "OSWAP_HybridRouter2": "0x728DbD968341eb7aD11bDabFE775A13aF901d6ac",
    "OSWAP_RestrictedFactory": "0x408aAf94BD851eb991dA146dFc7C290aA42BA70f",
  },
  421613:{ //Arbitrum Goerli Testnet
    "WETH9": "0xEe01c0CD76354C383B8c7B4e65EA88D00B06f36f",
    "OSWAP_HybridRouter2": "0x75CaA86Eff46D81469923D5fccE9B350E0a03575",
    "OSWAP_RestrictedFactory": "0x6f641f4F5948954F7cd675f3D874Ac60b193bA0d",
  }
}
