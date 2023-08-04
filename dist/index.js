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
    exports.viewOnExplorerByTxHash = exports.numberToBytes32 = exports.padLeft = exports.toWeiInv = exports.limitDecimals = exports.limitInputNumber = exports.isInvalidInput = exports.formatNumberWithSeparators = exports.formatNumber = exports.formatDate = exports.DefaultDateFormat = exports.explorerTxUrlsByChainId = void 0;
    exports.explorerTxUrlsByChainId = {
        1: 'https://etherscan.io/tx/',
        4: 'https://rinkeby.etherscan.io/tx/',
        42: 'https://kovan.etherscan.io/tx/',
        56: 'https://bscscan.com/tx/',
        97: 'https://testnet.bscscan.com/tx/',
        43113: 'https://testnet.snowtrace.io/tx/',
        43114: 'https://snowtrace.io/tx/',
        137: 'https://polygonscan.com/tx/',
        80001: 'https://mumbai.polygonscan.com/tx/',
        250: 'https://ftmscan.com/tx/',
        4002: 'https://testnet.ftmscan.com/tx/',
        13370: 'https://aminoxtestnet.blockscout.alphacarbon.network/tx/',
        421613: 'https://goerli.arbiscan.io/tx/'
    };
    exports.DefaultDateFormat = 'DD/MM/YYYY';
    const formatDate = (date, customType, showTimezone) => {
        const formatType = customType || exports.DefaultDateFormat;
        const formatted = (0, components_1.moment)(date).format(formatType);
        if (showTimezone) {
            return `${formatted} (UTC+${(0, components_1.moment)().utcOffset() / 60})`;
        }
        return formatted;
    };
    exports.formatDate = formatDate;
    const formatNumber = (value, decimals) => {
        let val = value;
        const minValue = '0.0000001';
        if (typeof value === 'string') {
            val = new eth_wallet_1.BigNumber(value).toNumber();
        }
        else if (typeof value === 'object') {
            val = value.toNumber();
        }
        if (val != 0 && new eth_wallet_1.BigNumber(val).lt(minValue)) {
            return `<${minValue}`;
        }
        return (0, exports.formatNumberWithSeparators)(val, decimals || 4);
    };
    exports.formatNumber = formatNumber;
    const formatNumberWithSeparators = (value, precision) => {
        if (!value)
            value = 0;
        if (precision) {
            let outputStr = '';
            if (value >= 1) {
                outputStr = value.toLocaleString('en-US', { maximumFractionDigits: precision });
            }
            else {
                outputStr = value.toLocaleString('en-US', { maximumSignificantDigits: precision });
            }
            if (outputStr.length > 18) {
                outputStr = outputStr.substr(0, 18) + '...';
            }
            return outputStr;
        }
        return value.toLocaleString('en-US');
    };
    exports.formatNumberWithSeparators = formatNumberWithSeparators;
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
        if (!new eth_wallet_1.BigNumber(amount).isNaN()) {
            input.value = (0, exports.limitDecimals)(amount, decimals || 18);
        }
    };
    exports.limitInputNumber = limitInputNumber;
    const limitDecimals = (value, decimals) => {
        let val = value;
        if (typeof value !== 'string') {
            val = val.toString();
        }
        let chart;
        if (val.includes('.')) {
            chart = '.';
        }
        else if (val.includes(',')) {
            chart = ',';
        }
        else {
            return value;
        }
        const parts = val.split(chart);
        let decimalsPart = parts[1];
        if (decimalsPart && decimalsPart.length > decimals) {
            parts[1] = decimalsPart.substr(0, decimals);
        }
        return parts.join(chart);
    };
    exports.limitDecimals = limitDecimals;
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
    const viewOnExplorerByTxHash = (chainId, txHash) => {
        if (exports.explorerTxUrlsByChainId[chainId]) {
            let url = `${exports.explorerTxUrlsByChainId[chainId]}${txHash}`;
            window.open(url);
        }
    };
    exports.viewOnExplorerByTxHash = viewOnExplorerByTxHash;
});
define("@scom/scom-buyback/global/utils/error.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseContractError = void 0;
    ///<amd-module name='@scom/scom-buyback/global/utils/error.ts'/> 
    async function parseContractError(oMessage, tokens) {
        var _a;
        const staticMessageMap = {
            'execution reverted: OAXDEX: K': 'x * y = k Violated',
            'execution reverted: OAXDEX: FORBIDDEN': 'Forbidden',
            'execution reverted: OAXDEX: INSUFFICIENT_INPUT_AMOUNT': 'Insufficient input amount',
            'execution reverted: OAXDEX: INVALID_TO': 'Invalid to',
            'execution reverted: OAXDEX: INSUFFICIENT_LIQUIDITY': 'Insufficient liquidity',
            'execution reverted: OAXDEX: INSUFFICIENT_OUTPUT_AMOUNT': 'Insufficient output amount',
            'execution reverted: OAXDEX: PAIR PAUSED': 'Pair paused',
            'execution reverted: OAXDEX: GLOBALLY PAUSED': 'Globally paused',
            'execution reverted: OAXDEX: INSUFFICIENT_LIQUIDITY_BURNED': 'Insufficient liquidity burned',
            'execution reverted: OAXDEX: INSUFFICIENT_LIQUIDITY_MINTED': 'Insufficient liquidity minted',
            'execution reverted: OAXDEX: OVERFLOW': 'Overflow',
            'execution reverted: OAXDEX_Pair: INSUFFICIENT_LIQUIDITY': 'Insufficient liquidity',
            'execution reverted: OAXDEX_Pair: INSUFFICIENT_OUTPUT_AMOUNT': 'Insufficient output amount',
            'execution reverted: OAXDEX_Pair: INSUFFICIENT_INPUT_AMOUNT': 'Insufficient input amount',
            'execution reverted: OAXDEX: LOCKED': 'Locked',
            'execution reverted: OAXDEX: INVALID_SIGNATURE': 'Invalid signature',
            'execution reverted: OAXDEX: EXPIRED': 'Expired',
            'Returned error: MetaMask Tx Signature: User denied transaction signature.': 'User denied transaction signature',
            'execution reverted: OracleAdaptor: Price outside allowed range': 'Circuit Breaker: Exceeds Price Protection Range',
            'execution reverted: PAIR_NOT_MATCH': 'Pair Not Match',
            'execution reverted: No oracle found': 'No Oracle found',
            'execution reverted: Amount exceeds available fund': 'Insufficient liquidity',
        };
        return (_a = staticMessageMap[oMessage]) !== null && _a !== void 0 ? _a : oMessage;
    }
    exports.parseContractError = parseContractError;
});
define("@scom/scom-buyback/global/utils/common.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/oswap-openswap-contract"], function (require, exports, eth_wallet_2, oswap_openswap_contract_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getERC20Allowance = exports.approveERC20Max = exports.registerSendTxEvents = void 0;
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
    const approveERC20Max = async (token, spenderAddress, callback, confirmationCallback) => {
        let wallet = eth_wallet_2.Wallet.getClientInstance();
        let amount = new eth_wallet_2.BigNumber(2).pow(256).minus(1);
        let erc20 = new oswap_openswap_contract_1.Contracts.ERC20(wallet, token.address);
        (0, exports.registerSendTxEvents)({
            transactionHash: callback,
            confirmation: confirmationCallback
        });
        let receipt = await erc20.approve({
            spender: spenderAddress,
            amount
        });
        return receipt;
    };
    exports.approveERC20Max = approveERC20Max;
    const getERC20Allowance = async (token, spenderAddress) => {
        if (!(token === null || token === void 0 ? void 0 : token.address))
            return null;
        let wallet = eth_wallet_2.Wallet.getClientInstance();
        let erc20 = new oswap_openswap_contract_1.Contracts.ERC20(wallet, token.address);
        let allowance = await erc20.allowance({
            owner: wallet.account.address,
            spender: spenderAddress
        });
        return allowance;
    };
    exports.getERC20Allowance = getERC20Allowance;
});
define("@scom/scom-buyback/global/utils/approvalModel.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-buyback/global/utils/common.ts"], function (require, exports, eth_wallet_3, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ERC20ApprovalModel = exports.ApprovalStatus = void 0;
    var ApprovalStatus;
    (function (ApprovalStatus) {
        ApprovalStatus[ApprovalStatus["TO_BE_APPROVED"] = 0] = "TO_BE_APPROVED";
        ApprovalStatus[ApprovalStatus["APPROVING"] = 1] = "APPROVING";
        ApprovalStatus[ApprovalStatus["NONE"] = 2] = "NONE";
    })(ApprovalStatus = exports.ApprovalStatus || (exports.ApprovalStatus = {}));
    class ERC20ApprovalModel {
        constructor(options) {
            this.options = {
                sender: null,
                spenderAddress: '',
                payAction: async () => { },
                onToBeApproved: async (token) => { },
                onToBePaid: async (token) => { },
                onApproving: async (token, receipt, data) => { },
                onApproved: async (token, data) => { },
                onPaying: async (receipt, data) => { },
                onPaid: async (data) => { },
                onApprovingError: async (token, err) => { },
                onPayingError: async (err) => { }
            };
            this.checkAllowance = async (token, inputAmount) => {
                let allowance = await (0, common_1.getERC20Allowance)(token, this.options.spenderAddress);
                if (!allowance) {
                    await this.options.onToBePaid.bind(this.options.sender)(token);
                }
                else if (new eth_wallet_3.BigNumber(inputAmount).gt(allowance)) {
                    await this.options.onToBeApproved.bind(this.options.sender)(token);
                }
                else {
                    await this.options.onToBePaid.bind(this.options.sender)(token);
                }
            };
            this.doApproveAction = async (token, inputAmount, data) => {
                const txHashCallback = async (err, receipt) => {
                    if (err) {
                        await this.options.onApprovingError.bind(this.options.sender)(token, err);
                    }
                    else {
                        await this.options.onApproving.bind(this.options.sender)(token, receipt, data);
                    }
                };
                const confirmationCallback = async (receipt) => {
                    await this.options.onApproved.bind(this.options.sender)(token, data);
                    await this.checkAllowance(token, inputAmount);
                };
                (0, common_1.approveERC20Max)(token, this.options.spenderAddress, txHashCallback, confirmationCallback);
            };
            this.doPayAction = async (data) => {
                const txHashCallback = async (err, receipt) => {
                    if (err) {
                        await this.options.onPayingError.bind(this.options.sender)(err);
                    }
                    else {
                        await this.options.onPaying.bind(this.options.sender)(receipt, data);
                    }
                };
                const confirmationCallback = async (receipt) => {
                    await this.options.onPaid.bind(this.options.sender)(data);
                };
                (0, common_1.registerSendTxEvents)({
                    transactionHash: txHashCallback,
                    confirmation: confirmationCallback
                });
                await this.options.payAction.bind(this.options.sender)();
            };
            this.getAction = () => {
                return {
                    doApproveAction: this.doApproveAction,
                    doPayAction: this.doPayAction,
                    checkAllowance: this.checkAllowance
                };
            };
            this.options = options;
        }
        set spenderAddress(value) {
            this.options.spenderAddress = value;
        }
    }
    exports.ERC20ApprovalModel = ERC20ApprovalModel;
});
define("@scom/scom-buyback/global/utils/interfaces.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QueueType = void 0;
    var QueueType;
    (function (QueueType) {
        QueueType[QueueType["PRIORITY_QUEUE"] = 0] = "PRIORITY_QUEUE";
        QueueType[QueueType["RANGE_QUEUE"] = 1] = "RANGE_QUEUE";
        QueueType[QueueType["GROUP_QUEUE"] = 2] = "GROUP_QUEUE";
        QueueType[QueueType["PEGGED_QUEUE"] = 3] = "PEGGED_QUEUE";
        QueueType[QueueType["OTC_QUEUE"] = 4] = "OTC_QUEUE";
    })(QueueType = exports.QueueType || (exports.QueueType = {}));
});
define("@scom/scom-buyback/global/utils/index.ts", ["require", "exports", "@scom/scom-buyback/global/utils/helper.ts", "@scom/scom-buyback/global/utils/error.ts", "@scom/scom-buyback/global/utils/common.ts", "@scom/scom-buyback/global/utils/approvalModel.ts", "@scom/scom-buyback/global/utils/interfaces.ts"], function (require, exports, helper_1, error_1, common_2, approvalModel_1, interfaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ERC20ApprovalModel = exports.ApprovalStatus = exports.getERC20Allowance = exports.approveERC20Max = exports.registerSendTxEvents = exports.parseContractError = void 0;
    ///<amd-module name='@scom/scom-buyback/global/utils/index.ts'/> 
    __exportStar(helper_1, exports);
    Object.defineProperty(exports, "parseContractError", { enumerable: true, get: function () { return error_1.parseContractError; } });
    Object.defineProperty(exports, "registerSendTxEvents", { enumerable: true, get: function () { return common_2.registerSendTxEvents; } });
    Object.defineProperty(exports, "approveERC20Max", { enumerable: true, get: function () { return common_2.approveERC20Max; } });
    Object.defineProperty(exports, "getERC20Allowance", { enumerable: true, get: function () { return common_2.getERC20Allowance; } });
    Object.defineProperty(exports, "ApprovalStatus", { enumerable: true, get: function () { return approvalModel_1.ApprovalStatus; } });
    Object.defineProperty(exports, "ERC20ApprovalModel", { enumerable: true, get: function () { return approvalModel_1.ERC20ApprovalModel; } });
    __exportStar(interfaces_1, exports);
});
define("@scom/scom-buyback/global/index.ts", ["require", "exports", "@scom/scom-buyback/global/utils/index.ts"], function (require, exports, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
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
define("@scom/scom-buyback/store/data/index.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Market = exports.CoreContractAddressesByChainId = void 0;
    ///<amd-module name='@scom/scom-buyback/store/data/index.ts'/> 
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
            "OSWAP_OracleFactory": "0x02ac522Deb18156CFaE15c7c93da44bd6CC5c967",
            "OSWAP_PeggedOracleFactory": '0x016c6d1Cee7a639D84479372EB1B4fBaDca92a5d',
        },
        56: {
            "WETH9": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            "OSWAP_HybridRouter2": "0xFc7261491753C53F0aa168CDB290e47f64C713bB",
            "OSWAP_OracleFactory": "0x8CB1fEE69f7F8f00efd5d47067eb75C19cd40017",
            "OSWAP_RangeFactory": "0xE31e10f0f3f65a4aFe510C460Cda0f9392Fb0e99",
            "OSWAP_RestrictedFactory": "0x91d137464b93caC7E2c2d4444a9D8609E4473B70",
            "OSWAP_PeggedOracleFactory": '0x6ebc906c7f657c17f021f4a3c696a4c625bfbaf0',
        },
        97: {
            "WETH9": "0xae13d989dac2f0debff460ac112a837c89baa7cd",
            "OSWAP_HybridRouter2": "0x58dD8dC6EbE7AE6bbDA3ba5DA10eC08f27D52D31",
            "OSWAP_OracleFactory": "0x03843D530400cB153459d3d64f921940f88b21B2",
            "OSWAP_RangeFactory": "0xbF8C49367377e1bc15faafF1A873fBc692d5411c",
            "OSWAP_RestrictedFactory": "0xa158FB71cA5EF59f707c6F8D0b9CC5765F97Fd60",
            "OSWAP_PeggedOracleFactory": '0xC4539f2e431AD23ab62c5947a99750FEF0Ccf046',
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
            "OSWAP_OracleFactory": "0x67c314DC938049150F4c162032bb9645c202Ba71",
            "OSWAP_RangeFactory": "0xEfeAD058e3a16272FD61D978e54D6c7039ae828E",
            "OSWAP_RestrictedFactory": "0x739f0BBcdAd415127FE8d5d6ED053e9D817BdAdb",
            "OSWAP_HybridRouter2": "0xC3F6FE3da0A69621EE9c5bBFa5507f365ad9CFf8",
        },
        43113: {
            "WETH9": "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
            "OSWAP_HybridRouter2": "0x83445062a0685e47d8228881c594c0A8494E284a",
            "OSWAP_OracleFactory": "0x9D9491e6dF38A68181fb4c24D5c6779DdEFdd6E8",
            "OSWAP_RangeFactory": "0xEcD7f181f90aC33117ac4CfAe55514F1c62433db",
            "OSWAP_RestrictedFactory": "0x6C99c8E2c587706281a5B66bA7617DA7e2Ba6e48",
            "OSWAP_PeggedOracleFactory": '0x728DbD968341eb7aD11bDabFE775A13aF901d6ac',
        },
        250: {
            "WETH9": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
        },
        4002: {
            "WETH9": "0xf1277d1Ed8AD466beddF92ef448A132661956621",
            "OSWAP_OracleFactory": '0x28A6a9079fA8e041179cD13F4652af2B315b6fd8',
            "OSWAP_HybridRouter2": '0x1B0D217822719941a1ae3B38eB0A94663e9ad86E',
        },
        13370: {
            "WETH9": "0xCb5e100fdF7d24f25865fa85673D9bD6Bb4674ab",
            "OSWAP_HybridRouter2": "0x567c6Af5Ec3EC2821143179DD4bBAcea5f7A9de9",
            "OSWAP_OracleFactory": "0x227C8E8C4D1baDC6665Cb31C01E0B3D65c5d04B4",
            "OSWAP_RangeFactory": "0x1Db29E80e7eCc82Be98d1deE4Bf3800433212b7e",
            "OSWAP_RestrictedFactory": "0x6B9215FCa70E2972182B7BF427C4D7fCcf5C24e5",
        }
    };
    var Market;
    (function (Market) {
        Market[Market["OPENSWAP"] = 0] = "OPENSWAP";
        Market[Market["UNISWAP"] = 1] = "UNISWAP";
        Market[Market["SUSHISWAP"] = 2] = "SUSHISWAP";
        Market[Market["PANCAKESWAPV1"] = 3] = "PANCAKESWAPV1";
        Market[Market["PANCAKESWAP"] = 4] = "PANCAKESWAP";
        Market[Market["BAKERYSWAP"] = 5] = "BAKERYSWAP";
        Market[Market["BURGERSWAP"] = 6] = "BURGERSWAP";
        Market[Market["IFSWAPV1"] = 7] = "IFSWAPV1";
        Market[Market["OPENSWAPV1"] = 8] = "OPENSWAPV1";
        Market[Market["HYBRID"] = 9] = "HYBRID";
        Market[Market["MIXED_QUEUE"] = 10] = "MIXED_QUEUE";
        Market[Market["GROUP_QUEUE"] = 11] = "GROUP_QUEUE";
        Market[Market["QUICKSWAP"] = 12] = "QUICKSWAP";
        Market[Market["BISWAP"] = 13] = "BISWAP";
        Market[Market["PANGOLIN"] = 14] = "PANGOLIN";
        Market[Market["TRADERJOE"] = 15] = "TRADERJOE";
        Market[Market["SPIRITSWAP"] = 16] = "SPIRITSWAP";
        Market[Market["SPOOKYSWAP"] = 17] = "SPOOKYSWAP";
        Market[Market["PEGGED_QUEUE"] = 18] = "PEGGED_QUEUE";
        Market[Market["HAKUSWAP"] = 19] = "HAKUSWAP";
        Market[Market["JETSWAP"] = 20] = "JETSWAP";
        Market[Market["IFSWAPV3"] = 21] = "IFSWAPV3";
    })(Market = exports.Market || (exports.Market = {}));
});
define("@scom/scom-buyback/store/utils.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-token-list", "@scom/scom-network-list", "@scom/scom-buyback/store/data/index.ts", "@scom/scom-buyback/store/data/index.ts", "@ijstech/components"], function (require, exports, eth_wallet_4, scom_token_list_1, scom_network_list_1, index_2, index_3, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getClientWallet = exports.getRpcWallet = exports.initRpcWallet = exports.getChainId = exports.isRpcWalletConnected = exports.isClientWalletConnected = exports.getCommissionAmount = exports.getCurrentCommissions = exports.getEmbedderCommissionFee = exports.getProxyAddress = exports.setProxyAddresses = exports.state = exports.setTransactionDeadline = exports.getTransactionDeadline = exports.setSlippageTolerance = exports.getSlippageTolerance = exports.setDataFromConfig = exports.getWETH = exports.getAddresses = exports.getChainNativeToken = exports.getInfuraId = void 0;
    __exportStar(index_3, exports);
    const setInfuraId = (infuraId) => {
        exports.state.infuraId = infuraId;
    };
    const getInfuraId = () => {
        return exports.state.infuraId;
    };
    exports.getInfuraId = getInfuraId;
    const setNetworkList = (networkList, infuraId) => {
        const wallet = eth_wallet_4.Wallet.getClientInstance();
        exports.state.networkMap = {};
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
            exports.state.networkMap[network.chainId] = Object.assign(Object.assign({}, networkInfo), network);
            wallet.setNetworkInfo(exports.state.networkMap[network.chainId]);
        }
    };
    const getChainNativeToken = (chainId) => {
        return scom_token_list_1.ChainNativeTokenByChainId[chainId];
    };
    exports.getChainNativeToken = getChainNativeToken;
    function getAddresses(chainId) {
        return index_2.CoreContractAddressesByChainId[chainId || getChainId()] || {};
    }
    exports.getAddresses = getAddresses;
    const getWETH = (chainId) => {
        let wrappedToken = scom_token_list_1.WETHByChainId[chainId];
        return wrappedToken;
    };
    exports.getWETH = getWETH;
    const setDataFromConfig = (options) => {
        if (options.infuraId) {
            setInfuraId(options.infuraId);
        }
        if (options.networks) {
            setNetworkList(options.networks, options.infuraId);
        }
        if (options.proxyAddresses) {
            (0, exports.setProxyAddresses)(options.proxyAddresses);
        }
        if (options.embedderCommissionFee) {
            setEmbedderCommissionFee(options.embedderCommissionFee);
        }
    };
    exports.setDataFromConfig = setDataFromConfig;
    const getSlippageTolerance = () => {
        return exports.state.slippageTolerance;
    };
    exports.getSlippageTolerance = getSlippageTolerance;
    const setSlippageTolerance = (value) => {
        exports.state.slippageTolerance = value;
    };
    exports.setSlippageTolerance = setSlippageTolerance;
    const getTransactionDeadline = () => {
        return exports.state.transactionDeadline;
    };
    exports.getTransactionDeadline = getTransactionDeadline;
    const setTransactionDeadline = (value) => {
        exports.state.transactionDeadline = value;
    };
    exports.setTransactionDeadline = setTransactionDeadline;
    exports.state = {
        networkMap: {},
        slippageTolerance: 0.5,
        transactionDeadline: 30,
        infuraId: '',
        proxyAddresses: {},
        embedderCommissionFee: '0',
        rpcWalletId: ''
    };
    const setProxyAddresses = (data) => {
        exports.state.proxyAddresses = data;
    };
    exports.setProxyAddresses = setProxyAddresses;
    const getProxyAddress = (chainId) => {
        const _chainId = chainId || eth_wallet_4.Wallet.getInstance().chainId;
        const proxyAddresses = exports.state.proxyAddresses;
        if (proxyAddresses) {
            return proxyAddresses[_chainId];
        }
        return null;
    };
    exports.getProxyAddress = getProxyAddress;
    const setEmbedderCommissionFee = (fee) => {
        exports.state.embedderCommissionFee = fee;
    };
    const getEmbedderCommissionFee = () => {
        return exports.state.embedderCommissionFee;
    };
    exports.getEmbedderCommissionFee = getEmbedderCommissionFee;
    const getCurrentCommissions = (commissions) => {
        return (commissions || []).filter(v => v.chainId == getChainId());
    };
    exports.getCurrentCommissions = getCurrentCommissions;
    const getCommissionAmount = (commissions, amount) => {
        const _commissions = (commissions || []).filter(v => v.chainId == getChainId()).map(v => {
            return {
                to: v.walletAddress,
                amount: amount.times(v.share)
            };
        });
        const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)) : new eth_wallet_4.BigNumber(0);
        return commissionsAmount;
    };
    exports.getCommissionAmount = getCommissionAmount;
    function isClientWalletConnected() {
        const wallet = eth_wallet_4.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isClientWalletConnected = isClientWalletConnected;
    function isRpcWalletConnected() {
        const wallet = getRpcWallet();
        return wallet === null || wallet === void 0 ? void 0 : wallet.isConnected;
    }
    exports.isRpcWalletConnected = isRpcWalletConnected;
    function getChainId() {
        const rpcWallet = getRpcWallet();
        return rpcWallet === null || rpcWallet === void 0 ? void 0 : rpcWallet.chainId;
    }
    exports.getChainId = getChainId;
    function initRpcWallet(defaultChainId) {
        if (exports.state.rpcWalletId) {
            return exports.state.rpcWalletId;
        }
        const clientWallet = eth_wallet_4.Wallet.getClientInstance();
        const networkList = Object.values(components_3.application.store.networkMap);
        const instanceId = clientWallet.initRpcWallet({
            networks: networkList,
            defaultChainId,
            infuraId: components_3.application.store.infuraId,
            multicalls: components_3.application.store.multicalls
        });
        exports.state.rpcWalletId = instanceId;
        if (clientWallet.address) {
            const rpcWallet = eth_wallet_4.Wallet.getRpcWalletInstance(instanceId);
            rpcWallet.address = clientWallet.address;
        }
        return instanceId;
    }
    exports.initRpcWallet = initRpcWallet;
    function getRpcWallet() {
        return eth_wallet_4.Wallet.getRpcWalletInstance(exports.state.rpcWalletId);
    }
    exports.getRpcWallet = getRpcWallet;
    function getClientWallet() {
        return eth_wallet_4.Wallet.getClientInstance();
    }
    exports.getClientWallet = getClientWallet;
});
define("@scom/scom-buyback/store/index.ts", ["require", "exports", "@scom/scom-buyback/assets.ts", "@scom/scom-buyback/store/utils.ts"], function (require, exports, assets_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fallBackUrl = void 0;
    exports.fallBackUrl = assets_1.default.fullPath('img/token-placeholder.svg');
    __exportStar(utils_1, exports);
});
define("@scom/scom-buyback/buyback-utils/index.ts", ["require", "exports", "@scom/scom-buyback/global/index.ts", "@ijstech/eth-wallet", "@scom/scom-buyback/store/index.ts", "@scom/oswap-openswap-contract", "@scom/scom-token-list"], function (require, exports, index_4, eth_wallet_5, index_5, oswap_openswap_contract_2, scom_token_list_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getGuaranteedBuyBackInfo = exports.getGroupQueueExecuteData = exports.getPair = void 0;
    const getAddressByKey = (key) => {
        let Address = (0, index_5.getAddresses)((0, index_5.getChainId)());
        return Address[key];
    };
    const mapTokenObjectSet = (obj) => {
        var _a;
        let chainId = (0, index_5.getChainId)();
        const WETH9 = (0, index_5.getWETH)(chainId);
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (!((_a = obj[key]) === null || _a === void 0 ? void 0 : _a.address))
                    obj[key] = WETH9;
            }
        }
        return obj;
    };
    const getTokenObjectByAddress = (address) => {
        let chainId = (0, index_5.getChainId)();
        if (address.toLowerCase() === getAddressByKey('WETH9').toLowerCase()) {
            return (0, index_5.getWETH)(chainId);
        }
        let tokenMap = scom_token_list_2.tokenStore.tokenMap;
        return tokenMap[address.toLowerCase()];
    };
    const getFactoryAddress = (queueType) => {
        switch (queueType) {
            case index_4.QueueType.PRIORITY_QUEUE:
                return getAddressByKey("OSWAP_OracleFactory");
            case index_4.QueueType.RANGE_QUEUE:
                return getAddressByKey("OSWAP_RangeFactory");
            case index_4.QueueType.PEGGED_QUEUE:
                return getAddressByKey("OSWAP_PeggedOracleFactory");
            case index_4.QueueType.GROUP_QUEUE:
                return getAddressByKey("OSWAP_RestrictedFactory");
        }
    };
    const getTradeFee = (queueType) => {
        switch (queueType) {
            case index_4.QueueType.PRIORITY_QUEUE:
            case index_4.QueueType.RANGE_QUEUE:
            case index_4.QueueType.GROUP_QUEUE:
                return { fee: "1", base: "1000" };
            case index_4.QueueType.PEGGED_QUEUE:
                return { fee: "1", base: "1000" };
        }
    };
    const getPair = async (queueType, tokenA, tokenB) => {
        const wallet = (0, index_5.getRpcWallet)();
        let tokens = mapTokenObjectSet({ tokenA, tokenB });
        let params = { param1: tokens.tokenA.address, param2: tokens.tokenB.address };
        let factoryAddress = getFactoryAddress(queueType);
        switch (queueType) {
            case index_4.QueueType.PEGGED_QUEUE:
            case index_4.QueueType.PRIORITY_QUEUE:
                let priorityQ = new oswap_openswap_contract_2.Contracts.OSWAP_OracleFactory(wallet, factoryAddress);
                return await priorityQ.getPair(params);
            case index_4.QueueType.RANGE_QUEUE:
                let rangeQ = new oswap_openswap_contract_2.Contracts.OSWAP_RangeFactory(wallet, factoryAddress);
                return await rangeQ.getPair(params);
            case index_4.QueueType.GROUP_QUEUE:
                let groupQ = new oswap_openswap_contract_2.Contracts.OSWAP_RestrictedFactory(wallet, factoryAddress);
                return await groupQ.getPair(Object.assign(Object.assign({}, params), { param3: 0 }));
        }
    };
    exports.getPair = getPair;
    /*
    interface GroupQueueOffer {
      pairAddress: string,
      tokenIn: string,
      tokenOut: string,
      index: BigNumber,
      provider: string,
      amount: BigNumber,
      allocation: BigNumber,
      tokenInAvailable: string,
      price: BigNumber,
      start: number,
      expire: number,
      allowAll: boolean,
      locked: boolean,
      tradeFee: string,
    }
    interface GroupQueueOfferDetail extends GroupQueueOffer {
      amountIn:string,
      amountOut:string,
    }
    
    async function getGroupQueueOffer(pairAddress: string, tokenIn: ITokenObject, tokenOut: ITokenObject, offerIndex: number|BigNumber):Promise<GroupQueueOffer> {
      let wallet = Wallet.getClientInstance();
      let chainId = wallet.chainId;
    
      var direction = new BigNumber(tokenIn.address.toLowerCase()).lt(tokenOut.address.toLowerCase());
      const pairContract = new Contracts.OSWAP_RestrictedPair(wallet, pairAddress);
      try {
        let traderOffer = await pairContract.offers({param1:direction, param2:offerIndex});
        //assuming if allowAll, allocation for anyone is 0
        let allocation = new BigNumber("0");
        if (!traderOffer.allowAll) allocation = await pairContract.traderAllocation({ param1: direction, param2: offerIndex, param3: wallet.address });
        let tokenOutAvailable = (!traderOffer.allowAll && traderOffer.amount.gt(allocation))? allocation : traderOffer.amount
        
        let tradeFeeObj = getTradeFee(QueueType.GROUP_QUEUE);
        let tradeFee = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
        let tokenInAvailable = tokenOutAvailable.dividedBy(traderOffer.restrictedPrice).shiftedBy(18 - tokenOut.decimals).dividedBy(new BigNumber(tradeFee)).decimalPlaces(tokenIn.decimals, 1).toFixed();
        const WETH9Address = getAddressByKey('WETH9');
        const isTokenInNative =  tokenIn.address.toLowerCase() == WETH9Address.toLowerCase();
        const isTokenOutNative = tokenOut.address.toLowerCase() == WETH9Address.toLowerCase();
        const nativeToken = getChainNativeToken(chainId);
      
        return {
          pairAddress,
          tokenIn: isTokenInNative ? nativeToken.symbol : tokenIn.address,
          tokenOut: isTokenOutNative ? nativeToken.symbol : tokenOut.address,
          index: new BigNumber(offerIndex),
          provider: traderOffer.provider,
          amount: traderOffer.amount,
          allocation, //will be 0 if allowAll
          tokenInAvailable,
          price: traderOffer.restrictedPrice,
          start: traderOffer.startDate.shiftedBy(3).toNumber(),
          expire: traderOffer.expire.shiftedBy(3).toNumber(),
          allowAll: traderOffer.allowAll,
          locked: traderOffer.locked,
          tradeFee
        }
      } catch (error) { // most likely error in pairContract.offers
        return null;
      }
    }
    */
    const getGroupQueueExecuteData = (offerIndex) => {
        let indexArr = [offerIndex];
        let ratioArr = [(0, index_4.toWeiInv)('1')];
        let data = "0x" + (0, index_4.numberToBytes32)((indexArr.length * 2 + 1) * 32) + (0, index_4.numberToBytes32)(indexArr.length) + indexArr.map(e => (0, index_4.numberToBytes32)(e)).join('') + ratioArr.map(e => (0, index_4.numberToBytes32)(e)).join('');
        return data;
    };
    exports.getGroupQueueExecuteData = getGroupQueueExecuteData;
    const getGuaranteedBuyBackInfo = async (buybackCampaign) => {
        var _a, _b;
        let info = buybackCampaign;
        let allInfo;
        if (!info)
            return null;
        info.tokenIn = ((_a = info.tokenIn) === null || _a === void 0 ? void 0 : _a.startsWith('0x')) ? info.tokenIn.toLowerCase() : info.tokenIn;
        info.tokenOut = ((_b = info.tokenOut) === null || _b === void 0 ? void 0 : _b.startsWith('0x')) ? info.tokenOut.toLowerCase() : info.tokenOut;
        if (!info.pairAddress) {
            info.pairAddress = await getPair(index_4.QueueType.GROUP_QUEUE, getTokenObjectByAddress(info.tokenIn), getTokenObjectByAddress(info.tokenOut));
        }
        const queueInfo = await getProviderGroupQueueInfoByIndex(info.pairAddress, info.tokenIn, info.offerIndex);
        queueInfo.offerPrice = new eth_wallet_5.BigNumber(queueInfo.offerPrice).shiftedBy(getTokenObjectByAddress(info.tokenIn).decimals - getTokenObjectByAddress(info.tokenOut).decimals).toFixed();
        allInfo = Object.assign(Object.assign({}, info), { queueInfo });
        return allInfo;
    };
    exports.getGuaranteedBuyBackInfo = getGuaranteedBuyBackInfo;
    const getProviderGroupQueueInfoByIndex = async (pairAddress, tokenInAddress, offerIndex) => {
        let wallet = (0, index_5.getRpcWallet)();
        let chainId = (0, index_5.getChainId)();
        const nativeToken = (0, index_5.getChainNativeToken)(chainId);
        const WETH9Address = getAddressByKey('WETH9');
        const oracleContract = new oswap_openswap_contract_2.Contracts.OSWAP_RestrictedPair(wallet, pairAddress);
        let [token0Address, token1Address] = await Promise.all([oracleContract.token0(), oracleContract.token1()]);
        let direction;
        let tokenOut;
        let tokenIn;
        tokenInAddress = tokenInAddress.toLowerCase();
        token0Address = token0Address.toLowerCase();
        token1Address = token1Address.toLowerCase();
        if (token0Address == tokenInAddress) {
            direction = !(new eth_wallet_5.BigNumber(token0Address).lt(token1Address));
            tokenIn = getTokenObjectByAddress(token0Address);
            tokenOut = getTokenObjectByAddress(token1Address);
        }
        else {
            direction = new eth_wallet_5.BigNumber(token0Address).lt(token1Address);
            tokenIn = getTokenObjectByAddress(token1Address);
            tokenOut = getTokenObjectByAddress(token0Address);
        }
        let totalAllocation = new eth_wallet_5.BigNumber('0');
        let [offer, addresses] = await Promise.all([
            oracleContract.offers({ param1: direction, param2: offerIndex }),
            getTradersAllocation(oracleContract, direction, offerIndex, Number(tokenIn.decimals), (address, allocation) => {
                totalAllocation = totalAllocation.plus(allocation);
            })
        ]);
        let price = (0, index_4.toWeiInv)(offer.restrictedPrice.shiftedBy(-tokenOut.decimals).toFixed()).shiftedBy(-tokenIn.decimals).toFixed();
        let amount = new eth_wallet_5.BigNumber(offer.amount).shiftedBy(-Number(tokenIn.decimals)).toFixed();
        let userAllo = addresses.find(v => v.address === wallet.address) || { address: wallet.address, allocation: "0" };
        let available = offer.allowAll ? amount : new eth_wallet_5.BigNumber(userAllo.allocation).shiftedBy(-Number(tokenIn.decimals)).toFixed();
        let tradeFeeObj = getTradeFee(index_4.QueueType.GROUP_QUEUE);
        let tradeFee = new eth_wallet_5.BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
        let tokenInAvailable = new eth_wallet_5.BigNumber(available).dividedBy(new eth_wallet_5.BigNumber(price)).dividedBy(new eth_wallet_5.BigNumber(tradeFee)).toFixed();
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
            addresses,
            allocation: totalAllocation.toFixed(),
            willGet: offer.amount.times(new eth_wallet_5.BigNumber(price)).shiftedBy(-Number(tokenIn.decimals)).toFixed(),
            tradeFee,
            tokenInAvailable,
            available
        };
    };
    async function getTradersAllocation(pair, direction, offerIndex, allocationTokenDecimals, callbackPerRecord) {
        let traderLength = (await pair.getApprovedTraderLength({ direction, offerIndex })).toNumber();
        let tasks = [];
        let allo = [];
        for (let i = 0; i < traderLength; i += 100) { //get trader allocation
            tasks.push((async () => {
                try {
                    let approvedTrader = await pair.getApprovedTrader({ direction, offerIndex, start: i, length: 100 });
                    allo.push(...approvedTrader.trader.map((address, i) => {
                        let allocation = new eth_wallet_5.BigNumber(approvedTrader.allocation[i]).shiftedBy(-allocationTokenDecimals).toFixed();
                        if (callbackPerRecord)
                            callbackPerRecord(address, allocation);
                        return { address, allocation };
                    }));
                }
                catch (error) {
                    console.log("getTradersAllocation", error);
                    return;
                }
            })());
        }
        await Promise.all(tasks);
        return allo;
    }
});
define("@scom/scom-buyback/swap-utils/index.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/oswap-openswap-contract", "@scom/scom-commission-proxy-contract", "@scom/scom-buyback/global/index.ts", "@scom/scom-buyback/store/index.ts", "@scom/scom-buyback/buyback-utils/index.ts"], function (require, exports, eth_wallet_6, oswap_openswap_contract_3, scom_commission_proxy_contract_1, index_6, index_7, index_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setApprovalModalSpenderAddress = exports.getApprovalModelAction = exports.getHybridRouterAddress = exports.executeSwap = void 0;
    const getHybridRouterAddress = () => {
        let Address = (0, index_7.getAddresses)();
        return Address['OSWAP_HybridRouter2'];
    };
    exports.getHybridRouterAddress = getHybridRouterAddress;
    const calculateAmountInByTradeFee = (tradeFeeMap, pairInfo, amountOut) => {
        let tradeFeeObj = tradeFeeMap[pairInfo.market];
        let feeMultiplier = new eth_wallet_6.BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee);
        if (pairInfo.reserveB.lte(amountOut)) {
            return null;
        }
        let amtIn = new eth_wallet_6.BigNumber(pairInfo.reserveA).times(amountOut).times(tradeFeeObj.base).idiv(new eth_wallet_6.BigNumber(pairInfo.reserveB.minus(amountOut)).times(feeMultiplier)).plus(1).toFixed();
        return amtIn;
    };
    const getPathsByTokenIn = (tradeFeeMap, pairInfoList, routeObj, tokenIn) => {
        let routeObjList = [];
        let listItems = pairInfoList.filter(v => v.tokenOut.address == routeObj.route[routeObj.route.length - 1].address && routeObj.route.every((n) => n.address != v.tokenIn.address));
        let getNewAmmRouteObj = (pairInfo, routeObj, amountOut) => {
            let amtIn = calculateAmountInByTradeFee(tradeFeeMap, pairInfo, amountOut);
            if (!amtIn)
                return null;
            let newRouteObj = {
                pairs: [...routeObj.pairs, pairInfo.pair],
                market: [...routeObj.market, pairInfo.market],
                customDataList: [...routeObj.customDataList, {
                        reserveA: pairInfo.reserveA,
                        reserveB: pairInfo.reserveB
                    }],
                route: [...routeObj.route, pairInfo.tokenIn],
                amounts: [...routeObj.amounts, amtIn]
            };
            return newRouteObj;
        };
        let getNewQueueRouteObj = (pairInfo, routeObj, amountOut) => {
            let tradeFeeObj = tradeFeeMap[pairInfo.market];
            let tradeFeeFactor = new eth_wallet_6.BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
            let amtIn = new eth_wallet_6.BigNumber(amountOut).shiftedBy(18 - Number(pairInfo.tokenOut.decimals)).div(pairInfo.priceSwap).shiftedBy(pairInfo.tokenIn.decimals).div(tradeFeeFactor).toFixed();
            let sufficientLiquidity = new eth_wallet_6.BigNumber(pairInfo.totalLiquidity).gt(amountOut);
            if (!sufficientLiquidity)
                return null;
            let newRouteObj = {
                pairs: [...routeObj.pairs, pairInfo.pair],
                market: [...routeObj.market, pairInfo.market],
                customDataList: [...routeObj.customDataList, {
                        queueType: pairInfo.queueType,
                        price: pairInfo.price,
                        priceSwap: pairInfo.priceSwap
                    }],
                route: [...routeObj.route, pairInfo.tokenIn],
                amounts: [...routeObj.amounts, amtIn]
            };
            return newRouteObj;
        };
        for (let i = 0; i < listItems.length; i++) {
            let listItem = listItems[i];
            let lastAmtIn = routeObj.amounts[routeObj.amounts.length - 1];
            let newRouteObj = listItem.market == index_7.Market.MIXED_QUEUE ? getNewQueueRouteObj(listItem, routeObj, lastAmtIn) : getNewAmmRouteObj(listItem, routeObj, lastAmtIn);
            if (!newRouteObj)
                continue;
            if (listItem.tokenIn.address == tokenIn.address) {
                routeObjList.push(newRouteObj);
                break;
            }
            else {
                if (newRouteObj.route.length >= 4)
                    continue;
                let childPaths = getPathsByTokenIn(tradeFeeMap, pairInfoList, Object.assign({}, newRouteObj), tokenIn);
                routeObjList.push(...childPaths);
            }
        }
        return routeObjList;
    };
    const hybridTradeExactIn = async (wallet, path, pairs, amountIn, amountOutMin, toAddress, deadline, feeOnTransfer, data, commissions) => {
        if (path.length < 2) {
            return null;
        }
        let tokenIn = path[0];
        let tokenOut = path[path.length - 1];
        const hybridRouterAddress = getHybridRouterAddress();
        const hybridRouter = new oswap_openswap_contract_3.Contracts.OSWAP_HybridRouter2(wallet, hybridRouterAddress);
        const proxyAddress = (0, index_7.getProxyAddress)();
        const proxy = new scom_commission_proxy_contract_1.Contracts.Proxy(wallet, proxyAddress);
        const amount = tokenIn.address ? eth_wallet_6.Utils.toDecimals(amountIn.toString(), tokenIn.decimals).dp(0) : eth_wallet_6.Utils.toDecimals(amountIn.toString()).dp(0);
        const _amountOutMin = eth_wallet_6.Utils.toDecimals(amountOutMin, tokenOut.decimals).dp(0);
        const _commissions = (commissions || []).filter(v => v.chainId == (0, index_7.getChainId)()).map(v => {
            return {
                to: v.walletAddress,
                amount: amount.times(v.share).dp(0)
            };
        });
        const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)).dp(0) : new eth_wallet_6.BigNumber(0);
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
                            token: eth_wallet_6.Utils.nullAddress,
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
    const executeSwap = async (swapData) => {
        let receipt = null;
        const wallet = eth_wallet_6.Wallet.getClientInstance();
        try {
            const toAddress = wallet.account.address;
            const slippageTolerance = (0, index_7.getSlippageTolerance)();
            const transactionDeadlineInMinutes = (0, index_7.getTransactionDeadline)();
            const transactionDeadline = Math.floor(Date.now() / 1000 + transactionDeadlineInMinutes * 60);
            if (swapData.provider === "RestrictedOracle") {
                const data = (0, index_8.getGroupQueueExecuteData)(swapData.groupQueueOfferIndex);
                if (!data)
                    return {
                        receipt: null,
                        error: { message: "No data from Group Queue Trader" },
                    };
                const amountOutMin = swapData.toAmount.times(1 - slippageTolerance / 100);
                receipt = await hybridTradeExactIn(wallet, swapData.routeTokens, swapData.pairs, swapData.fromAmount.toString(), amountOutMin.toString(), toAddress, transactionDeadline, false, data, swapData.commissions);
            }
        }
        catch (error) {
            return { receipt: null, error: error };
        }
        return { receipt, error: null };
    };
    exports.executeSwap = executeSwap;
    var approvalModel;
    const getApprovalModelAction = async (options) => {
        const approvalOptions = Object.assign(Object.assign({}, options), { spenderAddress: '' });
        approvalModel = new index_6.ERC20ApprovalModel(approvalOptions);
        let approvalModelAction = approvalModel.getAction();
        return approvalModelAction;
    };
    exports.getApprovalModelAction = getApprovalModelAction;
    const setApprovalModalSpenderAddress = (contractAddress) => {
        let spender;
        if (contractAddress) {
            spender = contractAddress;
        }
        else {
            spender = getHybridRouterAddress();
        }
        approvalModel.spenderAddress = spender;
    };
    exports.setApprovalModalSpenderAddress = setApprovalModalSpenderAddress;
});
define("@scom/scom-buyback/alert/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
    exports.default = components_4.Styles.style({
        textAlign: 'center',
        $nest: {
            'i-label > *': {
                fontSize: '.875rem'
            },
            '.modal': {
                minWidth: '25%',
                maxWidth: '100%',
                width: 455,
                background: Theme.background.modal,
                borderRadius: 12
            },
            '.i-modal-close svg': {
                fill: '#F05E61'
            },
            '.i-modal_content': {
                padding: '0 2.563rem 1.5rem'
            },
            '.i-modal_header': {
                borderBottom: 'none !important'
            },
            '.waiting-txt > *': {
                color: '#F6C958',
                fontSize: '1.125rem'
            },
            '.confirm-txt > *': {
                color: '#C2C3CB'
            },
            '.red-link *': {
                color: '#FD4A4C',
                textDecoration: 'none'
            },
            '.mb-1': {
                marginBottom: '1rem'
            },
            'i-button': {
                padding: '1rem 2rem',
                textAlign: 'center'
            },
            '.btn-os': {
                background: 'transparent linear-gradient(90deg, #AC1D78 0%, #E04862 100%) 0% 0% no-repeat padding-box',
                fontFamily: 'Raleway Bold',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#fff'
                // color: Theme.colors.primary.contrastText
            }
        }
    });
});
define("@scom/scom-buyback/alert/index.tsx", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-buyback/global/index.ts", "@scom/scom-buyback/alert/index.css.ts", "@scom/scom-buyback/assets.ts"], function (require, exports, components_5, eth_wallet_7, index_9, index_css_1, assets_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_5.Styles.Theme.ThemeVars;
    ;
    let Alert = class Alert extends components_5.Module {
        get message() {
            return this._message;
        }
        set message(value) {
            this._message = value;
            this.renderUI();
        }
        constructor(parent, options) {
            super(parent, options);
        }
        ;
        async init() {
            this.classList.add(index_css_1.default);
            super.init();
        }
        closeModal() {
            this.confirmModal.visible = false;
        }
        showModal() {
            this.confirmModal.visible = true;
        }
        async buildLink() {
            if (this.message.txtHash) {
                const chainId = await eth_wallet_7.Wallet.getClientInstance().getChainId();
                (0, index_9.viewOnExplorerByTxHash)(chainId, this.message.txtHash);
            }
        }
        async renderUI() {
            this.mainContent.innerHTML = '';
            const mainSection = await components_5.VStack.create({
                horizontalAlignment: 'center'
            });
            if (this.message.status === 'warning') {
                mainSection.id = 'warningSection';
                const loading = (this.$render("i-panel", { height: 100 },
                    this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay", height: "100%", background: { color: 'transparent' } },
                        this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                            this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_2.default.fullPath('img/loading.svg'), width: 24, height: 24 } }),
                            this.$render("i-label", { caption: "Loading...", font: { color: '#FD4A4C' }, class: "i-loading-spinner_text" })))));
                mainSection.appendChild(loading);
                const section = new components_5.VStack();
                section.margin = { bottom: 20 };
                const captionList = ['Waiting For Confirmation', this.message.content || '', 'Confirm this transaction in your wallet'];
                const classList = ['waiting-txt mb-1', 'mb-1', 'confirm-txt'];
                for (let i = 0; i < captionList.length; i++) {
                    const caption = captionList[i];
                    const label = await components_5.Label.create();
                    label.caption = caption;
                    if (classList[i]) {
                        const classes = classList[i].split(' ');
                        classes.forEach(className => label.classList.add(className));
                    }
                    section.appendChild(label);
                }
                ;
                mainSection.appendChild(section);
            }
            else if (this.message.status === 'success') {
                const image = await components_5.Image.create({
                    width: '50px',
                    url: assets_2.default.fullPath('img/success-icon.svg'),
                    display: 'inline-block',
                    margin: { bottom: 16 }
                });
                mainSection.appendChild(image);
                const label = await components_5.Label.create();
                label.caption = 'Transaction Submitted';
                label.classList.add('waiting-txt');
                mainSection.appendChild(label);
                const contentSection = await components_5.Panel.create();
                contentSection.id = 'contentSection';
                mainSection.appendChild(contentSection);
                const contentLabel = await components_5.Label.create({
                    wordBreak: 'break-all'
                });
                contentLabel.caption = this.message.content || '';
                contentSection.appendChild(contentLabel);
                if (this.message.txtHash) {
                    const section = new components_5.VStack();
                    const label1 = await components_5.Label.create({
                        caption: this.message.txtHash.substr(0, 33),
                        margin: { bottom: 4 }
                    });
                    section.appendChild(label1);
                    const label2 = await components_5.Label.create({
                        caption: this.message.txtHash.substr(33, this.message.txtHash.length),
                        margin: { bottom: 16 }
                    });
                    section.appendChild(label2);
                    const link = await components_5.Label.create({
                        caption: 'View on block explorer',
                        display: 'block'
                    });
                    link.onClick = this.buildLink.bind(this);
                    link.classList.add('red-link', 'pointer');
                    section.appendChild(link);
                    contentSection.appendChild(section);
                }
                const button = new components_5.Button(mainSection, {
                    width: '100%',
                    caption: 'Close',
                    margin: { top: 16 },
                    // font: { color: Theme.colors.primary.contrastText }
                    font: { color: '#fff' }
                });
                button.classList.add('btn-os');
                button.onClick = () => this.closeModal();
                mainSection.appendChild(button);
            }
            else {
                const image = await components_5.Image.create({
                    width: '50px',
                    url: assets_2.default.fullPath('img/oswap_error.png'),
                    display: 'inline-block',
                    margin: { bottom: 16 }
                });
                mainSection.appendChild(image);
                const label = await components_5.Label.create({
                    caption: 'Transaction Rejected.',
                    margin: { bottom: 16 }
                });
                label.classList.add('waiting-txt');
                mainSection.appendChild(label);
                const section = await components_5.VStack.create();
                section.id = 'contentSection';
                const contentLabel = await components_5.Label.create({
                    caption: await this.onErrMsgChanged(),
                    margin: { bottom: 16 },
                    wordBreak: 'break-all'
                });
                section.appendChild(contentLabel);
                mainSection.appendChild(section);
                const button = new components_5.Button(mainSection, {
                    width: '100%',
                    caption: 'Cancel',
                    margin: { top: 16 },
                    // font: { color: Theme.colors.primary.contrastText }
                    font: { color: '#fff' }
                });
                button.classList.add('btn-os');
                button.onClick = () => this.closeModal();
                mainSection.appendChild(button);
            }
            this.mainContent.clearInnerHTML();
            this.mainContent.appendChild(mainSection);
        }
        async onErrMsgChanged() {
            if (this.message.status !== 'error')
                return this.message.content;
            if (this.message.content.message && this.message.content.message.includes('Internal JSON-RPC error.')) {
                this.message.content.message = JSON.parse(this.message.content.message.replace('Internal JSON-RPC error.\n', '')).message;
            }
            return await (0, index_9.parseContractError)(this.message.content.message, this.message.obj);
        }
        render() {
            return (this.$render("i-modal", { id: "confirmModal", closeIcon: { name: 'times' }, class: "confirm-modal", minHeight: "280px" },
                this.$render("i-panel", { id: "mainContent", class: "i-modal_content" })));
        }
    };
    Alert = __decorate([
        (0, components_5.customElements)('i-scom-buyback-alert')
    ], Alert);
    exports.default = Alert;
    ;
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
    };
});
define("@scom/scom-buyback/formSchema.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-buyback/formSchema.json.ts'/> 
    const theme = {
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
        },
        // buttonBackgroundColor: {
        // 	type: 'string',
        // 	format: 'color'
        // },
        // buttonFontColor: {
        // 	type: 'string',
        // 	format: 'color'
        // },
        secondaryColor: {
            type: 'string',
            title: 'Timer Background Color',
            format: 'color'
        },
        secondaryFontColor: {
            type: 'string',
            title: 'Timer Font Color',
            format: 'color'
        }
    };
    exports.default = {
        general: {
            dataSchema: {
                type: 'object',
                properties: {
                    chainId: {
                        type: 'number',
                        enum: [1, 56, 137, 250, 97, 80001, 43113, 43114],
                        required: true
                    },
                    projectName: {
                        type: 'string',
                        required: true
                    },
                    description: {
                        type: 'string'
                    },
                    offerIndex: {
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
                    detailUrl: {
                        type: 'string'
                    }
                }
            }
        },
        theme: {
            dataSchema: {
                type: 'object',
                properties: {
                    "dark": {
                        type: 'object',
                        properties: theme
                    },
                    "light": {
                        type: 'object',
                        properties: theme
                    }
                }
            }
        }
    };
});
define("@scom/scom-buyback/index.css.ts", ["require", "exports", "@ijstech/components", "@scom/scom-buyback/assets.ts"], function (require, exports, components_6, assets_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buybackComponent = exports.buybackDappContainer = void 0;
    const Theme = components_6.Styles.Theme.ThemeVars;
    const colorVar = {
        primaryButton: 'transparent linear-gradient(90deg, #AC1D78 0%, #E04862 100%) 0% 0% no-repeat padding-box',
        primaryGradient: 'linear-gradient(255deg,#f15e61,#b52082)',
        darkBg: '#181E3E 0% 0% no-repeat padding-box',
        primaryDisabled: 'transparent linear-gradient(270deg,#351f52,#552a42) 0% 0% no-repeat padding-box !important'
    };
    components_6.Styles.fontFace({
        fontFamily: "Montserrat Regular",
        src: `url("${assets_3.default.fullPath('fonts/montserrat/Montserrat-Regular.ttf')}") format("truetype")`,
        fontWeight: 'nomal',
        fontStyle: 'normal'
    });
    components_6.Styles.fontFace({
        fontFamily: "Raleway Bold",
        src: `url("${assets_3.default.fullPath('fonts/raleway/Raleway-Bold.ttf')}") format("truetype")`,
        fontWeight: 'bold',
        fontStyle: 'normal'
    });
    exports.buybackDappContainer = components_6.Styles.style({
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
    exports.buybackComponent = components_6.Styles.style({
        $nest: {
            'i-label': {
                fontFamily: 'Montserrat Regular',
            },
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
                fontFamily: 'Raleway Bold',
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
            '.opacity-50': {
                opacity: 0.5
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
                        fontSize: 14,
                        fontFamily: 'Montserrat Regular',
                    },
                    '.timer-unit': {
                        display: 'flex',
                        alignItems: 'center',
                    },
                },
            },
            '.input-amount > input': {
                border: 'none',
                width: '100% !important',
                height: '100% !important',
                backgroundColor: 'transparent',
                fontSize: '1rem',
                textAlign: 'right',
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
});
define("@scom/scom-buyback", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-buyback/global/index.ts", "@scom/scom-buyback/store/index.ts", "@scom/scom-buyback/buyback-utils/index.ts", "@scom/scom-buyback/swap-utils/index.ts", "@scom/scom-buyback/alert/index.tsx", "@scom/scom-buyback/assets.ts", "@scom/scom-buyback/data.json.ts", "@scom/scom-buyback/formSchema.json.ts", "@scom/scom-token-list", "@scom/scom-buyback/index.css.ts", "@ijstech/eth-contract"], function (require, exports, components_7, eth_wallet_8, index_10, index_11, index_12, index_13, index_14, assets_4, data_json_1, formSchema_json_1, scom_token_list_3, index_css_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_7.Styles.Theme.ThemeVars;
    let ScomBuyback = class ScomBuyback extends components_7.Module {
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        onHide() {
            this.dappContainer.onHide();
            const rpcWallet = (0, index_11.getRpcWallet)();
            for (let event of this.rpcWalletEvents) {
                rpcWallet.unregisterWalletEvent(event);
            }
            this.rpcWalletEvents = [];
            for (let event of this.clientEvents) {
                event.unregister();
            }
            this.clientEvents = [];
        }
        _getActions(category) {
            const self = this;
            const actions = [
            // {
            // 	name: 'Commissions',
            // 	icon: 'dollar-sign',
            // 	command: (builder: any, userInputData: any) => {
            // 		let _oldData: IBuybackCampaign = {
            // 			chainId: 0,
            // 			projectName: '',
            // 			offerIndex: 0,
            // 			tokenIn: '',
            // 			tokenOut: '',
            // 			wallets: [],
            // 			networks: []
            // 		}
            // 		return {
            // 			execute: async () => {
            // 				_oldData = { ...this._data };
            // 				if (userInputData.commissions) this._data.commissions = userInputData.commissions;
            // 				this.refreshWidget();
            // 				if (builder?.setData) builder.setData(this._data);
            // 			},
            // 			undo: () => {
            // 				this._data = { ..._oldData };
            // 				this.refreshWidget();
            // 				if (builder?.setData) builder.setData(this._data);
            // 			},
            // 			redo: () => { }
            // 		}
            // 	},
            // 	customUI: {
            // 		render: (data?: any, onConfirm?: (result: boolean, data: any) => void) => {
            // 			const vstack = new VStack();
            // 			const config = new ScomCommissionFeeSetup(null, {
            //         commissions: self._data.commissions,
            //         fee: getEmbedderCommissionFee(),
            //         networks: self._data.networks
            //       });
            //       const button = new Button(null, {
            //         caption: 'Confirm',
            //       });
            //       vstack.append(config);
            //       vstack.append(button);
            //       button.onClick = async () => {
            //         const commissions = config.commissions;
            //         if (onConfirm) onConfirm(true, {commissions});
            //       }
            //       return vstack;
            // 		}
            // 	}
            // },
            ];
            if (category && category !== 'offers') {
                actions.push({
                    name: 'Settings',
                    icon: 'cog',
                    command: (builder, userInputData) => {
                        let _oldData = {
                            chainId: 0,
                            projectName: '',
                            offerIndex: 0,
                            tokenIn: '',
                            tokenOut: '',
                            wallets: [],
                            networks: []
                        };
                        return {
                            execute: async () => {
                                _oldData = Object.assign({}, this._data);
                                this._data.chainId = userInputData.chainId;
                                this._data.projectName = userInputData.projectName;
                                this._data.description = userInputData.description;
                                this._data.offerIndex = userInputData.offerIndex;
                                this._data.tokenIn = userInputData.tokenIn;
                                this._data.tokenOut = userInputData.tokenOut;
                                this._data.detailUrl = userInputData.detailUrl;
                                this.refreshData(builder);
                            },
                            undo: async () => {
                                this._data = Object.assign({}, _oldData);
                                this.refreshData(builder);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: formSchema_json_1.default.general.dataSchema
                });
                actions.push({
                    name: 'Theme Settings',
                    icon: 'palette',
                    command: (builder, userInputData) => {
                        let oldTag = {};
                        return {
                            execute: async () => {
                                if (!userInputData)
                                    return;
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (builder)
                                    builder.setTag(userInputData);
                                else
                                    this.setTag(userInputData);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(userInputData);
                            },
                            undo: () => {
                                if (!userInputData)
                                    return;
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(userInputData);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: formSchema_json_1.default.theme.dataSchema
                });
            }
            return actions;
        }
        getConfigurators() {
            let self = this;
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: (category) => {
                        return this._getActions(category);
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData(Object.assign(Object.assign({}, defaultData), data));
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
                    setLinkParams: async (params) => {
                        if (params.data) {
                            const decodedString = window.atob(params.data);
                            const commissions = JSON.parse(decodedString);
                            let resultingData = Object.assign(Object.assign({}, self._data), { commissions });
                            await this.setData(resultingData);
                        }
                    },
                    bindOnChanged: (element, callback) => {
                        element.onChanged = async (data) => {
                            let resultingData = Object.assign(Object.assign({}, self._data), data);
                            await this.setData(resultingData);
                            await callback(data);
                        };
                    },
                    getData: async () => {
                        const fee = (0, index_11.getEmbedderCommissionFee)();
                        const data = await this.getData();
                        return Object.assign(Object.assign({}, data), { fee });
                    },
                    setData: this.setData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
        }
        async getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            const rpcWalletId = (0, index_11.initRpcWallet)(this.defaultChainId);
            const rpcWallet = (0, index_11.getRpcWallet)();
            const event = rpcWallet.registerWalletEvent(this, eth_wallet_8.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.refreshWidget();
            });
            this.rpcWalletEvents.push(event);
            this.refreshDappContainer();
            await this.refreshWidget();
        }
        async getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            var _a;
            this.tag[type] = (_a = this.tag[type]) !== null && _a !== void 0 ? _a : {};
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
            var _a, _b, _c, _d, _e, _f, _g;
            const themeVar = ((_a = this.dappContainer) === null || _a === void 0 ? void 0 : _a.theme) || 'light';
            this.updateStyle('--text-primary', (_b = this.tag[themeVar]) === null || _b === void 0 ? void 0 : _b.fontColor);
            this.updateStyle('--background-main', (_c = this.tag[themeVar]) === null || _c === void 0 ? void 0 : _c.backgroundColor);
            // this.updateStyle('--colors-primary-main', this.tag[themeVar]?.buttonBackgroundColor);
            // this.updateStyle('--colors-primary-contrast_text', this.tag[themeVar]?.buttonFontColor);
            this.updateStyle('--colors-secondary-main', (_d = this.tag[themeVar]) === null || _d === void 0 ? void 0 : _d.secondaryColor);
            this.updateStyle('--colors-secondary-contrast_text', (_e = this.tag[themeVar]) === null || _e === void 0 ? void 0 : _e.secondaryFontColor);
            this.updateStyle('--input-font_color', (_f = this.tag[themeVar]) === null || _f === void 0 ? void 0 : _f.inputFontColor);
            this.updateStyle('--input-background', (_g = this.tag[themeVar]) === null || _g === void 0 ? void 0 : _g.inputBackgroundColor);
        }
        get defaultChainId() {
            return this._data.defaultChainId;
        }
        set defaultChainId(value) {
            this._data.defaultChainId = value;
        }
        get wallets() {
            var _a;
            return (_a = this._data.wallets) !== null && _a !== void 0 ? _a : [];
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
            return networks !== null && networks !== void 0 ? networks : [];
        }
        set networks(value) {
            this._data.networks = value;
        }
        get showHeader() {
            var _a;
            return (_a = this._data.showHeader) !== null && _a !== void 0 ? _a : true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
        }
        get commissions() {
            var _a;
            return (_a = this._data.commissions) !== null && _a !== void 0 ? _a : [];
        }
        set commissions(value) {
            this._data.commissions = value;
        }
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                chainId: 0,
                projectName: '',
                offerIndex: 0,
                tokenIn: '',
                tokenOut: '',
                wallets: [],
                networks: []
            };
            this.tag = {};
            this.defaultEdit = true;
            this.rpcWalletEvents = [];
            this.clientEvents = [];
            this.registerEvent = () => {
                this.clientEvents.push(this.$eventBus.register(this, "chainChanged" /* EventId.chainChanged */, this.refreshWidget));
            };
            this.updateContractAddress = () => {
                const hasCommission = (0, index_11.getCurrentCommissions)(this.commissions).length;
                if (hasCommission) {
                    this.contractAddress = (0, index_11.getProxyAddress)();
                }
                else {
                    this.contractAddress = (0, index_13.getHybridRouterAddress)();
                }
                if (this.approvalModelAction) {
                    (0, index_13.setApprovalModalSpenderAddress)(this.contractAddress);
                    this.updateCommissionInfo();
                }
            };
            this.refreshData = (builder) => {
                this.refreshDappContainer();
                if (builder === null || builder === void 0 ? void 0 : builder.setData) {
                    builder.setData(this._data);
                }
                else {
                    this.refreshWidget();
                }
            };
            this.refreshDappContainer = () => {
                var _a;
                const rpcWallet = (0, index_11.getRpcWallet)();
                const containerData = {
                    defaultChainId: this._data.chainId || this.defaultChainId,
                    wallets: this.wallets,
                    networks: this.networks,
                    showHeader: this.showHeader,
                    rpcWalletId: rpcWallet.instanceId
                };
                if ((_a = this.dappContainer) === null || _a === void 0 ? void 0 : _a.setData)
                    this.dappContainer.setData(containerData);
            };
            this.refreshWidget = async () => {
                this.updateContractAddress();
                await this.initializeWidgetConfig();
            };
            this.initializeWidgetConfig = async (hideLoading) => {
                setTimeout(async () => {
                    var _a;
                    const rpcWallet = (0, index_11.getRpcWallet)();
                    if (!hideLoading && this.loadingElm) {
                        this.loadingElm.visible = true;
                    }
                    if (!(0, index_11.isClientWalletConnected)() || !this._data || this._data.chainId !== (0, index_11.getChainId)()) {
                        this.renderEmpty();
                        return;
                    }
                    try {
                        this.infoStack.visible = true;
                        this.emptyStack.visible = false;
                        const currentChainId = (0, index_11.getChainId)();
                        scom_token_list_3.tokenStore.updateTokenMapData(currentChainId);
                        if (rpcWallet.address) {
                            scom_token_list_3.tokenStore.updateAllTokenBalances(rpcWallet);
                        }
                        await eth_wallet_8.Wallet.getClientInstance().init();
                        this.buybackInfo = await (0, index_12.getGuaranteedBuyBackInfo)(Object.assign({}, this._data));
                        this.updateCommissionInfo();
                        await this.renderBuybackCampaign();
                        this.renderLeftPart();
                        const firstToken = this.getTokenObject('toTokenAddress');
                        if (firstToken && firstToken.symbol !== ((_a = scom_token_list_3.ChainNativeTokenByChainId[(0, index_11.getChainId)()]) === null || _a === void 0 ? void 0 : _a.symbol) && (0, index_11.isRpcWalletConnected)()) {
                            await this.initApprovalModelAction();
                        }
                    }
                    catch (_b) {
                        this.renderEmpty();
                    }
                    if (!hideLoading && this.loadingElm) {
                        this.loadingElm.visible = false;
                    }
                });
            };
            this.getFirstAvailableBalance = () => {
                const tokenBalances = scom_token_list_3.tokenStore.tokenBalances;
                if (!this.buybackInfo || this.isSellDisabled || !tokenBalances) {
                    return '0';
                }
                const { queueInfo } = this.buybackInfo;
                const { available, offerPrice, tradeFee, amount } = queueInfo;
                const tokenBalance = new eth_wallet_8.BigNumber(tokenBalances[this.getValueByKey('toTokenAddress')]);
                const balance = new eth_wallet_8.BigNumber(available).times(offerPrice).dividedBy(tradeFee);
                const amountIn = new eth_wallet_8.BigNumber(amount).times(offerPrice).dividedBy(tradeFee);
                return (eth_wallet_8.BigNumber.minimum(balance, tokenBalance, amountIn)).toFixed();
            };
            this.getSecondAvailableBalance = () => {
                if (!this.buybackInfo || !this.buybackInfo.queueInfo) {
                    return '0';
                }
                const { queueInfo } = this.buybackInfo;
                const { offerPrice, tradeFee } = queueInfo;
                return new eth_wallet_8.BigNumber(this.getFirstAvailableBalance()).dividedBy(offerPrice).times(tradeFee).toFixed();
            };
            this.getTokenObject = (key) => {
                const tokenMap = scom_token_list_3.tokenStore.tokenMap;
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
                var _a;
                if (!this.hStackCommission)
                    return;
                if ((0, index_11.getCurrentCommissions)(this.commissions).length) {
                    this.hStackCommission.visible = true;
                    const firstToken = this.getTokenObject('toTokenAddress');
                    const secondToken = this.getTokenObject('fromTokenAddress');
                    if (firstToken && secondToken) {
                        const amount = new eth_wallet_8.BigNumber(((_a = this.firstInput) === null || _a === void 0 ? void 0 : _a.value) || 0);
                        const commissionAmount = (0, index_11.getCommissionAmount)(this.commissions, amount);
                        this.lbCommissionFee.caption = `${(0, index_10.formatNumber)(commissionAmount, 6)} ${(firstToken === null || firstToken === void 0 ? void 0 : firstToken.symbol) || ''}`;
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
                (0, index_10.limitInputNumber)(this.firstInput, (firstToken === null || firstToken === void 0 ? void 0 : firstToken.decimals) || 18);
                if (!this.buybackInfo)
                    return;
                const info = this.buybackInfo.queueInfo || {};
                const { offerPrice, tradeFee } = info;
                const firstSymbol = (firstToken === null || firstToken === void 0 ? void 0 : firstToken.symbol) || '';
                const inputVal = new eth_wallet_8.BigNumber(this.firstInput.value).dividedBy(offerPrice).times(tradeFee);
                if (inputVal.isNaN()) {
                    this.lbFee.caption = `0 ${firstSymbol}`;
                    this.secondInput.value = '';
                }
                else {
                    this.lbFee.caption = `${(0, index_10.formatNumber)(new eth_wallet_8.BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstSymbol}`;
                    this.secondInput.value = (0, index_10.limitDecimals)(inputVal, (secondToken === null || secondToken === void 0 ? void 0 : secondToken.decimals) || 18);
                }
                this.updateCommissionInfo();
                this.updateBtnSwap();
            };
            this.secondInputChange = () => {
                const firstToken = this.getTokenObject('toTokenAddress');
                const secondToken = this.getTokenObject('fromTokenAddress');
                (0, index_10.limitInputNumber)(this.secondInput, (secondToken === null || secondToken === void 0 ? void 0 : secondToken.decimals) || 18);
                if (!this.buybackInfo)
                    return;
                const info = this.buybackInfo.queueInfo || {};
                const { offerPrice, tradeFee } = info;
                const firstSymbol = (firstToken === null || firstToken === void 0 ? void 0 : firstToken.symbol) || '';
                const inputVal = new eth_wallet_8.BigNumber(this.secondInput.value).multipliedBy(offerPrice).dividedBy(tradeFee);
                if (inputVal.isNaN()) {
                    this.firstInput.value = '';
                    this.lbFee.caption = `0 ${firstSymbol}`;
                }
                else {
                    this.firstInput.value = (0, index_10.limitDecimals)(inputVal, (firstToken === null || firstToken === void 0 ? void 0 : firstToken.decimals) || 18);
                    this.lbFee.caption = `${(0, index_10.formatNumber)(new eth_wallet_8.BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstSymbol}`;
                }
                this.updateCommissionInfo();
                this.updateBtnSwap();
            };
            this.updateBtnSwap = () => {
                if (!(0, index_11.isRpcWalletConnected)()) {
                    this.btnSwap.enabled = true;
                    return;
                }
                if (!this.buybackInfo)
                    return;
                if (this.isSellDisabled) {
                    this.btnSwap.enabled = false;
                    return;
                }
                const firstVal = new eth_wallet_8.BigNumber(this.firstInput.value);
                const secondVal = new eth_wallet_8.BigNumber(this.secondInput.value);
                const firstAvailable = this.getFirstAvailableBalance();
                const secondAvailable = this.getSecondAvailableBalance();
                const commissionAmount = (0, index_11.getCommissionAmount)(this.commissions, firstVal);
                const tokenBalances = scom_token_list_3.tokenStore.tokenBalances;
                const balance = new eth_wallet_8.BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
                const tradeFee = (this.buybackInfo.queueInfo || {}).tradeFee || '0';
                const fee = new eth_wallet_8.BigNumber(1).minus(tradeFee).times(this.firstInput.value);
                const total = firstVal.plus(commissionAmount).plus(fee);
                if (firstVal.isNaN() || firstVal.lte(0) || firstVal.gt(firstAvailable) || secondVal.isNaN() || secondVal.lte(0) || secondVal.gt(secondAvailable) || total.gt(balance)) {
                    this.btnSwap.enabled = false;
                }
                else {
                    this.btnSwap.enabled = true;
                }
                this.btnSwap.caption = this.submitButtonText;
            };
            this.onSwap = () => {
                if (!(0, index_11.isRpcWalletConnected)()) {
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
                var _a;
                if (!this.buybackInfo || !this.buybackInfo.queueInfo)
                    return;
                const firstToken = this.getTokenObject('toTokenAddress');
                const secondToken = this.getTokenObject('fromTokenAddress');
                const { pairAddress, offerIndex } = this.buybackInfo.queueInfo;
                const amount = new eth_wallet_8.BigNumber(((_a = this.firstInput) === null || _a === void 0 ? void 0 : _a.value) || 0);
                const commissionAmount = (0, index_11.getCommissionAmount)(this.commissions, amount);
                this.showResultMessage(this.buybackAlert, 'warning', `Swapping ${(0, index_10.formatNumber)(amount.plus(commissionAmount))} ${firstToken === null || firstToken === void 0 ? void 0 : firstToken.symbol} to ${(0, index_10.formatNumber)(this.secondInput.value)} ${secondToken === null || secondToken === void 0 ? void 0 : secondToken.symbol}`);
                const params = {
                    provider: "RestrictedOracle",
                    queueType: index_10.QueueType.GROUP_QUEUE,
                    routeTokens: [firstToken, secondToken],
                    bestSmartRoute: [firstToken, secondToken],
                    pairs: [pairAddress],
                    fromAmount: new eth_wallet_8.BigNumber(this.firstInput.value),
                    toAmount: new eth_wallet_8.BigNumber(this.secondInput.value),
                    isFromEstimated: false,
                    groupQueueOfferIndex: offerIndex,
                    commissions: this.commissions
                };
                const { error } = await (0, index_13.executeSwap)(params);
                if (error) {
                    this.showResultMessage(this.buybackAlert, 'error', error);
                }
            };
            this.updateInput = (enabled) => {
                this.firstInput.enabled = enabled;
                this.secondInput.enabled = enabled;
            };
            this.initApprovalModelAction = async () => {
                if (!(0, index_11.isRpcWalletConnected)())
                    return;
                this.approvalModelAction = await (0, index_13.getApprovalModelAction)({
                    sender: this,
                    payAction: this.onSubmit,
                    onToBeApproved: async (token) => {
                        this.isApproveButtonShown = true;
                        this.btnSwap.enabled = true;
                        this.btnSwap.caption = (0, index_11.isRpcWalletConnected)() ? 'Approve' : 'Switch Network';
                    },
                    onToBePaid: async (token) => {
                        this.updateBtnSwap();
                        this.btnSwap.caption = this.submitButtonText;
                        this.isApproveButtonShown = false;
                    },
                    onApproving: async (token, receipt, data) => {
                        this.showResultMessage(this.buybackAlert, 'success', receipt || '');
                        this.btnSwap.rightIcon.visible = true;
                        this.btnSwap.caption = 'Approving';
                        this.updateInput(false);
                    },
                    onApproved: async (token, data) => {
                        this.isApproveButtonShown = false;
                        this.btnSwap.rightIcon.visible = false;
                        this.btnSwap.caption = this.submitButtonText;
                        this.updateInput(true);
                        this.updateBtnSwap();
                    },
                    onApprovingError: async (token, err) => {
                        this.showResultMessage(this.buybackAlert, 'error', err);
                        this.updateInput(true);
                        this.btnSwap.caption = 'Approve';
                        this.btnSwap.rightIcon.visible = false;
                    },
                    onPaying: async (receipt, data) => {
                        this.showResultMessage(this.buybackAlert, 'success', receipt || '');
                        this.btnSwap.rightIcon.visible = true;
                        this.btnSwap.caption = this.submitButtonText;
                        this.updateInput(false);
                    },
                    onPaid: async (data) => {
                        await this.initializeWidgetConfig(true);
                        this.firstInput.value = '';
                        this.secondInput.value = '';
                        this.btnSwap.rightIcon.visible = false;
                        this.btnSwap.caption = this.submitButtonText;
                    },
                    onPayingError: async (err) => {
                        this.showResultMessage(this.buybackAlert, 'error', err);
                        this.btnSwap.rightIcon.visible = false;
                        this.btnSwap.enabled = true;
                        this.btnSwap.caption = this.submitButtonText;
                    }
                });
                (0, index_13.setApprovalModalSpenderAddress)(this.contractAddress);
                const firstToken = this.getTokenObject('toTokenAddress');
                await this.approvalModelAction.checkAllowance(firstToken, this.getFirstAvailableBalance());
            };
            this.getValueByKey = (key) => {
                const item = this.buybackInfo;
                if (!item)
                    return null;
                if (item.queueInfo) {
                    return item.queueInfo[key];
                }
                return null;
            };
            this.showResultMessage = (alert, status, content) => {
                if (!alert)
                    return;
                let params = { status };
                if (status === 'success') {
                    params.txtHash = content;
                }
                else {
                    params.content = content;
                }
                alert.message = Object.assign({}, params);
                alert.showModal();
            };
            this.connectWallet = async () => {
                if (!(0, index_11.isClientWalletConnected)()) {
                    if (this.mdWallet) {
                        await components_7.application.loadPackage('@scom/scom-wallet-modal', '*');
                        this.mdWallet.networks = this.networks;
                        this.mdWallet.wallets = this.wallets;
                        this.mdWallet.showModal();
                    }
                    return;
                }
                if (!(0, index_11.isRpcWalletConnected)()) {
                    const chainId = (0, index_11.getChainId)();
                    const clientWallet = eth_wallet_8.Wallet.getClientInstance();
                    await clientWallet.switchNetwork(chainId);
                }
            };
            this.initEmptyUI = async () => {
                if (!this.noCampaignSection) {
                    this.noCampaignSection = await components_7.Panel.create({ width: '100%', height: '100%' });
                }
                const isClientConnected = (0, index_11.isClientWalletConnected)();
                this.noCampaignSection.clearInnerHTML();
                this.noCampaignSection.appendChild(this.$render("i-vstack", { class: "no-buyback", height: "100%", background: { color: Theme.background.main }, verticalAlignment: "center" },
                    this.$render("i-vstack", { gap: 10, verticalAlignment: "center", horizontalAlignment: "center" },
                        this.$render("i-image", { url: assets_4.default.fullPath('img/TrollTrooper.svg') }),
                        this.$render("i-label", { caption: isClientConnected ? 'No Buybacks' : 'Please connect with your wallet!' })),
                    !isClientConnected ? this.$render("i-button", { caption: "Connect Wallet", class: "btn-os", minHeight: 43, width: 300, maxWidth: "90%", margin: { top: 10, left: 'auto', right: 'auto' }, onClick: this.connectWallet }) : []));
                this.noCampaignSection.visible = true;
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
                var _a, _b;
                if (this.buybackInfo) {
                    this.buybackElm.clearInnerHTML();
                    const { queueInfo, pairAddress } = this.buybackInfo;
                    const info = queueInfo || {};
                    const { startDate, endDate } = info;
                    const firstTokenObj = scom_token_list_3.tokenStore.tokenMap[this.getValueByKey('toTokenAddress')];
                    const secondTokenObj = scom_token_list_3.tokenStore.tokenMap[this.getValueByKey('fromTokenAddress')];
                    const firstSymbol = (_a = firstTokenObj === null || firstTokenObj === void 0 ? void 0 : firstTokenObj.symbol) !== null && _a !== void 0 ? _a : '';
                    const secondSymbol = (_b = secondTokenObj === null || secondTokenObj === void 0 ? void 0 : secondTokenObj.symbol) !== null && _b !== void 0 ? _b : '';
                    // const optionTimer = { background: { color: Theme.colors.secondary.main }, font: { color: Theme.colors.secondary.contrastText } };
                    // const vStackTimer = await VStack.create({ gap: 4, verticalAlignment: 'center' });
                    // const lbTimer = await Label.create({ caption: 'Starts In: ', font: { size: '12px' } });
                    // const endHour = await Label.create(optionTimer);
                    // const endDay = await Label.create(optionTimer);
                    // const endMin = await Label.create(optionTimer);
                    // endHour.classList.add('timer-value');
                    // endDay.classList.add('timer-value');
                    // endMin.classList.add('timer-value');
                    // vStackTimer.appendChild(lbTimer);
                    // vStackTimer.appendChild(
                    // 	<i-vstack>
                    // 		<i-hstack gap={4} verticalAlignment="center" class="custom-timer">
                    // 			{endDay}
                    // 			<i-label caption="D" class="timer-unit" />
                    // 			{endHour}
                    // 			<i-label caption="H" class="timer-unit" />
                    // 			{endMin}
                    // 			<i-label caption="M" class="timer-unit" />
                    // 		</i-hstack>
                    // 	</i-vstack>
                    // );
                    const vStackEndTime = await components_7.HStack.create({ gap: 4, verticalAlignment: 'center', margin: { top: '0.75rem' } });
                    const lbEndTime = await components_7.Label.create({ caption: 'Estimated End Time: ', font: { size: '0.875rem', bold: true } });
                    vStackEndTime.appendChild(lbEndTime);
                    vStackEndTime.appendChild(this.$render("i-label", { caption: (0, index_10.formatDate)(endDate), font: { size: '0.875rem' } }));
                    // let interval: any;
                    // const setTimer = () => {
                    // 	let days = 0;
                    // 	let hours = 0;
                    // 	let mins = 0;
                    // 	if (moment().isBefore(moment(startDate))) {
                    // 		lbTimer.caption = 'Starts In: ';
                    // 		lbEndTime.caption = 'Estimated End Time: ';
                    // 		days = moment(startDate).diff(moment(), 'days');
                    // 		hours = moment(startDate).diff(moment(), 'hours') - days * 24;
                    // 		mins = moment(startDate).diff(moment(), 'minutes') - days * 24 * 60 - hours * 60;
                    // 	} else if (moment(moment()).isBefore(endDate)) {
                    // 		lbTimer.caption = 'Ends In';
                    // 		vStackEndTime.visible = false;
                    // 		days = moment(endDate).diff(moment(), 'days');
                    // 		hours = moment(endDate).diff(moment(), 'hours') - days * 24;
                    // 		mins = moment(endDate).diff(moment(), 'minutes') - days * 24 * 60 - hours * 60;
                    // 	} else {
                    // 		vStackTimer.visible = false;
                    // 		vStackEndTime.visible = true;
                    // 		lbEndTime.caption = 'Ended On: ';
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
                    const commissionFee = (0, index_11.getEmbedderCommissionFee)();
                    const hasCommission = !!(0, index_11.getCurrentCommissions)(this.commissions).length;
                    this.buybackElm.clearInnerHTML();
                    this.buybackElm.appendChild(this.$render("i-panel", { padding: { bottom: 15, top: 15, right: 15, left: 15 }, height: "auto" },
                        this.$render("i-vstack", { gap: "0.5rem", width: "100%", verticalAlignment: "center", margin: { bottom: '1rem' } },
                            this.$render("i-vstack", null,
                                this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                                    this.$render("i-label", { caption: "Buyback Price: ", font: { bold: true } }),
                                    this.$render("i-label", { caption: `${1 / this.getValueByKey('offerPrice')} ${secondSymbol}`, font: { bold: true } })),
                                this.$render("i-label", { caption: "I don't have a digital wallet", font: { size: '0.8125rem' }, link: { href: 'https://metamask.io/' } })),
                            vStackEndTime),
                        this.$render("i-hstack", { gap: 20, margin: { top: 15 }, verticalAlignment: "center" },
                            this.$render("i-vstack", { gap: 4, width: "100%", verticalAlignment: "space-between" },
                                this.$render("i-hstack", { gap: 4, horizontalAlignment: "end" },
                                    this.$render("i-label", { id: "lbBalance", caption: `Balance Available: ${(0, index_10.formatNumber)(this.getFirstAvailableBalance())} ${firstSymbol}`, font: { size: '0.75rem' } })),
                                this.$render("i-hstack", { id: "firstInputBox", gap: 8, width: "100%", height: 50, verticalAlignment: "center", background: { color: Theme.input.background }, border: { radius: 5, width: 2, style: 'solid', color: 'transparent' }, padding: { left: 7, right: 7 } },
                                    this.$render("i-hstack", { gap: 4, width: 100, verticalAlignment: "center" },
                                        this.$render("i-image", { width: 20, height: 20, url: scom_token_list_3.assets.tokenPath(firstTokenObj, (0, index_11.getChainId)()), fallbackUrl: index_11.fallBackUrl }),
                                        this.$render("i-label", { caption: firstSymbol, font: { color: Theme.input.fontColor } })),
                                    this.$render("i-input", { id: "firstInput", inputType: "number", placeholder: "0.0", class: "input-amount", width: "100%", height: "100%", onChanged: this.firstInputChange, onFocus: () => this.handleFocusInput(true, true), onBlur: () => this.handleFocusInput(true, false) })),
                                this.$render("i-hstack", { id: "secondInputBox", visible: false, width: "100%", height: 40, position: "relative", verticalAlignment: "center", background: { color: Theme.input.background }, border: { radius: 5, width: 2, style: 'solid', color: 'transparent' }, padding: { left: 7, right: 7 } },
                                    this.$render("i-hstack", { gap: 4, margin: { right: 8 }, width: 100, verticalAlignment: "center" },
                                        this.$render("i-image", { width: 20, height: 20, url: scom_token_list_3.assets.tokenPath(secondTokenObj, (0, index_11.getChainId)()), fallbackUrl: index_11.fallBackUrl }),
                                        this.$render("i-label", { caption: secondSymbol, font: { color: Theme.input.fontColor } })),
                                    this.$render("i-input", { id: "secondInput", inputType: "number", placeholder: "0.0", class: "input-amount", width: "100%", height: "100%", onChanged: this.secondInputChange, onFocus: () => this.handleFocusInput(false, true), onBlur: () => this.handleFocusInput(false, false) })))),
                        this.$render("i-hstack", { gap: 10, margin: { top: 6 }, verticalAlignment: "center", horizontalAlignment: "space-between" },
                            this.$render("i-label", { caption: "Trade Fee", font: { size: '0.75rem' } }),
                            this.$render("i-label", { id: "lbFee", caption: `0 ${firstSymbol}`, font: { size: '0.75rem' } })),
                        this.$render("i-hstack", { id: "hStackCommission", visible: hasCommission, gap: 10, margin: { top: 6 }, verticalAlignment: "center", horizontalAlignment: "space-between" },
                            this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                                this.$render("i-label", { caption: "Commission Fee", font: { size: '0.75rem' } }),
                                this.$render("i-icon", { tooltip: { content: `A commission fee of ${new eth_wallet_8.BigNumber(commissionFee).times(100)}% will be applied to the amount you input.` }, name: "question-circle", width: 14, height: 14 })),
                            this.$render("i-label", { id: "lbCommissionFee", caption: `0 ${firstSymbol}`, font: { size: '0.75rem' } })),
                        this.$render("i-vstack", { margin: { top: 15 }, verticalAlignment: "center", horizontalAlignment: "center" },
                            this.$render("i-panel", null,
                                this.$render("i-button", { id: "btnSwap", minWidth: 150, minHeight: 36, caption: (0, index_11.isRpcWalletConnected)() ? 'Sell' : 'Switch Network', border: { radius: 12 }, rightIcon: { spin: true, visible: false, fill: '#fff' }, padding: { top: 4, bottom: 4, left: 16, right: 16 }, 
                                    // font={{ size: '0.875rem', color: Theme.colors.primary.contrastText }}
                                    // rightIcon={{ visible: false, fill: Theme.colors.primary.contrastText }}
                                    class: "btn-os", onClick: this.onSwap.bind(this) }))),
                        this.$render("i-vstack", { gap: "0.5rem", margin: { top: 8 } },
                            this.$render("i-vstack", { gap: "0.25rem" },
                                this.$render("i-label", { caption: "Smart contract", font: { size: '0.75rem' } }),
                                this.$render("i-label", { caption: pairAddress, font: { size: '0.75rem' }, overflowWrap: "anywhere" })),
                            this.$render("i-label", { caption: "Terms & Condition", font: { size: '0.75rem' }, link: { href: 'https://docs.scom.dev/' } }))));
                }
                else {
                    this.renderEmpty();
                }
            };
            this.renderLeftPart = async () => {
                if (this.buybackInfo) {
                    this.leftStack.clearInnerHTML();
                    const { tokenOut, tokenIn, projectName, description, detailUrl } = this.buybackInfo;
                    const firstToken = (tokenOut === null || tokenOut === void 0 ? void 0 : tokenOut.startsWith('0x')) ? tokenOut.toLowerCase() : tokenOut;
                    const secondToken = (tokenIn === null || tokenIn === void 0 ? void 0 : tokenIn.startsWith('0x')) ? tokenIn.toLowerCase() : tokenIn;
                    const firstTokenObj = scom_token_list_3.tokenStore.tokenMap[firstToken];
                    const secondTokenObj = scom_token_list_3.tokenStore.tokenMap[secondToken];
                    this.leftStack.clearInnerHTML();
                    this.leftStack.appendChild(this.$render("i-panel", { padding: { bottom: 15, top: 15, right: 15, left: 15 }, height: "auto" },
                        this.$render("i-vstack", { gap: "1rem", margin: { bottom: 15 }, width: "100%" },
                            this.$render("i-hstack", { horizontalAlignment: "center" },
                                this.$render("i-hstack", { position: "relative", verticalAlignment: "center", horizontalAlignment: "center", margin: { bottom: '1.25rem' } },
                                    this.$render("i-image", { width: 80, height: 80, url: scom_token_list_3.assets.tokenPath(firstTokenObj, (0, index_11.getChainId)()), fallbackUrl: index_11.fallBackUrl }),
                                    this.$render("i-image", { width: 50, height: 50, url: scom_token_list_3.assets.tokenPath(secondTokenObj, (0, index_11.getChainId)()), fallbackUrl: index_11.fallBackUrl, position: "absolute", bottom: -15, right: -10 }))),
                            this.$render("i-label", { caption: projectName || '', margin: { top: '0.5em', bottom: '1em' }, font: { weight: 600 } }),
                            this.$render("i-label", { caption: description || '', font: { size: '0.875rem' } }),
                            this.$render("i-hstack", { visible: !!detailUrl, verticalAlignment: "center", gap: "0.25rem", wrap: "wrap" },
                                this.$render("i-label", { caption: "Details here: ", font: { size: '0.875rem' } }),
                                this.$render("i-label", { font: { size: '0.875rem' }, caption: detailUrl, link: { href: detailUrl } })))));
                }
            };
            if (data_json_1.default)
                (0, index_11.setDataFromConfig)(data_json_1.default);
            this.$eventBus = components_7.application.EventBus;
            this.registerEvent();
        }
        get isSellDisabled() {
            if (!this.buybackInfo)
                return true;
            const info = this.buybackInfo.queueInfo;
            if (!info)
                return true;
            const { startDate, endDate, allowAll, addresses } = info;
            const isUpcoming = (0, components_7.moment)().isBefore((0, components_7.moment)(startDate));
            const isEnded = (0, components_7.moment)().isAfter((0, components_7.moment)(endDate));
            if (isUpcoming || isEnded) {
                return true;
            }
            if (!allowAll) {
                const address = eth_wallet_8.Wallet.getClientInstance().address;
                const isWhitelisted = addresses.some((item) => item.address === address);
                return !isWhitelisted;
            }
            return false;
        }
        get submitButtonText() {
            var _a, _b;
            if (!(0, index_11.isRpcWalletConnected)()) {
                return 'Switch Network';
            }
            if (this.isApproveButtonShown) {
                return ((_a = this.btnSwap) === null || _a === void 0 ? void 0 : _a.rightIcon.visible) ? 'Approving' : 'Approve';
            }
            const firstVal = new eth_wallet_8.BigNumber(this.firstInput.value);
            const secondVal = new eth_wallet_8.BigNumber(this.secondInput.value);
            if (firstVal.lt(0) || secondVal.lt(0)) {
                return 'Amount must be greater than 0';
            }
            if (this.buybackInfo) {
                const firstMaxVal = new eth_wallet_8.BigNumber(this.getFirstAvailableBalance());
                const secondMaxVal = new eth_wallet_8.BigNumber(this.getSecondAvailableBalance());
                const commissionAmount = (0, index_11.getCommissionAmount)(this.commissions, firstVal);
                const tokenBalances = scom_token_list_3.tokenStore.tokenBalances;
                const balance = new eth_wallet_8.BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
                const tradeFee = (this.buybackInfo.queueInfo || {}).tradeFee || '0';
                const fee = new eth_wallet_8.BigNumber(1).minus(tradeFee).times(this.firstInput.value);
                const total = firstVal.plus(commissionAmount).plus(fee);
                if (firstVal.gt(firstMaxVal) || secondVal.gt(secondMaxVal) || total.gt(balance)) {
                    return 'Insufficient amount available';
                }
            }
            if ((_b = this.btnSwap) === null || _b === void 0 ? void 0 : _b.rightIcon.visible) {
                return 'Selling';
            }
            return 'Sell';
        }
        ;
        isEmptyData(value) {
            return !value || !value.tokenIn || !value.tokenOut || !value.networks || value.networks.length === 0;
        }
        async init() {
            this.isReadyCallbackQueued = true;
            super.init();
            this.buybackAlert = new index_14.default();
            this.buybackComponent.appendChild(this.buybackAlert);
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const defaultChainId = this.getAttribute('defaultChainId', true);
                const chainId = this.getAttribute('chainId', true, defaultChainId || 0);
                const projectName = this.getAttribute('projectName', true, '');
                const description = this.getAttribute('description', true, '');
                const offerIndex = this.getAttribute('offerIndex', true, 0);
                const tokenIn = this.getAttribute('tokenIn', true, '');
                const tokenOut = this.getAttribute('tokenOut', true, '');
                const detailUrl = this.getAttribute('detailUrl', true, '');
                // const commissions = this.getAttribute('commissions', true, []);
                const networks = this.getAttribute('networks', true);
                const wallets = this.getAttribute('wallets', true);
                const showHeader = this.getAttribute('showHeader', true);
                const data = {
                    chainId,
                    projectName,
                    description,
                    offerIndex,
                    tokenIn,
                    tokenOut,
                    detailUrl,
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
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        render() {
            return (this.$render("i-scom-dapp-container", { id: "dappContainer", class: index_css_2.buybackDappContainer },
                this.$render("i-panel", { id: "buybackComponent", class: index_css_2.buybackComponent, minHeight: 340 },
                    this.$render("i-panel", { id: "buybackLayout", class: "buyback-layout", margin: { left: 'auto', right: 'auto' } },
                        this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay" },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_4.default.fullPath('img/loading.svg'), width: 36, height: 36 } }),
                                this.$render("i-label", { caption: "Loading...", font: { color: '#FD4A4C', size: '1.5em' }, class: "i-loading-spinner_text" }))),
                        this.$render("i-vstack", { id: "emptyStack", visible: false, minHeight: 320, margin: { top: 10, bottom: 10 }, verticalAlignment: "center", horizontalAlignment: "center" }),
                        this.$render("i-hstack", { id: "infoStack", width: "100%", height: "100%", horizontalAlignment: "center", wrap: "wrap", gap: 20 },
                            this.$render("i-vstack", { id: "leftStack", minWidth: 300, maxWidth: "50%", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } }),
                            this.$render("i-vstack", { id: "buybackElm", minWidth: 300, gap: "0.5rem", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, background: { color: Theme.background.main }, verticalAlignment: "space-between" }))),
                    this.$render("i-scom-commission-fee-setup", { id: "configDApp", visible: false }),
                    this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] }))));
        }
    };
    ScomBuyback = __decorate([
        components_7.customModule,
        (0, components_7.customElements)('i-scom-buyback')
    ], ScomBuyback);
    exports.default = ScomBuyback;
});
