var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-buyback/global/utils/helper.ts", ["require", "exports", "@ijstech/eth-wallet", "@ijstech/components"], function (require, exports, eth_wallet_1, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.numberToBytes32 = exports.padLeft = exports.toWeiInv = exports.limitInputNumber = exports.isInvalidInput = exports.formatNumber = exports.formatDate = exports.DefaultDateFormat = void 0;
    exports.DefaultDateFormat = 'DD/MM/YYYY hh:mm:ss';
    const formatDate = (date, customType, showTimezone) => {
        const formatType = customType || exports.DefaultDateFormat;
        const formatted = (0, components_1.moment)(date).format(formatType);
        if (showTimezone) {
            return `${formatted} (UTC+${(0, components_1.moment)().utcOffset() / 60})`;
        }
        return formatted;
    };
    exports.formatDate = formatDate;
    const formatNumber = (value, decimalFigures) => {
        if (typeof value === 'object') {
            value = value.toFixed();
        }
        const minValue = '0.0000001';
        return components_1.FormatUtils.formatNumber(value, { decimalFigures: decimalFigures || 4, minValue, hasTrailingZero: false });
    };
    exports.formatNumber = formatNumber;
    const isInvalidInput = (val) => {
        const value = new eth_wallet_1.BigNumber(val);
        if (value.lt(0))
            return true;
        return (val || '').toString().substring(0, 2) === '00' || val === '-';
    };
    exports.isInvalidInput = isInvalidInput;
    const limitInputNumber = (input, decimals) => {
        const amount = input.value;
        if ((0, exports.isInvalidInput)(amount)) {
            input.value = '0';
            return;
        }
        const bigValue = new eth_wallet_1.BigNumber(amount);
        if (!bigValue.isNaN() && !bigValue.isZero() && /\d+\.\d+/g.test(amount || '')) {
            input.value = bigValue.dp(decimals || 18, eth_wallet_1.BigNumber.ROUND_DOWN).toFixed();
        }
    };
    exports.limitInputNumber = limitInputNumber;
    const toWeiInv = (n, unit) => {
        if (new eth_wallet_1.BigNumber(n).eq(0))
            return new eth_wallet_1.BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        return new eth_wallet_1.BigNumber('1').shiftedBy((unit || 18) * 2).idiv(new eth_wallet_1.BigNumber(n).shiftedBy(unit || 18));
    };
    exports.toWeiInv = toWeiInv;
    const padLeft = function (string, chars, sign) {
        return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
    };
    exports.padLeft = padLeft;
    const numberToBytes32 = (value, prefix) => {
        if (!value)
            return;
        let v = value;
        if (typeof value == "number") {
            // covert to a hex string
            v = value.toString(16);
        }
        else if (/^[0-9]*$/.test(value)) {
            // assuming value to be a decimal number, value could be a hex
            v = new eth_wallet_1.BigNumber(value).toString(16);
        }
        else if (/^(0x)?[0-9A-Fa-f]*$/.test(value)) {
            // value already a hex
            v = value;
        }
        else if (eth_wallet_1.BigNumber.isBigNumber(value)) {
            v = value.toString(16);
        }
        v = v.replace("0x", "");
        v = (0, exports.padLeft)(v, 64);
        if (prefix)
            v = '0x' + v;
        return v;
    };
    exports.numberToBytes32 = numberToBytes32;
});
define("@scom/scom-buyback/global/utils/common.ts", ["require", "exports", "@ijstech/eth-wallet"], function (require, exports, eth_wallet_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerSendTxEvents = void 0;
    const registerSendTxEvents = (sendTxEventHandlers) => {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        wallet.registerSendTxEvents({
            transactionHash: (error, receipt) => {
                if (sendTxEventHandlers.transactionHash) {
                    sendTxEventHandlers.transactionHash(error, receipt);
                }
            },
            confirmation: (receipt) => {
                if (sendTxEventHandlers.confirmation) {
                    sendTxEventHandlers.confirmation(receipt);
                }
            },
        });
    };
    exports.registerSendTxEvents = registerSendTxEvents;
});
define("@scom/scom-buyback/global/utils/interfaces.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-buyback/global/utils/index.ts", ["require", "exports", "@scom/scom-buyback/global/utils/helper.ts", "@scom/scom-buyback/global/utils/common.ts", "@scom/scom-buyback/global/utils/interfaces.ts"], function (require, exports, helper_1, common_1, interfaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerSendTxEvents = void 0;
    ///<amd-module name='@scom/scom-buyback/global/utils/index.ts'/> 
    __exportStar(helper_1, exports);
    Object.defineProperty(exports, "registerSendTxEvents", { enumerable: true, get: function () { return common_1.registerSendTxEvents; } });
    __exportStar(interfaces_1, exports);
});
define("@scom/scom-buyback/global/index.ts", ["require", "exports", "@scom/scom-buyback/global/utils/index.ts"], function (require, exports, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-buyback/global/index.ts'/> 
    __exportStar(index_1, exports);
});
define("@scom/scom-buyback/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let moduleDir = components_2.application.currentModuleDir;
    function fullPath(path) {
        if (path.indexOf('://') > 0)
            return path;
        return `${moduleDir}/${path}`;
    }
    exports.default = {
        fullPath
    };
});
///<amd-module name='@scom/scom-buyback/store/data/index.ts'/> 
define("@scom/scom-buyback/store/data/index.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CoreContractAddressesByChainId = void 0;
    exports.CoreContractAddressesByChainId = {
        1: {
            "WETH9": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        },
        4: {
            "WETH9": "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        },
        42: {
            "WETH9": "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
            "OSWAP_HybridRouter2": "0xf612B4879ADC5713A5c0781F0f431362a69030b5",
        },
        56: {
            "WETH9": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            "OSWAP_HybridRouter2": "0xFc7261491753C53F0aa168CDB290e47f64C713bB",
            "OSWAP_RestrictedFactory": "0x91d137464b93caC7E2c2d4444a9D8609E4473B70",
        },
        97: {
            "WETH9": "0xae13d989dac2f0debff460ac112a837c89baa7cd",
            "OSWAP_HybridRouter2": "0x58dD8dC6EbE7AE6bbDA3ba5DA10eC08f27D52D31",
            "OSWAP_RestrictedFactory": "0xa158FB71cA5EF59f707c6F8D0b9CC5765F97Fd60",
        },
        137: {
            "WETH9": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
        },
        1287: {
            "WETH9": "0xd614547c5CF8619F8F40445e51c39F93E1D48BFf",
        },
        1337: {
            "WETH9": "0x5162B0a57734dd25865821b177d570827CADCb26",
        },
        31337: {
            "WETH9": "0xBB04C4927A05Cf7d3e329E6333658D48A9313356",
        },
        80001: {
            "WETH9": '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
            "OSWAP_HybridRouter2": "0x0304a5ca544ecf6b8cd04f07b32be10a10df2032",
        },
        43114: {
            "WETH9": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
            "OSWAP_RestrictedFactory": "0x739f0BBcdAd415127FE8d5d6ED053e9D817BdAdb",
            "OSWAP_HybridRouter2": "0xC3F6FE3da0A69621EE9c5bBFa5507f365ad9CFf8",
        },
        43113: {
            "WETH9": "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
            "OSWAP_HybridRouter2": "0x83445062a0685e47d8228881c594c0A8494E284a",
            "OSWAP_RestrictedFactory": "0x6C99c8E2c587706281a5B66bA7617DA7e2Ba6e48",
        },
        250: {
            "WETH9": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
        },
        4002: {
            "WETH9": "0xf1277d1Ed8AD466beddF92ef448A132661956621",
            "OSWAP_HybridRouter2": '0x1B0D217822719941a1ae3B38eB0A94663e9ad86E',
        },
        13370: {
            "WETH9": "0xCb5e100fdF7d24f25865fa85673D9bD6Bb4674ab",
            "OSWAP_HybridRouter2": "0x567c6Af5Ec3EC2821143179DD4bBAcea5f7A9de9",
            "OSWAP_RestrictedFactory": "0x6B9215FCa70E2972182B7BF427C4D7fCcf5C24e5",
        },
        42161: {
            "WETH9": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            "OSWAP_HybridRouter2": "0x728DbD968341eb7aD11bDabFE775A13aF901d6ac",
            "OSWAP_RestrictedFactory": "0x408aAf94BD851eb991dA146dFc7C290aA42BA70f",
        },
        421613: {
            "WETH9": "0xEe01c0CD76354C383B8c7B4e65EA88D00B06f36f",
            "OSWAP_HybridRouter2": "0x75CaA86Eff46D81469923D5fccE9B350E0a03575",
            "OSWAP_RestrictedFactory": "0x6f641f4F5948954F7cd675f3D874Ac60b193bA0d",
        }
    };
});
define("@scom/scom-buyback/store/utils.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-token-list", "@scom/scom-network-list", "@ijstech/components", "@scom/scom-buyback/store/data/index.ts", "@scom/scom-buyback/store/data/index.ts"], function (require, exports, eth_wallet_3, scom_token_list_1, scom_network_list_1, components_3, index_2, index_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isClientWalletConnected = exports.getWETH = exports.getChainNativeToken = exports.State = void 0;
    __exportStar(index_3, exports);
    class State {
        constructor(options) {
            this.slippageTolerance = 0.5;
            this.transactionDeadline = 30;
            this.infuraId = '';
            this.networkMap = {};
            this.proxyAddresses = {};
            this.embedderCommissionFee = '0';
            this.rpcWalletId = '';
            this.getCommissionAmount = (commissions, amount) => {
                const _commissions = (commissions || []).filter(v => v.chainId == this.getChainId()).map(v => {
                    return {
                        to: v.walletAddress,
                        amount: amount.times(v.share)
                    };
                });
                const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)) : new eth_wallet_3.BigNumber(0);
                return commissionsAmount;
            };
            this.networkMap = (0, scom_network_list_1.default)();
            this.initData(options);
        }
        initData(options) {
            if (options.infuraId) {
                this.infuraId = options.infuraId;
            }
            if (options.networks) {
                this.setNetworkList(options.networks, options.infuraId);
            }
            if (options.proxyAddresses) {
                this.proxyAddresses = options.proxyAddresses;
            }
            if (options.embedderCommissionFee) {
                this.embedderCommissionFee = options.embedderCommissionFee;
            }
        }
        initRpcWallet(defaultChainId) {
            if (this.rpcWalletId) {
                return this.rpcWalletId;
            }
            const clientWallet = eth_wallet_3.Wallet.getClientInstance();
            const networkList = Object.values(components_3.application.store?.networkMap || []);
            const instanceId = clientWallet.initRpcWallet({
                networks: networkList,
                defaultChainId,
                infuraId: components_3.application.store?.infuraId,
                multicalls: components_3.application.store?.multicalls
            });
            this.rpcWalletId = instanceId;
            if (clientWallet.address) {
                const rpcWallet = eth_wallet_3.Wallet.getRpcWalletInstance(instanceId);
                rpcWallet.address = clientWallet.address;
            }
            return instanceId;
        }
        getProxyAddress(chainId) {
            const _chainId = chainId || eth_wallet_3.Wallet.getInstance().chainId;
            const proxyAddresses = this.proxyAddresses;
            if (proxyAddresses) {
                return proxyAddresses[_chainId];
            }
            return null;
        }
        getRpcWallet() {
            return this.rpcWalletId ? eth_wallet_3.Wallet.getRpcWalletInstance(this.rpcWalletId) : null;
        }
        isRpcWalletConnected() {
            const wallet = this.getRpcWallet();
            return wallet?.isConnected;
        }
        getChainId() {
            const rpcWallet = this.getRpcWallet();
            return rpcWallet?.chainId;
        }
        setNetworkList(networkList, infuraId) {
            const wallet = eth_wallet_3.Wallet.getClientInstance();
            this.networkMap = {};
            const defaultNetworkList = (0, scom_network_list_1.default)();
            const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
                acc[cur.chainId] = cur;
                return acc;
            }, {});
            for (let network of networkList) {
                const networkInfo = defaultNetworkMap[network.chainId];
                if (!networkInfo)
                    continue;
                if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
                    for (let i = 0; i < network.rpcUrls.length; i++) {
                        network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                    }
                }
                this.networkMap[network.chainId] = {
                    ...networkInfo,
                    ...network
                };
                wallet.setNetworkInfo(this.networkMap[network.chainId]);
            }
        }
        getCurrentCommissions(commissions) {
            return (commissions || []).filter(v => v.chainId == this.getChainId());
        }
        async setApprovalModelAction(options) {
            const approvalOptions = {
                ...options,
                spenderAddress: ''
            };
            let wallet = this.getRpcWallet();
            this.approvalModel = new eth_wallet_3.ERC20ApprovalModel(wallet, approvalOptions);
            let approvalModelAction = this.approvalModel.getAction();
            return approvalModelAction;
        }
        getAddresses(chainId) {
            return index_2.CoreContractAddressesByChainId[chainId || this.getChainId()] || {};
        }
    }
    exports.State = State;
    const getChainNativeToken = (chainId) => {
        return scom_token_list_1.ChainNativeTokenByChainId[chainId];
    };
    exports.getChainNativeToken = getChainNativeToken;
    const getWETH = (chainId) => {
        let wrappedToken = scom_token_list_1.WETHByChainId[chainId];
        return wrappedToken;
    };
    exports.getWETH = getWETH;
    function isClientWalletConnected() {
        const wallet = eth_wallet_3.Wallet.getClientInstance();
        return wallet?.isConnected;
    }
    exports.isClientWalletConnected = isClientWalletConnected;
});
define("@scom/scom-buyback/store/index.ts", ["require", "exports", "@scom/scom-buyback/assets.ts", "@scom/scom-buyback/store/utils.ts"], function (require, exports, assets_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fallBackUrl = void 0;
    exports.fallBackUrl = assets_1.default.fullPath('img/token-placeholder.svg');
    __exportStar(utils_1, exports);
});
define("@scom/scom-buyback/buyback-utils/index.ts", ["require", "exports", "@scom/scom-buyback/global/index.ts", "@ijstech/eth-wallet", "@scom/scom-buyback/store/index.ts", "@scom/oswap-openswap-contract", "@scom/scom-token-list"], function (require, exports, index_4, eth_wallet_4, index_5, oswap_openswap_contract_1, scom_token_list_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOffers = exports.getGuaranteedBuyBackInfo = exports.getGroupQueueExecuteData = void 0;
    const tradeFeeObj = { fee: '1', base: '1000' };
    ;
    const getAddressByKey = (state, key) => {
        let Address = state.getAddresses();
        return Address[key];
    };
    const mapTokenObjectSet = (state, obj) => {
        let chainId = state.getChainId();
        const WETH9 = (0, index_5.getWETH)(chainId);
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (!obj[key]?.address)
                    obj[key] = WETH9;
            }
        }
        return obj;
    };
    const getTokenObjectByAddress = (state, address) => {
        let chainId = state.getChainId();
        if (!address || address.toLowerCase() === getAddressByKey(state, 'WETH9')?.toLowerCase()) {
            return (0, index_5.getWETH)(chainId);
        }
        let tokenMap = scom_token_list_2.tokenStore.getTokenMapByChainId(chainId);
        return tokenMap[address.toLowerCase()];
    };
    const getPair = async (state, tokenA, tokenB) => {
        const wallet = state.getRpcWallet();
        let tokens = mapTokenObjectSet(state, { tokenA, tokenB });
        let params = { param1: tokens.tokenA.address, param2: tokens.tokenB.address };
        let factoryAddress = getAddressByKey(state, 'OSWAP_RestrictedFactory');
        let groupQ = new oswap_openswap_contract_1.Contracts.OSWAP_RestrictedFactory(wallet, factoryAddress);
        return await groupQ.getPair({ ...params, param3: 0 });
    };
    const getGroupQueueExecuteData = (offerIndex) => {
        let indexArr = [offerIndex];
        let ratioArr = [(0, index_4.toWeiInv)('1')];
        let data = "0x" + (0, index_4.numberToBytes32)((indexArr.length * 2 + 1) * 32) + (0, index_4.numberToBytes32)(indexArr.length) + indexArr.map(e => (0, index_4.numberToBytes32)(e)).join('') + ratioArr.map(e => (0, index_4.numberToBytes32)(e)).join('');
        return data;
    };
    exports.getGroupQueueExecuteData = getGroupQueueExecuteData;
    const getGuaranteedBuyBackInfo = async (state, buybackCampaign) => {
        let info = buybackCampaign;
        let allInfo;
        if (!info)
            return null;
        info.tokenIn = info.tokenIn?.startsWith('0x') ? info.tokenIn.toLowerCase() : info.tokenIn;
        info.tokenOut = info.tokenOut?.startsWith('0x') ? info.tokenOut.toLowerCase() : info.tokenOut;
        if (!info.pairAddress) {
            info.pairAddress = await getPair(state, getTokenObjectByAddress(state, info.tokenIn), getTokenObjectByAddress(state, info.tokenOut));
        }
        const queueInfo = await getProviderGroupQueueInfoByIndex(state, info.pairAddress, info.tokenIn, info.offerIndex);
        queueInfo.offerPrice = new eth_wallet_4.BigNumber(queueInfo.offerPrice).shiftedBy(getTokenObjectByAddress(state, info.tokenIn).decimals - getTokenObjectByAddress(state, info.tokenOut).decimals).toFixed();
        allInfo = {
            ...info,
            queueInfo
        };
        return allInfo;
    };
    exports.getGuaranteedBuyBackInfo = getGuaranteedBuyBackInfo;
    const getProviderGroupQueueInfoByIndex = async (state, pairAddress, tokenInAddress, offerIndex) => {
        let wallet = state.getRpcWallet();
        let chainId = state.getChainId();
        const nativeToken = (0, index_5.getChainNativeToken)(chainId);
        const WETH9Address = getAddressByKey(state, 'WETH9');
        const oracleContract = new oswap_openswap_contract_1.Contracts.OSWAP_RestrictedPair(wallet, pairAddress);
        let [token0Address, token1Address] = await Promise.all([oracleContract.token0(), oracleContract.token1()]);
        let direction;
        let tokenOut;
        let tokenIn;
        tokenInAddress = tokenInAddress.toLowerCase();
        token0Address = token0Address.toLowerCase();
        token1Address = token1Address.toLowerCase();
        if (token0Address == tokenInAddress) {
            direction = !(new eth_wallet_4.BigNumber(token0Address).lt(token1Address));
            tokenIn = getTokenObjectByAddress(state, token0Address);
            tokenOut = getTokenObjectByAddress(state, token1Address);
        }
        else {
            direction = new eth_wallet_4.BigNumber(token0Address).lt(token1Address);
            tokenIn = getTokenObjectByAddress(state, token1Address);
            tokenOut = getTokenObjectByAddress(state, token0Address);
        }
        let offer = await oracleContract.offers({ param1: direction, param2: offerIndex });
        let isApprovedTrader = await oracleContract.isApprovedTrader({ param1: direction, param2: offerIndex, param3: wallet.address });
        let allocation = await oracleContract.traderAllocation({
            param1: direction,
            param2: offerIndex,
            param3: wallet.address
        });
        let price = (0, index_4.toWeiInv)(offer.restrictedPrice.shiftedBy(-tokenOut.decimals).toFixed()).shiftedBy(-tokenIn.decimals).toFixed();
        let amount = new eth_wallet_4.BigNumber(offer.amount).shiftedBy(-Number(tokenIn.decimals)).toFixed();
        let userAllo = { address: wallet.address, allocation: new eth_wallet_4.BigNumber(allocation).shiftedBy(-Number(tokenIn.decimals)).toFixed() };
        let available = offer.allowAll ? amount : new eth_wallet_4.BigNumber(userAllo.allocation).toFixed();
        let tradeFee = new eth_wallet_4.BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
        let tokenInAvailable = new eth_wallet_4.BigNumber(available).dividedBy(new eth_wallet_4.BigNumber(price)).dividedBy(new eth_wallet_4.BigNumber(tradeFee)).toFixed();
        return {
            pairAddress: pairAddress.toLowerCase(),
            fromTokenAddress: tokenInAddress == WETH9Address.toLowerCase() ? nativeToken.symbol : tokenInAddress,
            toTokenAddress: tokenOut.address ? tokenOut.address.toLowerCase() == WETH9Address.toLowerCase() ? nativeToken.symbol : tokenOut.address.toLowerCase() : "",
            amount,
            offerPrice: price,
            startDate: offer.startDate.times(1000).toNumber(),
            endDate: offer.expire.times(1000).toNumber(),
            state: offer.locked ? 'Locked' : 'Unlocked',
            allowAll: offer.allowAll,
            direct: true,
            offerIndex,
            isApprovedTrader,
            willGet: offer.amount.times(new eth_wallet_4.BigNumber(price)).shiftedBy(-Number(tokenIn.decimals)).toFixed(),
            tradeFee,
            tokenInAvailable,
            available
        };
    };
    const getOffers = async (state, chainId, tokenA, tokenB) => {
        let index = [];
        try {
            const wallet = state.getRpcWallet();
            await wallet.init();
            if (wallet.chainId != chainId)
                await wallet.switchNetwork(chainId);
            let factoryAddress = state.getAddresses(chainId)['OSWAP_RestrictedFactory'];
            let groupQ = new oswap_openswap_contract_1.Contracts.OSWAP_RestrictedFactory(wallet, factoryAddress);
            let tokens = mapTokenObjectSet(state, { tokenA, tokenB });
            let params = { param1: tokens.tokenA.address, param2: tokens.tokenB.address };
            const pairAddress = await groupQ.getPair({ ...params, param3: 0 });
            const oracleContract = new oswap_openswap_contract_1.Contracts.OSWAP_RestrictedPair(wallet, pairAddress);
            const offers = await oracleContract.getOffers({ direction: false, start: 0, length: 100 });
            index = offers.index.map(idx => idx.toNumber());
        }
        catch (err) { }
        return index;
    };
    exports.getOffers = getOffers;
});
define("@scom/scom-buyback/swap-utils/index.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/oswap-openswap-contract", "@scom/scom-commission-proxy-contract", "@scom/scom-buyback/buyback-utils/index.ts"], function (require, exports, eth_wallet_5, oswap_openswap_contract_2, scom_commission_proxy_contract_1, index_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getProxySelectors = exports.getHybridRouterAddress = exports.executeSwap = void 0;
    const getHybridRouterAddress = (state) => {
        let Address = state.getAddresses();
        return Address['OSWAP_HybridRouter2'];
    };
    exports.getHybridRouterAddress = getHybridRouterAddress;
    const hybridTradeExactIn = async (state, wallet, path, pairs, amountIn, amountOutMin, toAddress, deadline, feeOnTransfer, data, commissions) => {
        if (path.length < 2) {
            return null;
        }
        let tokenIn = path[0];
        let tokenOut = path[path.length - 1];
        const hybridRouterAddress = getHybridRouterAddress(state);
        const hybridRouter = new oswap_openswap_contract_2.Contracts.OSWAP_HybridRouter2(wallet, hybridRouterAddress);
        const proxyAddress = state.getProxyAddress();
        const proxy = new scom_commission_proxy_contract_1.Contracts.Proxy(wallet, proxyAddress);
        const amount = tokenIn.address ? eth_wallet_5.Utils.toDecimals(amountIn.toString(), tokenIn.decimals).dp(0) : eth_wallet_5.Utils.toDecimals(amountIn.toString()).dp(0);
        const _amountOutMin = eth_wallet_5.Utils.toDecimals(amountOutMin, tokenOut.decimals).dp(0);
        const _commissions = (commissions || []).filter(v => v.chainId == state.getChainId()).map(v => {
            return {
                to: v.walletAddress,
                amount: amount.times(v.share).dp(0)
            };
        });
        const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)).dp(0) : new eth_wallet_5.BigNumber(0);
        let receipt;
        if (!tokenIn.address) {
            let params = {
                amountOutMin: _amountOutMin,
                pair: pairs,
                to: toAddress,
                deadline,
                data
            };
            if (_commissions.length) {
                let txData;
                if (feeOnTransfer) {
                    txData = await hybridRouter.swapExactETHForTokensSupportingFeeOnTransferTokens.txData(params, amount);
                }
                else {
                    txData = await hybridRouter.swapExactETHForTokens.txData(params, amount);
                }
                receipt = await proxy.proxyCall({
                    target: hybridRouterAddress,
                    tokensIn: [
                        {
                            token: eth_wallet_5.Utils.nullAddress,
                            amount: amount.plus(commissionsAmount),
                            directTransfer: false,
                            commissions: _commissions
                        }
                    ],
                    data: txData,
                    to: wallet.address,
                    tokensOut: []
                });
            }
            else {
                if (feeOnTransfer) {
                    receipt = await hybridRouter.swapExactETHForTokensSupportingFeeOnTransferTokens(params, amount);
                }
                else {
                    receipt = await hybridRouter.swapExactETHForTokens(params, amount);
                }
            }
        }
        else if (!tokenOut.address) {
            let params = {
                amountIn: amount,
                amountOutMin: _amountOutMin,
                pair: pairs,
                to: toAddress,
                deadline,
                data
            };
            if (_commissions.length) {
                let txData;
                if (feeOnTransfer) {
                    txData = await hybridRouter.swapExactTokensForETHSupportingFeeOnTransferTokens.txData(params);
                }
                else {
                    txData = await hybridRouter.swapExactTokensForETH.txData(params);
                }
                receipt = await proxy.proxyCall({
                    target: hybridRouterAddress,
                    tokensIn: [
                        {
                            token: tokenIn.address,
                            amount: amount.plus(commissionsAmount),
                            directTransfer: false,
                            commissions: _commissions
                        }
                    ],
                    data: txData,
                    to: wallet.address,
                    tokensOut: []
                });
            }
            else {
                if (feeOnTransfer) {
                    receipt = await hybridRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(params);
                }
                else {
                    receipt = await hybridRouter.swapExactTokensForETH(params);
                }
            }
        }
        else {
            let params = {
                amountIn: amount,
                amountOutMin: _amountOutMin,
                pair: pairs,
                tokenIn: tokenIn.address,
                to: toAddress,
                deadline,
                data
            };
            if (_commissions.length) {
                let txData;
                if (feeOnTransfer) {
                    txData = await hybridRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens.txData(params);
                }
                else {
                    txData = await hybridRouter.swapExactTokensForTokens.txData(params);
                }
                receipt = await proxy.proxyCall({
                    target: hybridRouterAddress,
                    tokensIn: [
                        {
                            token: tokenIn.address,
                            amount: amount.plus(commissionsAmount),
                            directTransfer: false,
                            commissions: _commissions
                        }
                    ],
                    data: txData,
                    to: wallet.address,
                    tokensOut: []
                });
            }
            else {
                if (feeOnTransfer) {
                    receipt = await hybridRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(params);
                }
                else {
                    receipt = await hybridRouter.swapExactTokensForTokens(params);
                }
            }
        }
        return receipt;
    };
    const executeSwap = async (state, swapData) => {
        let receipt = null;
        const wallet = eth_wallet_5.Wallet.getClientInstance();
        try {
            const toAddress = wallet.account.address;
            const slippageTolerance = state.slippageTolerance;
            const transactionDeadlineInMinutes = state.transactionDeadline;
            const transactionDeadline = Math.floor(Date.now() / 1000 + transactionDeadlineInMinutes * 60);
            if (swapData.provider === "RestrictedOracle") {
                const data = (0, index_6.getGroupQueueExecuteData)(swapData.groupQueueOfferIndex);
                if (!data)
                    return {
                        receipt: null,
                        error: { message: "No data from Group Queue Trader" },
                    };
                const amountOutMin = swapData.toAmount.times(1 - slippageTolerance / 100);
                receipt = await hybridTradeExactIn(state, wallet, swapData.routeTokens, swapData.pairs, swapData.fromAmount.toString(), amountOutMin.toString(), toAddress, transactionDeadline, false, data, swapData.commissions);
            }
        }
        catch (error) {
            return { receipt: null, error: error };
        }
        return { receipt, error: null };
    };
    exports.executeSwap = executeSwap;
    const getProxySelectors = async (state, chainId) => {
        const wallet = state.getRpcWallet();
        await wallet.init();
        if (wallet.chainId != chainId)
            await wallet.switchNetwork(chainId);
        const hybridRouterAddress = getHybridRouterAddress(state);
        const hybridRouter = new oswap_openswap_contract_2.Contracts.OSWAP_HybridRouter2(wallet, hybridRouterAddress);
        const permittedProxyFunctions = [
            "swapExactETHForTokensSupportingFeeOnTransferTokens",
            "swapExactETHForTokens",
            "swapExactTokensForETHSupportingFeeOnTransferTokens",
            "swapExactTokensForETH",
            "swapExactTokensForTokensSupportingFeeOnTransferTokens",
            "swapExactTokensForTokens"
        ];
        const selectors = permittedProxyFunctions
            .map(e => e + "(" + hybridRouter._abi.filter(f => f.name == e)[0].inputs.map(f => f.type).join(',') + ")")
            .map(e => wallet.soliditySha3(e).substring(0, 10))
            .map(e => hybridRouter.address.toLowerCase() + e.replace("0x", ""));
        return selectors;
    };
    exports.getProxySelectors = getProxySelectors;
});
define("@scom/scom-buyback/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-buyback/data.json.ts'/> 
    exports.default = {
        "infuraId": "adc596bf88b648e2a8902bc9093930c5",
        "networks": [
            {
                "chainId": 97,
                "explorerTxUrl": "https://testnet.bscscan.com/tx/",
                "explorerAddressUrl": "https://testnet.bscscan.com/address/"
            },
            {
                "chainId": 43113,
                "explorerTxUrl": "https://testnet.snowtrace.io/tx/",
                "explorerAddressUrl": "https://testnet.snowtrace.io/address/"
            }
        ],
        "proxyAddresses": {
            "97": "0x9602cB9A782babc72b1b6C96E050273F631a6870",
            "43113": "0x7f1EAB0db83c02263539E3bFf99b638E61916B96"
        },
        "embedderCommissionFee": "0.01",
        "defaultBuilderData": {
            "defaultChainId": 97,
            "chainId": 97,
            "title": "OSwap IDO Buyback",
            "logo": "https://ipfs.scom.dev/ipfs/bafkreigsu7udzf7sdoyspnvdinm7vh42ihhfs4vwcvibqkozrckgdtp3ve",
            "offerIndex": 36,
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
    };
});
define("@scom/scom-buyback/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.comboBoxStyle = exports.buybackComponent = exports.buybackDappContainer = void 0;
    const Theme = components_4.Styles.Theme.ThemeVars;
    const colorVar = {
        primaryButton: 'transparent linear-gradient(90deg, #AC1D78 0%, #E04862 100%) 0% 0% no-repeat padding-box',
        primaryGradient: 'linear-gradient(255deg,#f15e61,#b52082)',
        darkBg: '#181E3E 0% 0% no-repeat padding-box',
        primaryDisabled: 'transparent linear-gradient(270deg,#351f52,#552a42) 0% 0% no-repeat padding-box !important'
    };
    exports.buybackDappContainer = components_4.Styles.style({
        $nest: {
            'dapp-container-body': {
                $nest: {
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                        borderRadius: '10px',
                        border: '1px solid transparent',
                        background: `${Theme.divider} !important`
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: `${Theme.colors.primary.main} !important`,
                        borderRadius: '10px',
                        outline: '1px solid transparent'
                    }
                }
            }
        }
    });
    exports.buybackComponent = components_4.Styles.style({
        $nest: {
            'span': {
                letterSpacing: '0.15px',
            },
            '.i-loading-overlay': {
                background: Theme.background.main,
            },
            '.btn-os': {
                background: colorVar.primaryButton,
                height: 'auto !important',
                color: '#fff',
                // color: Theme.colors.primary.contrastText,
                transition: 'background .3s ease',
                fontSize: '1rem',
                fontWeight: 'bold',
                $nest: {
                    'i-icon.loading-icon': {
                        marginInline: '0.25rem',
                        width: '16px !important',
                        height: '16px !important',
                    },
                    'svg': {
                        // fill: `${Theme.colors.primary.contrastText} !important`
                        fill: `#fff !important`
                    }
                },
            },
            '.btn-os:not(.disabled):not(.is-spinning):hover, .btn-os:not(.disabled):not(.is-spinning):focus': {
                background: colorVar.primaryGradient,
                backgroundColor: 'transparent',
                boxShadow: 'none',
                opacity: .9
            },
            '.btn-os:not(.disabled):not(.is-spinning):focus': {
                boxShadow: '0 0 0 0.2rem rgb(0 123 255 / 25%)'
            },
            '.btn-os.disabled, .btn-os.is-spinning': {
                background: colorVar.primaryDisabled,
                opacity: 1
            },
            '.hidden': {
                display: 'none !important'
            },
            '.buyback-layout': {
                width: '100%',
                minHeight: 340,
                marginInline: 'auto',
                overflow: 'hidden',
            },
            'i-link': {
                display: 'flex',
                $nest: {
                    '&:hover *': {
                        color: '#fff',
                        opacity: 0.9,
                    },
                },
            },
            '.cursor-default': {
                cursor: 'default',
            },
            '.custom-timer': {
                display: 'flex',
                $nest: {
                    '.timer-value': {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 4,
                        paddingInline: 4,
                        minWidth: 20,
                        height: 20,
                        fontSize: 14
                    },
                    '.timer-unit': {
                        display: 'flex',
                        alignItems: 'center',
                    },
                },
            },
            '.input-amount > input': {
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '1rem',
                color: Theme.input.fontColor
            },
            '.highlight-box': {
                borderColor: '#E53780 !important'
            },
            'i-modal .modal': {
                background: Theme.background.modal,
            },
            '#loadingElm.i-loading--active': {
                marginTop: '2rem',
                position: 'initial',
                $nest: {
                    '#emptyStack': {
                        display: 'none !important',
                    },
                    '#gridDApp': {
                        display: 'none !important',
                    },
                    '.i-loading-spinner': {
                        marginTop: '2rem',
                    },
                },
            }
        }
    });
    exports.comboBoxStyle = components_4.Styles.style({
        width: '100% !important',
        $nest: {
            '.selection': {
                width: '100% !important',
                maxWidth: '100%',
                padding: '0.5rem 1rem',
                color: Theme.input.fontColor,
                backgroundColor: Theme.input.background,
                borderColor: Theme.input.background,
                borderRadius: '0.625rem!important',
            },
            '.selection input': {
                color: 'inherit',
                backgroundColor: 'inherit',
                padding: 0
            },
            '> .icon-btn': {
                justifyContent: 'center',
                borderColor: Theme.input.background,
                borderRadius: '0.625rem',
                width: '42px'
            }
        }
    });
});
define("@scom/scom-buyback/formSchema.ts", ["require", "exports", "@ijstech/components", "@scom/scom-network-picker", "@scom/scom-token-input", "@scom/scom-token-list", "@scom/scom-buyback/buyback-utils/index.ts", "@scom/scom-buyback/index.css.ts"], function (require, exports, components_5, scom_network_picker_1, scom_token_input_1, scom_token_list_3, index_7, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getProjectOwnerSchema = exports.getBuilderSchema = void 0;
    const theme = {
        type: 'object',
        properties: {
            backgroundColor: {
                type: 'string',
                format: 'color'
            },
            fontColor: {
                type: 'string',
                format: 'color'
            },
            inputBackgroundColor: {
                type: 'string',
                format: 'color'
            },
            inputFontColor: {
                type: 'string',
                format: 'color'
            }
        }
    };
    const themeUISchema = {
        type: 'Category',
        label: 'Theme',
        elements: [
            {
                type: 'VerticalLayout',
                elements: [
                    {
                        type: 'Group',
                        label: 'Dark',
                        elements: [
                            {
                                type: 'HorizontalLayout',
                                elements: [
                                    {
                                        type: 'Control',
                                        scope: '#/properties/dark/properties/backgroundColor'
                                    },
                                    {
                                        type: 'Control',
                                        scope: '#/properties/dark/properties/fontColor'
                                    }
                                ]
                            },
                            {
                                type: 'HorizontalLayout',
                                elements: [
                                    {
                                        type: 'Control',
                                        scope: '#/properties/dark/properties/inputBackgroundColor'
                                    },
                                    {
                                        type: 'Control',
                                        scope: '#/properties/dark/properties/inputFontColor'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: 'Group',
                        label: 'Light',
                        elements: [
                            {
                                type: 'HorizontalLayout',
                                elements: [
                                    {
                                        type: 'Control',
                                        scope: '#/properties/light/properties/backgroundColor'
                                    },
                                    {
                                        type: 'Control',
                                        scope: '#/properties/light/properties/fontColor'
                                    }
                                ]
                            },
                            {
                                type: 'HorizontalLayout',
                                elements: [
                                    {
                                        type: 'Control',
                                        scope: '#/properties/light/properties/inputBackgroundColor'
                                    },
                                    {
                                        type: 'Control',
                                        scope: '#/properties/light/properties/inputFontColor'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
    function getBuilderSchema() {
        return {
            dataSchema: {
                type: 'object',
                properties: {
                    offerIndex: {
                        type: 'number',
                        required: true
                    },
                    chainId: {
                        type: 'number',
                        required: true
                    },
                    tokenIn: {
                        type: 'string',
                        required: true
                    },
                    tokenOut: {
                        type: 'string',
                        required: true
                    },
                    //dark: theme,
                    //light: theme
                }
            },
            uiSchema: {
                type: 'Categorization',
                elements: [
                    {
                        type: 'Category',
                        label: 'General',
                        elements: [
                            {
                                type: 'VerticalLayout',
                                elements: [
                                    {
                                        type: 'Control',
                                        scope: '#/properties/offerIndex'
                                    },
                                    {
                                        type: 'Control',
                                        scope: '#/properties/chainId'
                                    },
                                    {
                                        type: 'Control',
                                        scope: '#/properties/tokenIn'
                                    },
                                    {
                                        type: 'Control',
                                        scope: '#/properties/tokenOut'
                                    }
                                ]
                            }
                        ]
                    },
                    //themeUISchema
                ]
            },
            customControls() {
                return getCustomControls();
            }
        };
    }
    exports.getBuilderSchema = getBuilderSchema;
    function getProjectOwnerSchema(state) {
        return {
            dataSchema: {
                type: 'object',
                properties: {
                    chainId: {
                        type: 'number',
                        required: true
                    },
                    offerIndex: {
                        type: 'number',
                        required: true
                    },
                    tokenIn: {
                        type: 'string',
                    },
                    tokenOut: {
                        type: 'string',
                    }
                }
            },
            uiSchema: {
                type: 'VerticalLayout',
                elements: [
                    {
                        type: 'Control',
                        scope: '#/properties/chainId'
                    },
                    {
                        type: 'Control',
                        scope: '#/properties/tokenIn'
                    },
                    {
                        type: 'Control',
                        scope: '#/properties/tokenOut'
                    },
                    {
                        type: 'Control',
                        scope: '#/properties/offerIndex'
                    },
                ]
            },
            customControls(getData) {
                return getCustomControls(state, getData, true);
            }
        };
    }
    exports.getProjectOwnerSchema = getProjectOwnerSchema;
    const getCustomControls = (state, getData, isOwner) => {
        let networkPicker;
        let firstTokenInput;
        let secondTokenInput;
        let comboOfferIndex;
        let offerIndexes = [];
        const onSelectToken = async () => {
            const chainId = networkPicker?.selectedNetwork?.chainId;
            if (chainId && firstTokenInput.token && secondTokenInput.token) {
                const indexes = await (0, index_7.getOffers)(state, chainId, firstTokenInput.token, secondTokenInput.token);
                comboOfferIndex.items = offerIndexes = indexes.map(index => ({ label: index.toString(), value: index.toString() }));
            }
        };
        const setTokenData = (control, value, rowData) => {
            if (rowData)
                control.chainId = rowData.chainId;
            if (!control.chainId)
                control.chainId = networkPicker?.selectedNetwork?.chainId;
            if (isOwner && !value) {
                const tokens = scom_token_list_3.tokenStore.getTokenList(control.chainId);
                let token = tokens.find(token => !token.address);
                control.token = token;
            }
            else {
                control.address = value;
            }
        };
        const setTokenByChainId = (control, chainId) => {
            if (control && chainId !== control.chainId) {
                const noChainId = !control.chainId;
                control.chainId = chainId;
                if (noChainId && control.address) {
                    control.address = control.address;
                    control.onSelectToken(control.token);
                }
                else {
                    control.token = undefined;
                }
            }
        };
        let controls = {
            '#/properties/chainId': {
                render: () => {
                    networkPicker = new scom_network_picker_1.default(undefined, {
                        type: 'combobox',
                        networks: [1, 56, 137, 250, 97, 80001, 43113, 43114, 42161, 421613].map(v => { return { chainId: v }; }),
                        onCustomNetworkSelected: () => {
                            const chainId = networkPicker.selectedNetwork?.chainId;
                            if (firstTokenInput.chainId != chainId) {
                                firstTokenInput.token = null;
                                secondTokenInput.token = null;
                                firstTokenInput.chainId = chainId;
                                secondTokenInput.chainId = chainId;
                                if (isOwner) {
                                    comboOfferIndex.items = offerIndexes = [];
                                    comboOfferIndex.clear();
                                }
                            }
                        }
                    });
                    return networkPicker;
                },
                getData: (control) => {
                    return control.selectedNetwork?.chainId;
                },
                setData: (control, value) => {
                    control.setNetworkByChainId(value);
                    setTokenByChainId(firstTokenInput, value);
                    setTokenByChainId(secondTokenInput, value);
                }
            },
            '#/properties/tokenIn': {
                render: () => {
                    firstTokenInput = new scom_token_input_1.default(undefined, {
                        type: 'combobox',
                        isBalanceShown: false,
                        isBtnMaxShown: false,
                        isInputShown: false
                    });
                    const chainId = networkPicker?.selectedNetwork?.chainId;
                    if (chainId && firstTokenInput.chainId !== chainId) {
                        firstTokenInput.chainId = chainId;
                    }
                    if (isOwner) {
                        firstTokenInput.onSelectToken = onSelectToken;
                    }
                    return firstTokenInput;
                },
                getData: (control) => {
                    return (control.token?.address || control.token?.symbol);
                },
                setData: setTokenData
            },
            '#/properties/tokenOut': {
                render: () => {
                    secondTokenInput = new scom_token_input_1.default(undefined, {
                        type: 'combobox',
                        isBalanceShown: false,
                        isBtnMaxShown: false,
                        isInputShown: false
                    });
                    const chainId = networkPicker?.selectedNetwork?.chainId;
                    if (chainId && secondTokenInput.chainId !== chainId) {
                        secondTokenInput.chainId = chainId;
                    }
                    if (isOwner) {
                        secondTokenInput.onSelectToken = onSelectToken;
                    }
                    return secondTokenInput;
                },
                getData: (control) => {
                    return (control.token?.address || control.token?.symbol);
                },
                setData: setTokenData
            }
        };
        if (isOwner) {
            controls['#/properties/offerIndex'] = {
                render: () => {
                    comboOfferIndex = new components_5.ComboBox(undefined, {
                        height: '42px',
                        icon: {
                            name: 'caret-down'
                        },
                        items: offerIndexes
                    });
                    comboOfferIndex.classList.add(index_css_1.comboBoxStyle);
                    return comboOfferIndex;
                },
                getData: (control) => {
                    return Number(control.selectedItem?.value);
                },
                setData: async (control, value) => {
                    const data = getData();
                    if (data.chainId && data.tokenIn != null && data.tokenOut != null) {
                        const tokens = scom_token_list_3.tokenStore.getTokenList(data.chainId);
                        const nativeToken = scom_token_list_3.ChainNativeTokenByChainId[data.chainId];
                        let tokenIn = data.tokenIn === nativeToken?.symbol ? nativeToken : tokens.find(token => (token.address ?? "") == data.tokenIn);
                        let tokenOut = data.tokenOut === nativeToken?.symbol ? nativeToken : tokens.find(token => (token.address ?? "") == data.tokenOut);
                        const indexes = await (0, index_7.getOffers)(state, data.chainId, tokenIn, tokenOut);
                        comboOfferIndex.items = offerIndexes = indexes.map(index => ({ label: index.toString(), value: index.toString() }));
                    }
                    control.selectedItem = offerIndexes.find(offer => offer.value === value.toString()) || null;
                },
            };
        }
        return controls;
    };
});
define("@scom/scom-buyback", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-buyback/global/index.ts", "@scom/scom-buyback/store/index.ts", "@scom/scom-buyback/buyback-utils/index.ts", "@scom/scom-buyback/swap-utils/index.ts", "@scom/scom-buyback/assets.ts", "@scom/scom-buyback/data.json.ts", "@scom/scom-buyback/formSchema.ts", "@scom/scom-token-list", "@scom/scom-buyback/index.css.ts"], function (require, exports, components_6, eth_wallet_6, index_8, index_9, index_10, index_11, assets_2, data_json_1, formSchema_1, scom_token_list_4, index_css_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_6.Styles.Theme.ThemeVars;
    const ROUNDING_NUMBER = 1;
    let ScomBuyback = class ScomBuyback extends components_6.Module {
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        onHide() {
            this.dappContainer.onHide();
            this.removeRpcWalletEvents();
        }
        removeRpcWalletEvents() {
            const rpcWallet = this.rpcWallet;
            for (let event of this.rpcWalletEvents) {
                rpcWallet.unregisterWalletEvent(event);
            }
            this.rpcWalletEvents = [];
        }
        _getActions(category) {
            const formSchema = (0, formSchema_1.getBuilderSchema)();
            const actions = [];
            if (category !== 'offers') {
                actions.push({
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = {
                            chainId: 0,
                            title: '',
                            logo: '',
                            offerIndex: 0,
                            tokenIn: '',
                            tokenOut: '',
                            wallets: [],
                            networks: []
                        };
                        let oldTag = {};
                        return {
                            execute: async () => {
                                oldData = JSON.parse(JSON.stringify(this._data));
                                const { title, logo, offerIndex, chainId, tokenIn, tokenOut, ...themeSettings } = userInputData;
                                const generalSettings = {
                                    title,
                                    logo,
                                    offerIndex,
                                    chainId,
                                    tokenIn,
                                    tokenOut
                                };
                                this._data.chainId = generalSettings.chainId;
                                this._data.title = generalSettings.title;
                                this._data.logo = generalSettings.logo;
                                this._data.offerIndex = generalSettings.offerIndex;
                                this._data.tokenIn = generalSettings.tokenIn;
                                this._data.tokenOut = generalSettings.tokenOut;
                                await this.resetRpcWallet();
                                this.refreshData(builder);
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (builder?.setTag)
                                    builder.setTag(themeSettings);
                                else
                                    this.setTag(themeSettings);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(themeSettings);
                            },
                            undo: async () => {
                                this._data = JSON.parse(JSON.stringify(oldData));
                                this.refreshData(builder);
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder?.setTag)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(this.tag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: formSchema.dataSchema,
                    userInputUISchema: formSchema.uiSchema,
                    customControls: formSchema.customControls()
                });
            }
            return actions;
        }
        getProjectOwnerActions() {
            const formSchema = (0, formSchema_1.getProjectOwnerSchema)(this.state);
            const actions = [
                {
                    name: 'Settings',
                    userInputDataSchema: formSchema.dataSchema,
                    userInputUISchema: formSchema.uiSchema,
                    customControls: formSchema.customControls(this.getData.bind(this))
                }
            ];
            return actions;
        }
        getConfigurators() {
            let self = this;
            return [
                {
                    name: 'Project Owner Configurator',
                    target: 'Project Owners',
                    getProxySelectors: async (chainId) => {
                        const selectors = await (0, index_11.getProxySelectors)(this.state, chainId);
                        return selectors;
                    },
                    getActions: () => {
                        return this.getProjectOwnerActions();
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        await this.setData(data);
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: (category) => {
                        return this._getActions(category);
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData({ ...defaultData, ...data });
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Emdedder Configurator',
                    target: 'Embedders',
                    elementName: 'i-scom-commission-fee-setup',
                    getLinkParams: () => {
                        const commissions = this._data.commissions || [];
                        return {
                            data: window.btoa(JSON.stringify(commissions))
                        };
                    },
                    // setLinkParams: async (params: any) => {
                    // 	if (params.data) {
                    // 		const decodedString = window.atob(params.data);
                    // 		const commissions = JSON.parse(decodedString);
                    // 		let resultingData = {
                    // 			...self._data,
                    // 			commissions
                    // 		};
                    // 		await this.setData(resultingData);
                    // 	}
                    // },
                    bindOnChanged: (element, callback) => {
                        element.onChanged = async (data) => {
                            let resultingData = {
                                ...self._data,
                                ...data
                            };
                            await this.setData(resultingData);
                            await callback(data);
                        };
                    },
                    getData: () => {
                        const fee = this.state.embedderCommissionFee;
                        const data = this.getData();
                        return { ...data, fee };
                    },
                    setData: async (properties, linkParams) => {
                        let resultingData = {
                            ...properties
                        };
                        if (linkParams?.data) {
                            const decodedString = window.atob(linkParams.data);
                            const commissions = JSON.parse(decodedString);
                            resultingData.commissions = commissions;
                        }
                        await this.setData(resultingData);
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Editor',
                    target: 'Editor',
                    getActions: (category) => {
                        const actions = this._getActions(category);
                        const editAction = actions.find(action => action.name === 'Edit');
                        return editAction ? [editAction] : [];
                    },
                    getData: this.getData.bind(this),
                    setData: this.setData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
        }
        getData() {
            return this._data;
        }
        async resetRpcWallet() {
            this.removeRpcWalletEvents();
            const rpcWalletId = await this.state.initRpcWallet(this.defaultChainId);
            const rpcWallet = this.rpcWallet;
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_6.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.refreshWidget();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_6.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.refreshWidget();
            });
            this.rpcWalletEvents.push(chainChangedEvent, connectedEvent);
            this.refreshDappContainer();
        }
        async setData(data) {
            this._data = data;
            await this.resetRpcWallet();
            await this.refreshWidget();
        }
        async getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            this.tag[type] = this.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        async setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'light' || prop === 'dark')
                        this.updateTag(prop, newValue[prop]);
                    else
                        this.tag[prop] = newValue[prop];
                }
            }
            if (this.dappContainer)
                this.dappContainer.setTag(this.tag);
            this.updateTheme();
        }
        updateStyle(name, value) {
            value ?
                this.style.setProperty(name, value) :
                this.style.removeProperty(name);
        }
        updateTheme() {
            const themeVar = this.dappContainer?.theme || 'light';
            this.updateStyle('--text-primary', this.tag[themeVar]?.fontColor);
            this.updateStyle('--background-main', this.tag[themeVar]?.backgroundColor);
            // this.updateStyle('--colors-primary-main', this.tag[themeVar]?.buttonBackgroundColor);
            // this.updateStyle('--colors-primary-contrast_text', this.tag[themeVar]?.buttonFontColor);
            // this.updateStyle('--colors-secondary-main', this.tag[themeVar]?.secondaryColor);
            // this.updateStyle('--colors-secondary-contrast_text', this.tag[themeVar]?.secondaryFontColor);
            this.updateStyle('--input-font_color', this.tag[themeVar]?.inputFontColor);
            this.updateStyle('--input-background', this.tag[themeVar]?.inputBackgroundColor);
        }
        get chainId() {
            return this.state.getChainId();
        }
        get rpcWallet() {
            return this.state.getRpcWallet();
        }
        get defaultChainId() {
            return this._data.defaultChainId;
        }
        set defaultChainId(value) {
            this._data.defaultChainId = value;
        }
        get wallets() {
            return this._data.wallets ?? [];
        }
        set wallets(value) {
            this._data.wallets = value;
        }
        get networks() {
            const { chainId, networks } = this._data;
            if (chainId && networks) {
                const matchNetwork = networks.find(v => v.chainId == chainId);
                return matchNetwork ? [matchNetwork] : [{ chainId }];
            }
            return networks ?? [];
        }
        set networks(value) {
            this._data.networks = value;
        }
        get showHeader() {
            return this._data.showHeader ?? true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
        }
        get commissions() {
            return this._data.commissions ?? [];
        }
        set commissions(value) {
            this._data.commissions = value;
        }
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                chainId: 0,
                title: '',
                logo: '',
                offerIndex: 0,
                tokenIn: '',
                tokenOut: '',
                wallets: [],
                networks: []
            };
            this.tag = {};
            this.defaultEdit = true;
            this.rpcWalletEvents = [];
            this.updateContractAddress = () => {
                const hasCommission = this.state.getCurrentCommissions(this.commissions).length;
                if (hasCommission) {
                    this.contractAddress = this.state.getProxyAddress();
                }
                else {
                    this.contractAddress = (0, index_11.getHybridRouterAddress)(this.state);
                }
                if (this.state?.approvalModel && this.approvalModelAction) {
                    this.state.approvalModel.spenderAddress = this.contractAddress;
                    this.updateCommissionInfo();
                }
            };
            this.refreshData = (builder) => {
                this.refreshDappContainer();
                this.refreshWidget();
                if (builder?.setData) {
                    builder.setData(this._data);
                }
            };
            this.refreshDappContainer = () => {
                const rpcWallet = this.rpcWallet;
                const containerData = {
                    defaultChainId: this._data.chainId || this.defaultChainId,
                    wallets: this.wallets,
                    networks: this.networks.length ? this.networks : [{ chainId: this._data.chainId || this.chainId }],
                    showHeader: this.showHeader,
                    rpcWalletId: rpcWallet.instanceId
                };
                if (this.dappContainer?.setData)
                    this.dappContainer.setData(containerData);
            };
            this.refreshWidget = async () => {
                this.updateContractAddress();
                await this.initializeWidgetConfig();
            };
            this.initializeWidgetConfig = async (hideLoading) => {
                setTimeout(async () => {
                    const rpcWallet = this.rpcWallet;
                    const chainId = this.chainId;
                    if (!hideLoading && this.loadingElm) {
                        this.loadingElm.visible = true;
                    }
                    if (!(0, index_9.isClientWalletConnected)() || !this._data || this._data.chainId !== chainId) {
                        this.renderEmpty();
                        return;
                    }
                    try {
                        this.infoStack.visible = true;
                        this.emptyStack.visible = false;
                        scom_token_list_4.tokenStore.updateTokenMapData(chainId);
                        if (rpcWallet.address) {
                            scom_token_list_4.tokenStore.updateTokenBalancesByChainId(chainId);
                        }
                        await this.initWallet();
                        this.buybackInfo = await (0, index_10.getGuaranteedBuyBackInfo)(this.state, { ...this._data });
                        this.updateCommissionInfo();
                        await this.renderBuybackCampaign();
                        await this.renderLeftPart();
                        const firstToken = this.getTokenObject('toTokenAddress');
                        if (firstToken && firstToken.symbol !== scom_token_list_4.ChainNativeTokenByChainId[chainId]?.symbol && this.state.isRpcWalletConnected()) {
                            await this.initApprovalModelAction();
                        }
                        else if ((this.isExpired || this.isUpcoming) && this.btnSwap) {
                            this.updateBtnSwap();
                        }
                    }
                    catch {
                        this.renderEmpty();
                    }
                    if (!hideLoading && this.loadingElm) {
                        this.loadingElm.visible = false;
                    }
                });
            };
            this.initWallet = async () => {
                try {
                    await eth_wallet_6.Wallet.getClientInstance().init();
                    await this.rpcWallet.init();
                }
                catch (err) {
                    console.log(err);
                }
            };
            this.getFirstAvailableBalance = () => {
                const tokenBalances = scom_token_list_4.tokenStore.getTokenBalancesByChainId(this.chainId);
                if (!this.buybackInfo || this.isSwapDisabled || !tokenBalances) {
                    return '0';
                }
                const { queueInfo } = this.buybackInfo;
                const { available, offerPrice, tradeFee, amount } = queueInfo;
                const tokenBalance = new eth_wallet_6.BigNumber(tokenBalances[this.getValueByKey('toTokenAddress')]);
                const balance = new eth_wallet_6.BigNumber(available).times(offerPrice).dividedBy(tradeFee);
                const amountIn = new eth_wallet_6.BigNumber(amount).times(offerPrice).dividedBy(tradeFee);
                return (eth_wallet_6.BigNumber.minimum(balance, tokenBalance, amountIn)).toFixed();
            };
            this.getSecondAvailableBalance = () => {
                if (!this.buybackInfo || !this.buybackInfo.queueInfo) {
                    return '0';
                }
                const { queueInfo } = this.buybackInfo;
                const { offerPrice, tradeFee } = queueInfo;
                return new eth_wallet_6.BigNumber(this.getFirstAvailableBalance()).dividedBy(offerPrice).times(tradeFee).toFixed();
            };
            this.getTokenObject = (key) => {
                const chainId = this.chainId;
                const tokenMap = scom_token_list_4.tokenStore.getTokenMapByChainId(chainId);
                const tokenAddress = this.getValueByKey(key);
                if (tokenAddress && tokenMap) {
                    let token = tokenMap[tokenAddress.toLowerCase()];
                    if (!token) {
                        token = tokenMap[tokenAddress];
                    }
                    return token;
                }
                return null;
            };
            this.handleFocusInput = (first, isFocus) => {
                const elm = first ? this.firstInputBox : this.secondInputBox;
                if (isFocus) {
                    elm.classList.add('highlight-box');
                }
                else {
                    elm.classList.remove('highlight-box');
                }
            };
            this.updateCommissionInfo = () => {
                if (!this.hStackCommission)
                    return;
                if (this.state.getCurrentCommissions(this.commissions).length) {
                    this.hStackCommission.visible = true;
                    const firstToken = this.getTokenObject('toTokenAddress');
                    const secondToken = this.getTokenObject('fromTokenAddress');
                    if (firstToken && secondToken) {
                        const amount = new eth_wallet_6.BigNumber(this.firstInput?.value || 0);
                        const commissionAmount = this.state.getCommissionAmount(this.commissions, amount);
                        this.lbCommissionFee.caption = `${(0, index_8.formatNumber)(commissionAmount, 6)} ${firstToken?.symbol || ''}`;
                        this.hStackCommission.visible = true;
                    }
                    else {
                        this.hStackCommission.visible = false;
                    }
                }
                else {
                    this.hStackCommission.visible = false;
                }
            };
            this.firstInputChange = () => {
                const firstToken = this.getTokenObject('toTokenAddress');
                const secondToken = this.getTokenObject('fromTokenAddress');
                (0, index_8.limitInputNumber)(this.firstInput, firstToken?.decimals || 18);
                if (!this.buybackInfo)
                    return;
                const info = this.buybackInfo.queueInfo || {};
                const { offerPrice, tradeFee } = info;
                const firstSymbol = firstToken?.symbol || '';
                const inputVal = new eth_wallet_6.BigNumber(this.firstInput.value).dividedBy(offerPrice).times(tradeFee);
                if (inputVal.isNaN()) {
                    this.lbFee.caption = `0 ${firstSymbol}`;
                    this.secondInput.value = '';
                }
                else {
                    this.lbFee.caption = `${(0, index_8.formatNumber)(new eth_wallet_6.BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstSymbol}`;
                    this.secondInput.value = inputVal.dp(secondToken?.decimals || 18, ROUNDING_NUMBER).toFixed();
                }
                this.updateCommissionInfo();
                this.updateBtnSwap();
            };
            this.secondInputChange = () => {
                const firstToken = this.getTokenObject('toTokenAddress');
                const secondToken = this.getTokenObject('fromTokenAddress');
                (0, index_8.limitInputNumber)(this.secondInput, secondToken?.decimals || 18);
                if (!this.buybackInfo)
                    return;
                const info = this.buybackInfo.queueInfo || {};
                const { offerPrice, tradeFee } = info;
                const firstSymbol = firstToken?.symbol || '';
                const inputVal = new eth_wallet_6.BigNumber(this.secondInput.value).multipliedBy(offerPrice).dividedBy(tradeFee);
                if (inputVal.isNaN()) {
                    this.firstInput.value = '';
                    this.lbFee.caption = `0 ${firstSymbol}`;
                }
                else {
                    this.firstInput.value = inputVal.dp(firstToken?.decimals || 18, ROUNDING_NUMBER).toFixed();
                    this.lbFee.caption = `${(0, index_8.formatNumber)(new eth_wallet_6.BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstSymbol}`;
                }
                this.updateCommissionInfo();
                this.updateBtnSwap();
            };
            this.onSetMaxBalance = async () => {
                const { tradeFee, offerPrice } = this.buybackInfo.queueInfo || {};
                const firstAvailable = this.getFirstAvailableBalance();
                const firstToken = this.getTokenObject('toTokenAddress');
                const secondToken = this.getTokenObject('fromTokenAddress');
                const tokenBalances = scom_token_list_4.tokenStore.getTokenBalancesByChainId(this.chainId) || {};
                let totalAmount = new eth_wallet_6.BigNumber(tokenBalances[this.getValueByKey('toTokenAddress')] || 0);
                const commissionAmount = this.state.getCommissionAmount(this.commissions, totalAmount);
                if (commissionAmount.gt(0)) {
                    const totalFee = totalAmount.plus(commissionAmount).dividedBy(totalAmount);
                    totalAmount = totalAmount.dividedBy(totalFee);
                }
                const firstInputValue = totalAmount.gt(firstAvailable) ? firstAvailable : totalAmount;
                this.firstInput.value = new eth_wallet_6.BigNumber(firstInputValue).dp(firstToken?.decimals || 18, ROUNDING_NUMBER).toFixed();
                const inputVal = new eth_wallet_6.BigNumber(this.firstInput.value).dividedBy(offerPrice).times(tradeFee);
                this.secondInput.value = inputVal.dp(secondToken?.decimals || 18, ROUNDING_NUMBER).toFixed();
                this.lbFee.caption = `${(0, index_8.formatNumber)(new eth_wallet_6.BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstToken?.symbol || ''}`;
                this.updateCommissionInfo();
                this.updateBtnSwap();
            };
            this.updateBtnSwap = () => {
                if (!this.state.isRpcWalletConnected()) {
                    this.btnSwap.enabled = true;
                    this.btnSwap.caption = this.submitButtonText;
                    return;
                }
                if (!this.buybackInfo)
                    return;
                if (this.isSwapDisabled) {
                    this.btnSwap.enabled = false;
                    this.btnSwap.caption = this.submitButtonText;
                    return;
                }
                const firstVal = new eth_wallet_6.BigNumber(this.firstInput.value);
                const secondVal = new eth_wallet_6.BigNumber(this.secondInput.value);
                const firstAvailable = this.getFirstAvailableBalance();
                const secondAvailable = this.getSecondAvailableBalance();
                const commissionAmount = this.state.getCommissionAmount(this.commissions, firstVal);
                const tokenBalances = scom_token_list_4.tokenStore.getTokenBalancesByChainId(this.chainId);
                const balance = new eth_wallet_6.BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
                // const tradeFee = (this.buybackInfo.queueInfo || {}).tradeFee || '0';
                // const fee = new BigNumber(1).minus(tradeFee).times(this.firstInput.value);
                const total = firstVal.plus(commissionAmount);
                if (firstVal.isNaN() || firstVal.lte(0) || firstVal.gt(firstAvailable) || secondVal.isNaN() || secondVal.lte(0) || secondVal.gt(secondAvailable) || total.gt(balance)) {
                    this.btnSwap.enabled = false;
                }
                else {
                    this.btnSwap.enabled = true;
                }
                this.btnSwap.caption = this.submitButtonText;
            };
            this.onSwap = () => {
                if (!this.state.isRpcWalletConnected()) {
                    this.connectWallet();
                    return;
                }
                if (this.buybackInfo && this.isApproveButtonShown) {
                    const info = this.buybackInfo.queueInfo;
                    this.approvalModelAction.doApproveAction(this.getTokenObject('toTokenAddress'), info.tokenInAvailable);
                }
                else {
                    this.approvalModelAction.doPayAction();
                }
            };
            this.onSubmit = async () => {
                if (!this.buybackInfo || !this.buybackInfo.queueInfo)
                    return;
                const firstToken = this.getTokenObject('toTokenAddress');
                const secondToken = this.getTokenObject('fromTokenAddress');
                const { pairAddress, offerIndex } = this.buybackInfo.queueInfo;
                const amount = new eth_wallet_6.BigNumber(this.firstInput?.value || 0);
                const commissionAmount = this.state.getCommissionAmount(this.commissions, amount);
                this.showResultMessage('warning', `Swapping ${(0, index_8.formatNumber)(amount.plus(commissionAmount))} ${firstToken?.symbol} to ${(0, index_8.formatNumber)(this.secondInput.value)} ${secondToken?.symbol}`);
                const params = {
                    provider: "RestrictedOracle",
                    routeTokens: [firstToken, secondToken],
                    bestSmartRoute: [firstToken, secondToken],
                    pairs: [pairAddress],
                    fromAmount: new eth_wallet_6.BigNumber(this.firstInput.value),
                    toAmount: new eth_wallet_6.BigNumber(this.secondInput.value),
                    isFromEstimated: false,
                    groupQueueOfferIndex: offerIndex,
                    commissions: this.commissions
                };
                const { error } = await (0, index_11.executeSwap)(this.state, params);
                if (error) {
                    this.isSubmitting = false;
                    this.showResultMessage('error', error);
                }
            };
            this.updateInput = (enabled) => {
                this.firstInput.enabled = enabled;
                this.secondInput.enabled = enabled;
            };
            this.initApprovalModelAction = async () => {
                if (!this.state.isRpcWalletConnected())
                    return;
                if ((this.isExpired || this.isUpcoming) && this.btnSwap) {
                    this.updateBtnSwap();
                    return;
                }
                this.approvalModelAction = await this.state.setApprovalModelAction({
                    sender: this,
                    payAction: this.onSubmit,
                    onToBeApproved: async (token) => {
                        this.isApproveButtonShown = true;
                        this.btnSwap.enabled = true;
                        this.btnSwap.caption = this.state.isRpcWalletConnected() ? 'Approve' : 'Switch Network';
                    },
                    onToBePaid: async (token) => {
                        this.updateBtnSwap();
                        this.btnSwap.caption = this.submitButtonText;
                        this.isApproveButtonShown = false;
                    },
                    onApproving: async (token, receipt, data) => {
                        this.showResultMessage('success', receipt || '');
                        this.isSubmitting = true;
                        this.btnSwap.rightIcon.visible = true;
                        this.btnSwap.caption = 'Approving';
                        this.updateInput(false);
                    },
                    onApproved: async (token, data) => {
                        this.isSubmitting = false;
                        this.isApproveButtonShown = false;
                        this.btnSwap.rightIcon.visible = false;
                        this.btnSwap.caption = this.submitButtonText;
                        this.updateInput(true);
                        this.updateBtnSwap();
                    },
                    onApprovingError: async (token, err) => {
                        this.showResultMessage('error', err);
                        this.updateInput(true);
                        this.isSubmitting = false;
                        this.btnSwap.caption = 'Approve';
                        this.btnSwap.rightIcon.visible = false;
                    },
                    onPaying: async (receipt, data) => {
                        this.showResultMessage('success', receipt || '');
                        this.isSubmitting = true;
                        this.btnSwap.rightIcon.visible = true;
                        this.btnSwap.caption = this.submitButtonText;
                        this.updateInput(false);
                    },
                    onPaid: async (data) => {
                        await this.initializeWidgetConfig(true);
                        this.isSubmitting = false;
                        this.firstInput.value = '';
                        this.secondInput.value = '';
                        this.btnSwap.rightIcon.visible = false;
                        this.btnSwap.caption = this.submitButtonText;
                    },
                    onPayingError: async (err) => {
                        this.showResultMessage('error', err);
                        this.isSubmitting = false;
                        this.btnSwap.rightIcon.visible = false;
                        this.btnSwap.enabled = true;
                        this.btnSwap.caption = this.submitButtonText;
                    }
                });
                this.state.approvalModel.spenderAddress = this.contractAddress;
                const firstToken = this.getTokenObject('toTokenAddress');
                await this.approvalModelAction.checkAllowance(firstToken, this.getFirstAvailableBalance());
            };
            this.getValueByKey = (key) => {
                const item = this.buybackInfo;
                if (!item?.queueInfo)
                    return null;
                return item.queueInfo[key];
            };
            this.showResultMessage = (status, content) => {
                if (!this.txStatusModal)
                    return;
                let params = { status };
                if (status === 'success') {
                    params.txtHash = content;
                }
                else {
                    params.content = content;
                }
                this.txStatusModal.message = { ...params };
                this.txStatusModal.showModal();
            };
            this.connectWallet = async () => {
                if (!(0, index_9.isClientWalletConnected)()) {
                    if (this.mdWallet) {
                        await components_6.application.loadPackage('@scom/scom-wallet-modal', '*');
                        this.mdWallet.networks = this.networks;
                        this.mdWallet.wallets = this.wallets;
                        this.mdWallet.showModal();
                    }
                    return;
                }
                if (!this.state.isRpcWalletConnected()) {
                    const clientWallet = eth_wallet_6.Wallet.getClientInstance();
                    await clientWallet.switchNetwork(this.chainId);
                }
            };
            this.initEmptyUI = async () => {
                if (!this.noCampaignSection) {
                    this.noCampaignSection = await components_6.Panel.create({ width: '100%', height: '100%' });
                }
                const isClientConnected = (0, index_9.isClientWalletConnected)();
                this.noCampaignSection.clearInnerHTML();
                this.noCampaignSection.appendChild(this.$render("i-vstack", { class: "no-buyback", height: "100%", background: { color: Theme.background.main }, verticalAlignment: "center" },
                    this.$render("i-vstack", { gap: 10, verticalAlignment: "center", horizontalAlignment: "center" },
                        this.$render("i-image", { url: assets_2.default.fullPath('img/TrollTrooper.svg') }),
                        this.$render("i-label", { caption: isClientConnected ? 'No Buybacks' : 'Please connect with your wallet!' })),
                    !isClientConnected ? this.$render("i-button", { caption: "Connect Wallet", class: "btn-os", minHeight: 43, width: 300, maxWidth: "90%", margin: { top: 10, left: 'auto', right: 'auto' }, onClick: this.connectWallet }) : []));
                this.noCampaignSection.visible = true;
            };
            this.onToggleDetail = () => {
                const isExpanding = this.detailWrapper.visible;
                this.detailWrapper.visible = !isExpanding;
                this.btnDetail.caption = `${isExpanding ? 'More' : 'Hide'} Information`;
                this.btnDetail.rightIcon.name = isExpanding ? 'caret-down' : 'caret-up';
            };
            this.renderEmpty = async () => {
                this.infoStack.visible = false;
                this.emptyStack.visible = true;
                await this.initEmptyUI();
                if (this.emptyStack) {
                    this.emptyStack.clearInnerHTML();
                    this.emptyStack.appendChild(this.noCampaignSection);
                }
                if (this.loadingElm) {
                    this.loadingElm.visible = false;
                }
            };
            this.renderBuybackCampaign = async () => {
                if (this.buybackInfo) {
                    this.bottomStack.clearInnerHTML();
                    const chainId = this.chainId;
                    const isRpcConnected = this.state.isRpcWalletConnected();
                    const { queueInfo } = this.buybackInfo;
                    const { amount, allowAll, tradeFee, available } = queueInfo || {};
                    const tokenMap = scom_token_list_4.tokenStore.getTokenMapByChainId(chainId);
                    const firstTokenObj = tokenMap[this.getValueByKey('toTokenAddress')];
                    const secondTokenObj = tokenMap[this.getValueByKey('fromTokenAddress')];
                    const firstSymbol = firstTokenObj?.symbol ?? '';
                    const secondSymbol = secondTokenObj?.symbol ?? '';
                    const tokenBalances = scom_token_list_4.tokenStore.getTokenBalancesByChainId(this.state.getChainId()) || {};
                    const balance = tokenBalances[firstTokenObj.address.toLowerCase() || firstTokenObj.symbol];
                    const commissionFee = this.state.embedderCommissionFee;
                    const hasCommission = !!this.state.getCurrentCommissions(this.commissions).length;
                    this.bottomStack.clearInnerHTML();
                    this.bottomStack.appendChild(this.$render("i-panel", { padding: { bottom: '0.5rem', top: '0.5rem', right: '1rem', left: '1rem' }, height: "auto" },
                        this.$render("i-vstack", { gap: 10, width: "100%" },
                            this.$render("i-vstack", { id: "detailWrapper", gap: 10, width: "100%", visible: false },
                                this.$render("i-hstack", { gap: 4, verticalAlignment: "center", wrap: "wrap" },
                                    this.$render("i-label", { caption: "Group Queue Balance" }),
                                    this.$render("i-label", { caption: `${(0, index_8.formatNumber)(amount || 0)} ${secondSymbol}`, margin: { left: 'auto' } })),
                                this.$render("i-hstack", { gap: 4, verticalAlignment: "center", wrap: "wrap" },
                                    this.$render("i-label", { caption: "Your Allocation" }),
                                    this.$render("i-label", { caption: allowAll ? 'Unlimited' : `${(0, index_8.formatNumber)(available || 0)} ${secondSymbol}`, margin: { left: 'auto' } })),
                                this.$render("i-hstack", { gap: 4, verticalAlignment: "center", wrap: "wrap" },
                                    this.$render("i-label", { caption: "Your Balance" }),
                                    this.$render("i-label", { caption: `${(0, index_8.formatNumber)(balance || 0)} ${firstSymbol}`, margin: { left: 'auto' } }))),
                            this.$render("i-button", { id: "btnDetail", caption: "More Information", rightIcon: { width: 10, height: 16, margin: { left: 5 }, fill: Theme.text.primary, name: 'caret-down' }, background: { color: 'transparent' }, border: { width: 1, style: 'solid', color: Theme.text.primary, radius: 8 }, width: 300, maxWidth: "100%", height: 36, margin: { top: 4, bottom: 16, left: 'auto', right: 'auto' }, onClick: this.onToggleDetail }),
                            this.$render("i-hstack", { gap: 4, wrap: "wrap" },
                                this.$render("i-label", { caption: "Swap Available" }),
                                this.$render("i-vstack", { gap: 4, margin: { left: 'auto' }, horizontalAlignment: "end" },
                                    this.$render("i-label", { caption: `${(0, index_8.formatNumber)(this.getFirstAvailableBalance())} ${firstSymbol}`, font: { color: Theme.colors.primary.main } }),
                                    this.$render("i-label", { caption: `(${(0, index_8.formatNumber)(this.getSecondAvailableBalance())} ${secondSymbol})`, font: { color: Theme.colors.primary.main } }))),
                            this.$render("i-hstack", { id: "firstInputBox", gap: 8, width: "100%", height: 50, verticalAlignment: "center", background: { color: Theme.input.background }, border: { radius: 5, width: 2, style: 'solid', color: 'transparent' }, padding: { left: 7, right: 7 } },
                                this.$render("i-input", { id: "firstInput", inputType: "number", placeholder: "0.0", class: "input-amount", width: "100%", height: "100%", enabled: isRpcConnected, onChanged: this.firstInputChange, onFocus: () => this.handleFocusInput(true, true), onBlur: () => this.handleFocusInput(true, false) }),
                                this.$render("i-hstack", { gap: 4, width: 130, verticalAlignment: "center" },
                                    this.$render("i-button", { caption: "Max", enabled: isRpcConnected && new eth_wallet_6.BigNumber(this.getFirstAvailableBalance()).gt(0), padding: { top: 3, bottom: 3, left: 6, right: 6 }, border: { radius: 6 }, font: { size: '14px' }, class: "btn-os", onClick: this.onSetMaxBalance }),
                                    this.$render("i-image", { width: 24, height: 24, url: scom_token_list_4.assets.tokenPath(firstTokenObj, chainId), fallbackUrl: index_9.fallBackUrl }),
                                    this.$render("i-label", { caption: firstSymbol, font: { color: Theme.input.fontColor, bold: true } }))),
                            this.$render("i-vstack", { width: "100%", margin: { top: 4, bottom: 4 }, horizontalAlignment: "center" },
                                this.$render("i-icon", { name: "arrow-down", width: 20, height: 20, fill: Theme.text.primary })),
                            this.$render("i-hstack", { id: "secondInputBox", gap: 8, width: "100%", height: 50, verticalAlignment: "center", background: { color: Theme.input.background }, border: { radius: 5, width: 2, style: 'solid', color: 'transparent' }, padding: { left: 7, right: 7 } },
                                this.$render("i-input", { id: "secondInput", inputType: "number", placeholder: "0.0", class: "input-amount", width: "100%", height: "100%", enabled: isRpcConnected, onChanged: this.secondInputChange, onFocus: () => this.handleFocusInput(false, true), onBlur: () => this.handleFocusInput(false, false) }),
                                this.$render("i-hstack", { gap: 4, margin: { right: 8 }, width: 130, verticalAlignment: "center" },
                                    this.$render("i-button", { caption: "Max", enabled: isRpcConnected && new eth_wallet_6.BigNumber(this.getSecondAvailableBalance()).gt(0), padding: { top: 3, bottom: 3, left: 6, right: 6 }, border: { radius: 6 }, font: { size: '14px' }, class: "btn-os", onClick: this.onSetMaxBalance }),
                                    this.$render("i-image", { width: 24, height: 24, url: scom_token_list_4.assets.tokenPath(secondTokenObj, chainId), fallbackUrl: index_9.fallBackUrl }),
                                    this.$render("i-label", { caption: secondSymbol, font: { color: Theme.input.fontColor, bold: true } })))),
                        this.$render("i-hstack", { gap: 10, margin: { top: 6 }, verticalAlignment: "center", horizontalAlignment: "space-between" },
                            this.$render("i-label", { caption: `Trade Fee ${isNaN(Number(tradeFee)) ? '' : `(${new eth_wallet_6.BigNumber(1).minus(tradeFee).multipliedBy(100).toFixed()}%)`}`, font: { size: '0.75rem' } }),
                            this.$render("i-label", { id: "lbFee", caption: `0 ${firstSymbol}`, font: { size: '0.75rem' } })),
                        this.$render("i-hstack", { id: "hStackCommission", visible: hasCommission, gap: 10, margin: { top: 6 }, verticalAlignment: "center", horizontalAlignment: "space-between" },
                            this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                                this.$render("i-label", { caption: "Commission Fee", font: { size: '0.75rem' } }),
                                this.$render("i-icon", { tooltip: { content: `A commission fee of ${new eth_wallet_6.BigNumber(commissionFee).times(100)}% will be applied to the amount you input.` }, name: "question-circle", width: 14, height: 14 })),
                            this.$render("i-label", { id: "lbCommissionFee", caption: `0 ${firstSymbol}`, font: { size: '0.75rem' } })),
                        this.$render("i-vstack", { margin: { top: 15 }, verticalAlignment: "center", horizontalAlignment: "center" },
                            this.$render("i-panel", null,
                                this.$render("i-button", { id: "btnSwap", minWidth: 150, minHeight: 36, caption: this.state.isRpcWalletConnected() ? 'Swap' : 'Switch Network', border: { radius: 12 }, rightIcon: { spin: true, visible: false, fill: '#fff' }, padding: { top: 4, bottom: 4, left: 16, right: 16 }, class: "btn-os", onClick: this.onSwap.bind(this) })))));
                }
                else {
                    this.renderEmpty();
                }
            };
            this.renderLeftPart = async () => {
                if (this.buybackInfo) {
                    this.topStack.clearInnerHTML();
                    const { tokenIn, tokenOut, queueInfo } = this.buybackInfo;
                    const info = queueInfo || {};
                    const { startDate, endDate } = info;
                    const firstToken = tokenOut?.startsWith('0x') ? tokenOut.toLowerCase() : tokenOut;
                    const secondToken = tokenIn?.startsWith('0x') ? tokenIn.toLowerCase() : tokenIn;
                    const tokenMap = scom_token_list_4.tokenStore.getTokenMapByChainId(this.chainId);
                    const firstTokenObj = tokenMap[firstToken];
                    const firstSymbol = firstTokenObj?.symbol ?? '';
                    const secondTokenObj = tokenMap[secondToken];
                    const secondSymbol = secondTokenObj?.symbol ?? '';
                    const rate = `1 ${firstSymbol} : ${(0, index_8.formatNumber)(1 / this.getValueByKey('offerPrice'))} ${secondSymbol}`;
                    const reverseRate = `1 ${secondSymbol} : ${this.getValueByKey('offerPrice')} ${firstSymbol}`;
                    const { title, logo } = this._data;
                    const hasBranch = !!title || !!logo;
                    let imgLogo;
                    if (logo?.startsWith('ipfs://')) {
                        imgLogo = logo.replace('ipfs://', '/ipfs/');
                    }
                    else {
                        imgLogo = logo;
                    }
                    const hStackEndTime = await components_6.HStack.create({ gap: 4, verticalAlignment: 'center' });
                    const lbEndTime = await components_6.Label.create({ caption: 'End Time', font: { size: '0.875rem', bold: true } });
                    hStackEndTime.appendChild(lbEndTime);
                    hStackEndTime.appendChild(this.$render("i-label", { caption: (0, index_8.formatDate)(endDate), font: { size: '0.875rem', bold: true, color: Theme.colors.primary.main }, margin: { left: 'auto' } }));
                    // const optionTimer = { background: { color: Theme.colors.secondary.main }, font: { color: Theme.colors.secondary.contrastText } };
                    // const hStackTimer = await HStack.create({ gap: 4, verticalAlignment: 'center' });
                    // const lbTimer = await Label.create({ caption: 'Starts In', font: { size: '0.875rem', bold: true } });
                    // const endHour = await Label.create(optionTimer);
                    // const endDay = await Label.create(optionTimer);
                    // const endMin = await Label.create(optionTimer);
                    // endHour.classList.add('timer-value');
                    // endDay.classList.add('timer-value');
                    // endMin.classList.add('timer-value');
                    // hStackTimer.appendChild(lbTimer);
                    // hStackTimer.appendChild(
                    // 	<i-hstack gap={4} margin={{ left: 'auto' }} verticalAlignment="center" class="custom-timer">
                    // 		{endDay}
                    // 		<i-label caption="D" class="timer-unit" />
                    // 		{endHour}
                    // 		<i-label caption="H" class="timer-unit" />
                    // 		{endMin}
                    // 		<i-label caption="M" class="timer-unit" />
                    // 	</i-hstack>
                    // );
                    // let interval: any;
                    // const setTimer = () => {
                    // 	let days = 0;
                    // 	let hours = 0;
                    // 	let mins = 0;
                    // 	if (moment().isBefore(moment(startDate))) {
                    // 		lbTimer.caption = 'Starts In';
                    // 		lbEndTime.caption = 'End Time';
                    // 		days = moment(startDate).diff(moment(), 'days');
                    // 		hours = moment(startDate).diff(moment(), 'hours') - days * 24;
                    // 		mins = moment(startDate).diff(moment(), 'minutes') - days * 24 * 60 - hours * 60;
                    // 	} else if (moment(moment()).isBefore(endDate)) {
                    // 		lbTimer.caption = 'Ends In';
                    // 		hStackEndTime.visible = false;
                    // 		days = moment(endDate).diff(moment(), 'days');
                    // 		hours = moment(endDate).diff(moment(), 'hours') - days * 24;
                    // 		mins = moment(endDate).diff(moment(), 'minutes') - days * 24 * 60 - hours * 60;
                    // 	} else {
                    // 		hStackTimer.visible = false;
                    // 		hStackEndTime.visible = true;
                    // 		lbEndTime.caption = 'Ended On';
                    // 		days = hours = mins = 0;
                    // 		clearInterval(interval);
                    // 	}
                    // 	endDay.caption = `${days}`;
                    // 	endHour.caption = `${hours}`;
                    // 	endMin.caption = `${mins}`;
                    // }
                    // setTimer();
                    // interval = setInterval(() => {
                    // 	setTimer();
                    // }, 1000);
                    const lbRate = new components_6.Label(undefined, {
                        caption: rate,
                        font: { bold: true, color: Theme.colors.primary.main },
                    });
                    let isToggled = false;
                    const onToggleRate = () => {
                        isToggled = !isToggled;
                        lbRate.caption = isToggled ? reverseRate : rate;
                    };
                    this.topStack.clearInnerHTML();
                    this.topStack.appendChild(this.$render("i-vstack", { gap: 10, width: "100%", padding: { bottom: '0.5rem', top: '0.5rem', right: '1rem', left: '1rem' } },
                        hasBranch ? this.$render("i-vstack", { gap: "0.25rem", margin: { bottom: '0.25rem' }, horizontalAlignment: "center" },
                            this.$render("i-label", { visible: !!title, caption: title, margin: { top: '0.5em', bottom: '1em' }, font: { weight: 600 } }),
                            this.$render("i-image", { visible: !!imgLogo, url: imgLogo, height: 100 })) : [],
                        this.$render("i-hstack", { gap: "0.25rem", verticalAlignment: "center", horizontalAlignment: "space-between", wrap: "wrap" },
                            this.$render("i-label", { caption: "Buyback Price", font: { bold: true } }),
                            this.$render("i-hstack", { gap: "0.5rem", verticalAlignment: "center", horizontalAlignment: "end" },
                                lbRate,
                                this.$render("i-icon", { name: "exchange-alt", width: 14, height: 14, fill: Theme.text.primary, opacity: 0.9, cursor: "pointer", onClick: onToggleRate }))),
                        hStackEndTime));
                }
            };
        }
        get isExpired() {
            if (!this.buybackInfo)
                return null;
            const info = this.buybackInfo.queueInfo;
            if (!info?.endDate)
                return null;
            return (0, components_6.moment)().isAfter((0, components_6.moment)(info.endDate));
        }
        get isUpcoming() {
            if (!this.buybackInfo)
                return null;
            const info = this.buybackInfo.queueInfo;
            if (!info?.startDate)
                return null;
            return (0, components_6.moment)().isBefore((0, components_6.moment)(info.startDate));
        }
        get isSwapDisabled() {
            if (!this.buybackInfo)
                return true;
            const info = this.buybackInfo.queueInfo;
            if (!info)
                return true;
            const { startDate, endDate, allowAll, isApprovedTrader } = info;
            const isUpcoming = (0, components_6.moment)().isBefore((0, components_6.moment)(startDate));
            const isExpired = (0, components_6.moment)().isAfter((0, components_6.moment)(endDate));
            if (isUpcoming || isExpired) {
                return true;
            }
            if (!allowAll) {
                return !isApprovedTrader;
            }
            return false;
        }
        get submitButtonText() {
            if (!this.state.isRpcWalletConnected()) {
                return 'Switch Network';
            }
            if (this.isUpcoming) {
                return 'Upcoming';
            }
            if (this.isExpired) {
                return 'Expired';
            }
            if (this.isApproveButtonShown) {
                return this.isSubmitting ? 'Approving' : 'Approve';
            }
            const firstVal = new eth_wallet_6.BigNumber(this.firstInput.value);
            const secondVal = new eth_wallet_6.BigNumber(this.secondInput.value);
            if (firstVal.lt(0) || secondVal.lt(0)) {
                return 'Amount must be greater than 0';
            }
            if (this.buybackInfo) {
                const firstMaxVal = new eth_wallet_6.BigNumber(this.getFirstAvailableBalance());
                const secondMaxVal = new eth_wallet_6.BigNumber(this.getSecondAvailableBalance());
                const commissionAmount = this.state.getCommissionAmount(this.commissions, firstVal);
                const tokenBalances = scom_token_list_4.tokenStore.getTokenBalancesByChainId(this.chainId);
                const balance = new eth_wallet_6.BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
                // const tradeFee = (this.buybackInfo.queueInfo || {}).tradeFee || '0';
                // const fee = new BigNumber(1).minus(tradeFee).times(this.firstInput.value);
                const total = firstVal.plus(commissionAmount);
                if (firstVal.gt(firstMaxVal) || secondVal.gt(secondMaxVal) || total.gt(balance)) {
                    return 'Insufficient amount available';
                }
            }
            if (this.isSubmitting) {
                return 'Swapping';
            }
            return 'Swap';
        }
        ;
        isEmptyData(value) {
            return !value || !value.chainId || !value.offerIndex;
        }
        async init() {
            super.init();
            this.state = new index_9.State(data_json_1.default);
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const defaultChainId = this.getAttribute('defaultChainId', true);
                const chainId = this.getAttribute('chainId', true, defaultChainId || 0);
                const logo = this.getAttribute('logo', true);
                const title = this.getAttribute('title', true);
                const offerIndex = this.getAttribute('offerIndex', true, 0);
                const tokenIn = this.getAttribute('tokenIn', true, '');
                const tokenOut = this.getAttribute('tokenOut', true, '');
                // const commissions = this.getAttribute('commissions', true, []);
                const networks = this.getAttribute('networks', true);
                const wallets = this.getAttribute('wallets', true);
                const showHeader = this.getAttribute('showHeader', true);
                const data = {
                    chainId,
                    title,
                    logo,
                    offerIndex,
                    tokenIn,
                    tokenOut,
                    // commissions,
                    defaultChainId,
                    networks,
                    wallets,
                    showHeader
                };
                if (!this.isEmptyData(data)) {
                    await this.setData(data);
                }
                else {
                    await this.renderEmpty();
                }
            }
        }
        render() {
            return (this.$render("i-scom-dapp-container", { id: "dappContainer", class: index_css_2.buybackDappContainer },
                this.$render("i-panel", { class: index_css_2.buybackComponent, minHeight: 340 },
                    this.$render("i-panel", { id: "buybackLayout", class: "buyback-layout", margin: { left: 'auto', right: 'auto' } },
                        this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay" },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_2.default.fullPath('img/loading.svg'), width: 36, height: 36 } }),
                                this.$render("i-label", { caption: "Loading...", font: { color: '#FD4A4C', size: '1.5em' }, class: "i-loading-spinner_text" }))),
                        this.$render("i-vstack", { id: "emptyStack", visible: false, minHeight: 320, margin: { top: 10, bottom: 10 }, verticalAlignment: "center", horizontalAlignment: "center" }),
                        this.$render("i-vstack", { id: "infoStack", width: "100%", minWidth: 320, maxWidth: 500, height: "100%", margin: { left: 'auto', right: 'auto' }, horizontalAlignment: "center" },
                            this.$render("i-vstack", { id: "topStack", width: "inherit", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } }),
                            this.$render("i-panel", { width: "calc(100% - 4rem)", height: 2, background: { color: Theme.input.background } }),
                            this.$render("i-vstack", { id: "bottomStack", gap: "0.5rem", width: "inherit", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, background: { color: Theme.background.main }, verticalAlignment: "space-between" }))),
                    this.$render("i-scom-tx-status-modal", { id: "txStatusModal" }),
                    this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] }))));
        }
    };
    ScomBuyback = __decorate([
        components_6.customModule,
        (0, components_6.customElements)('i-scom-buyback')
    ], ScomBuyback);
    exports.default = ScomBuyback;
});
