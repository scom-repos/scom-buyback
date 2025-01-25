/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-commission-proxy-contract/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-commission-fee-setup/index.d.ts" />
/// <amd-module name="@scom/scom-buyback/global/utils/helper.ts" />
declare module "@scom/scom-buyback/global/utils/helper.ts" {
    import { BigNumber } from '@ijstech/eth-wallet';
    import { Input } from '@ijstech/components';
    export const DefaultDateFormat = "DD/MM/YYYY hh:mm:ss";
    export const formatDate: (date: any, customType?: string, showTimezone?: boolean) => string;
    export const formatNumber: (value: number | string | BigNumber, decimalFigures?: number) => string;
    export const isInvalidInput: (val: any) => boolean;
    export const limitInputNumber: (input: Input, decimals?: number) => void;
    export const toWeiInv: (n: string, unit?: number) => BigNumber;
    export const padLeft: (string: string, chars: number, sign?: string) => string;
    export const numberToBytes32: (value: any, prefix?: string) => any;
}
/// <amd-module name="@scom/scom-buyback/global/utils/common.ts" />
declare module "@scom/scom-buyback/global/utils/common.ts" {
    import { ISendTxEventsOptions } from '@ijstech/eth-wallet';
    export const registerSendTxEvents: (sendTxEventHandlers: ISendTxEventsOptions) => void;
}
/// <amd-module name="@scom/scom-buyback/global/utils/interfaces.ts" />
declare module "@scom/scom-buyback/global/utils/interfaces.ts" {
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    export interface ICommissionInfo {
        chainId: number;
        walletAddress: string;
        share: string;
    }
    export interface IBuybackCampaign {
        chainId: number;
        title?: string;
        logo?: string;
        pairAddress?: string;
        offerIndex: number;
        tokenIn: string;
        customTokenIn?: string;
        tokenOut: string;
        customTokenOut?: string;
        commissions?: ICommissionInfo[];
        wallets: IWalletPlugin[];
        networks: INetworkConfig[];
        showHeader?: boolean;
        defaultChainId?: number;
    }
    export interface INetworkConfig {
        chainId: number;
        chainName?: string;
    }
}
/// <amd-module name="@scom/scom-buyback/global/utils/index.ts" />
declare module "@scom/scom-buyback/global/utils/index.ts" {
    export * from "@scom/scom-buyback/global/utils/helper.ts";
    export { registerSendTxEvents } from "@scom/scom-buyback/global/utils/common.ts";
    export * from "@scom/scom-buyback/global/utils/interfaces.ts";
}
/// <amd-module name="@scom/scom-buyback/global/index.ts" />
declare module "@scom/scom-buyback/global/index.ts" {
    export * from "@scom/scom-buyback/global/utils/index.ts";
}
/// <amd-module name="@scom/scom-buyback/assets.ts" />
declare module "@scom/scom-buyback/assets.ts" {
    function fullPath(path: string): string;
    const _default: {
        fullPath: typeof fullPath;
    };
    export default _default;
}
/// <amd-module name="@scom/scom-buyback/store/data/index.ts" />
declare module "@scom/scom-buyback/store/data/index.ts" {
    export const CoreContractAddressesByChainId: {
        [chainId: number]: {
            [contract: string]: string;
        };
    };
}
/// <amd-module name="@scom/scom-buyback/store/utils.ts" />
declare module "@scom/scom-buyback/store/utils.ts" {
    import { BigNumber, ERC20ApprovalModel, IERC20ApprovalEventOptions, INetwork } from '@ijstech/eth-wallet';
    import { ICommissionInfo } from "@scom/scom-buyback/global/index.ts";
    import { ITokenObject } from '@scom/scom-token-list';
    export * from "@scom/scom-buyback/store/data/index.ts";
    export type ProxyAddresses = {
        [key: number]: string;
    };
    export class State {
        slippageTolerance: number;
        transactionDeadline: number;
        infuraId: string;
        networkMap: {
            [key: number]: INetwork;
        };
        proxyAddresses: ProxyAddresses;
        embedderCommissionFee: string;
        rpcWalletId: string;
        approvalModel: ERC20ApprovalModel;
        constructor(options: any);
        private initData;
        initRpcWallet(defaultChainId: number): string;
        getProxyAddress(chainId?: number): string;
        getRpcWallet(): import("@ijstech/eth-wallet").IRpcWallet;
        isRpcWalletConnected(): boolean;
        getChainId(): number;
        private setNetworkList;
        getCurrentCommissions(commissions: ICommissionInfo[]): ICommissionInfo[];
        getCommissionAmount: (commissions: ICommissionInfo[], amount: BigNumber) => BigNumber;
        setApprovalModelAction(options: IERC20ApprovalEventOptions): Promise<import("@ijstech/eth-wallet").IERC20ApprovalAction>;
        getAddresses(chainId?: number): {
            [contract: string]: string;
        };
    }
    export const getChainNativeToken: (chainId: number) => ITokenObject;
    export const getWETH: (chainId: number) => ITokenObject;
    export function isClientWalletConnected(): boolean;
}
/// <amd-module name="@scom/scom-buyback/store/tokens/mainnet/avalanche.ts" />
declare module "@scom/scom-buyback/store/tokens/mainnet/avalanche.ts" {
    export const Tokens_Avalanche: ({
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        isCommon: boolean;
    } | {
        chainId: number;
        address?: string;
        name: string;
        decimals: number;
        symbol: string;
        status?: boolean;
        logoURI?: string;
        isCommon?: boolean;
        balance?: string | number;
        isNative?: boolean;
        isWETH?: boolean;
        isNew?: boolean;
    })[];
}
/// <amd-module name="@scom/scom-buyback/store/tokens/mainnet/bsc.ts" />
declare module "@scom/scom-buyback/store/tokens/mainnet/bsc.ts" {
    export const Tokens_BSC: ({
        name: string;
        symbol: string;
        address: string;
        decimals: number;
        isCommon: boolean;
    } | {
        chainId: number;
        address?: string;
        name: string;
        decimals: number;
        symbol: string;
        status?: boolean;
        logoURI?: string;
        isCommon?: boolean;
        balance?: string | number;
        isNative?: boolean;
        isWETH?: boolean;
        isNew?: boolean;
    })[];
}
/// <amd-module name="@scom/scom-buyback/store/tokens/mainnet/zkSync.ts" />
declare module "@scom/scom-buyback/store/tokens/mainnet/zkSync.ts" {
    export const Tokens_ZK: ({
        name: string;
        address: string;
        symbol: string;
        decimals: number;
        isCommon: boolean;
    } | {
        chainId: number;
        address?: string;
        name: string;
        decimals: number;
        symbol: string;
        status?: boolean;
        logoURI?: string;
        isCommon?: boolean;
        balance?: string | number;
        isNative?: boolean;
        isWETH?: boolean;
        isNew?: boolean;
    })[];
}
/// <amd-module name="@scom/scom-buyback/store/tokens/mainnet/index.ts" />
declare module "@scom/scom-buyback/store/tokens/mainnet/index.ts" {
    export { Tokens_Avalanche } from "@scom/scom-buyback/store/tokens/mainnet/avalanche.ts";
    export { Tokens_BSC } from "@scom/scom-buyback/store/tokens/mainnet/bsc.ts";
    export { Tokens_ZK } from "@scom/scom-buyback/store/tokens/mainnet/zkSync.ts";
}
/// <amd-module name="@scom/scom-buyback/store/tokens/testnet/bsc-testnet.ts" />
declare module "@scom/scom-buyback/store/tokens/testnet/bsc-testnet.ts" {
    export const Tokens_BSC_Testnet: ({
        name: string;
        address: string;
        symbol: string;
        decimals: number;
        isCommon: boolean;
    } | {
        name: string;
        address: string;
        symbol: string;
        decimals: number;
        isCommon?: undefined;
    } | {
        chainId: number;
        address?: string;
        name: string;
        decimals: number;
        symbol: string;
        status?: boolean;
        logoURI?: string;
        isCommon?: boolean;
        balance?: string | number;
        isNative?: boolean;
        isWETH?: boolean;
        isNew?: boolean;
    })[];
}
/// <amd-module name="@scom/scom-buyback/store/tokens/testnet/fuji.ts" />
declare module "@scom/scom-buyback/store/tokens/testnet/fuji.ts" {
    export const Tokens_Fuji: ({
        name: string;
        address: string;
        symbol: string;
        decimals: number;
    } | {
        chainId: number;
        address?: string;
        name: string;
        decimals: number;
        symbol: string;
        status?: boolean;
        logoURI?: string;
        isCommon?: boolean;
        balance?: string | number;
        isNative?: boolean;
        isWETH?: boolean;
        isNew?: boolean;
    })[];
}
/// <amd-module name="@scom/scom-buyback/store/tokens/testnet/zk-sepolia.ts" />
declare module "@scom/scom-buyback/store/tokens/testnet/zk-sepolia.ts" {
    export const Tokens_ZK_Sepolia: ({
        name: string;
        address: string;
        symbol: string;
        decimals: number;
        isCommon: boolean;
    } | {
        chainId: number;
        address?: string;
        name: string;
        decimals: number;
        symbol: string;
        status?: boolean;
        logoURI?: string;
        isCommon?: boolean;
        balance?: string | number;
        isNative?: boolean;
        isWETH?: boolean;
        isNew?: boolean;
    })[];
}
/// <amd-module name="@scom/scom-buyback/store/tokens/testnet/index.ts" />
declare module "@scom/scom-buyback/store/tokens/testnet/index.ts" {
    export { Tokens_BSC_Testnet } from "@scom/scom-buyback/store/tokens/testnet/bsc-testnet.ts";
    export { Tokens_Fuji } from "@scom/scom-buyback/store/tokens/testnet/fuji.ts";
    export { Tokens_ZK_Sepolia } from "@scom/scom-buyback/store/tokens/testnet/zk-sepolia.ts";
}
/// <amd-module name="@scom/scom-buyback/store/tokens/index.ts" />
declare module "@scom/scom-buyback/store/tokens/index.ts" {
    import { ITokenObject } from "@scom/scom-token-list";
    const SupportedERC20Tokens: {
        [chainId: number]: ITokenObject[];
    };
    export { SupportedERC20Tokens };
}
/// <amd-module name="@scom/scom-buyback/store/index.ts" />
declare module "@scom/scom-buyback/store/index.ts" {
    export const fallBackUrl: string;
    export * from "@scom/scom-buyback/store/utils.ts";
    export * from "@scom/scom-buyback/store/tokens/index.ts";
}
/// <amd-module name="@scom/scom-buyback/buyback-utils/index.ts" />
declare module "@scom/scom-buyback/buyback-utils/index.ts" {
    import { IBuybackCampaign } from "@scom/scom-buyback/global/index.ts";
    import { BigNumber } from '@ijstech/eth-wallet';
    import { State } from "@scom/scom-buyback/store/index.ts";
    import { ITokenObject } from '@scom/scom-token-list';
    const getGroupQueueExecuteData: (offerIndex: number | BigNumber) => string;
    interface GuaranteedBuyBackInfo extends IBuybackCampaign {
        queueInfo: ProviderGroupQueueInfo;
    }
    const getGuaranteedBuyBackInfo: (state: State, buybackCampaign: IBuybackCampaign) => Promise<GuaranteedBuyBackInfo | null>;
    interface ProviderGroupQueueInfo {
        pairAddress: string;
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        offerPrice: string;
        startDate: number;
        endDate: number;
        state: string;
        allowAll: boolean;
        direct: boolean;
        offerIndex: number;
        isApprovedTrader: boolean;
        willGet: string;
        tradeFee: string;
        tokenInAvailable: string;
        available: string;
    }
    const getOffers: (state: State, chainId: number, tokenA: ITokenObject, tokenB: ITokenObject) => Promise<number[]>;
    export { getGroupQueueExecuteData, getGuaranteedBuyBackInfo, GuaranteedBuyBackInfo, ProviderGroupQueueInfo, getOffers };
}
/// <amd-module name="@scom/scom-buyback/swap-utils/index.ts" />
declare module "@scom/scom-buyback/swap-utils/index.ts" {
    import { BigNumber, TransactionReceipt } from '@ijstech/eth-wallet';
    import { ICommissionInfo } from "@scom/scom-buyback/global/index.ts";
    import { State } from "@scom/scom-buyback/store/index.ts";
    const getHybridRouterAddress: (state: State, isZksync?: boolean) => string;
    interface SwapData {
        provider: string;
        routeTokens: any[];
        bestSmartRoute: any[];
        pairs: string[];
        fromAmount: BigNumber;
        toAmount: BigNumber;
        isFromEstimated: boolean;
        groupQueueOfferIndex?: number;
        commissions?: ICommissionInfo[];
    }
    const executeSwap: (state: State, swapData: SwapData) => Promise<{
        receipt: TransactionReceipt | null;
        error: Record<string, string> | null;
    }>;
    const getProxySelectors: (state: State, chainId: number) => Promise<string[]>;
    export { SwapData, executeSwap, getHybridRouterAddress, getProxySelectors };
}
/// <amd-module name="@scom/scom-buyback/data.json.ts" />
declare module "@scom/scom-buyback/data.json.ts" {
    const _default_1: {
        infuraId: string;
        networks: {
            chainId: number;
            explorerTxUrl: string;
            explorerAddressUrl: string;
        }[];
        proxyAddresses: {
            "97": string;
            "43113": string;
            "300": string;
            "324": string;
        };
        embedderCommissionFee: string;
        defaultBuilderData: {
            defaultChainId: number;
            chainId: number;
            offerIndex: number;
            tokenIn: string;
            tokenOut: string;
            networks: {
                chainId: number;
            }[];
            wallets: {
                name: string;
            }[];
        };
    };
    export default _default_1;
}
/// <amd-module name="@scom/scom-buyback/index.css.ts" />
declare module "@scom/scom-buyback/index.css.ts" {
    export const buybackDappContainer: string;
    export const buybackComponent: string;
    export const comboBoxStyle: string;
    export const formInputStyle: string;
}
/// <amd-module name="@scom/scom-buyback/model/buybackModel.ts" />
declare module "@scom/scom-buyback/model/buybackModel.ts" {
    import { Module } from "@ijstech/components";
    import { ITokenObject } from "@scom/scom-token-list";
    import { BigNumber } from "@ijstech/eth-contract";
    import { IBuybackCampaign, ICommissionInfo } from "@scom/scom-buyback/global/index.ts";
    import { GuaranteedBuyBackInfo } from "@scom/scom-buyback/buyback-utils/index.ts";
    import { State } from "@scom/scom-buyback/store/index.ts";
    export class BuybackModel {
        private state;
        private module;
        private _buybackInfo;
        constructor(module: Module, state: State);
        get chainId(): number;
        set buybackInfo(value: GuaranteedBuyBackInfo);
        get buybackInfo(): GuaranteedBuyBackInfo;
        get isExpired(): boolean;
        get isUpcoming(): boolean;
        get isSwapDisabled(): boolean;
        get firstAvailableBalance(): string;
        get secondAvailableBalance(): string;
        get firstTokenObject(): ITokenObject;
        get secondTokenObject(): ITokenObject;
        get firstTokenBalance(): string | 0;
        get secondTokenBalance(): string | 0;
        get offerPrice(): any;
        getAvailable: (commissions: ICommissionInfo[]) => string | BigNumber;
        getSubmitButtonText(isApproveButtonShown: boolean, isSubmitting: boolean, firstValue: number, secondValue: number, commissions: ICommissionInfo[]): string;
        executeSwap: (fromAmount: BigNumber, toAmount: BigNumber, commissions: ICommissionInfo[]) => Promise<{
            receipt: import("@ijstech/eth-wallet/web3.ts").TransactionReceipt;
            error: Record<string, string>;
        }>;
        fetchGuaranteedBuyBackInfo: (data: IBuybackCampaign) => Promise<GuaranteedBuyBackInfo>;
        getValueByKey: (key: string) => any;
        isEmptyData(value: IBuybackCampaign): boolean;
        private getTokenObject;
        private getTokenBalace;
    }
}
/// <amd-module name="@scom/scom-buyback/formSchema.ts" />
declare module "@scom/scom-buyback/formSchema.ts" {
    import { I18n, Input } from '@ijstech/components';
    import ScomNetworkPicker from '@scom/scom-network-picker';
    import ScomTokenInput from '@scom/scom-token-input';
    import { State } from "@scom/scom-buyback/store/index.ts";
    export function getSchema(i18n: I18n, state?: State, isOwner?: boolean): {
        dataSchema: {
            type: string;
            properties: {
                offerIndex: {
                    type: string;
                    title: string;
                    required: boolean;
                };
                chainId: {
                    type: string;
                    title: string;
                    required: boolean;
                };
                tokenIn: {
                    type: string;
                    title: string;
                    required: boolean;
                };
                customTokenIn: {
                    type: string;
                    title: string;
                    required: boolean;
                };
                tokenOut: {
                    type: string;
                    title: string;
                    required: boolean;
                };
                customTokenOut: {
                    type: string;
                    title: string;
                    required: boolean;
                };
            };
        };
        uiSchema: {
            type: string;
            elements: ({
                type: string;
                scope: string;
                rule?: undefined;
            } | {
                type: string;
                scope: string;
                rule: {
                    effect: string;
                    condition: {
                        scope: string;
                        schema: {
                            const: string;
                        };
                    };
                };
            })[];
        };
        customControls(getData?: Function): {
            '#/properties/chainId': {
                render: () => ScomNetworkPicker;
                getData: (control: ScomNetworkPicker) => number;
                setData: (control: ScomNetworkPicker, value: number) => void;
            };
            '#/properties/tokenIn': {
                render: () => ScomTokenInput;
                getData: (control: ScomTokenInput) => string;
                setData: (control: ScomTokenInput, value: string, rowData: any) => Promise<void>;
            };
            '#/properties/customTokenIn': {
                render: () => Input;
                getData: (control: Input) => any;
                setData: (control: Input, value: string) => Promise<void>;
            };
            '#/properties/tokenOut': {
                render: () => ScomTokenInput;
                getData: (control: ScomTokenInput) => string;
                setData: (control: ScomTokenInput, value: string, rowData: any) => Promise<void>;
            };
            '#/properties/customTokenOut': {
                render: () => Input;
                getData: (control: Input) => any;
                setData: (control: Input, value: string) => Promise<void>;
            };
        };
    };
}
/// <amd-module name="@scom/scom-buyback/model/configModel.ts" />
declare module "@scom/scom-buyback/model/configModel.ts" {
    import { Module } from "@ijstech/components";
    import { IBuybackCampaign, ICommissionInfo } from "@scom/scom-buyback/global/index.ts";
    import { State } from "@scom/scom-buyback/store/index.ts";
    import { INetworkConfig } from "@scom/scom-network-picker";
    import { IWalletPlugin } from "@scom/scom-wallet-modal";
    import ScomCommissionFeeSetup from "@scom/scom-commission-fee-setup";
    import ScomDappContainer from "@scom/scom-dapp-container";
    interface IConfigOptions {
        refreshWidget: () => Promise<void>;
        getContainer: () => ScomDappContainer;
    }
    export class ConfigModel {
        private state;
        private module;
        private options;
        private _data;
        private rpcWalletEvents;
        constructor(state: State, module: Module, options: IConfigOptions);
        get chainId(): number;
        get defaultChainId(): number;
        set defaultChainId(value: number);
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        get commissions(): ICommissionInfo[];
        set commissions(value: ICommissionInfo[]);
        private get rpcWallet();
        private _getActions;
        private getProjectOwnerActions;
        getConfigurators(): ({
            name: string;
            target: string;
            getProxySelectors: (chainId: number) => Promise<string[]>;
            getActions: () => any[];
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
            elementName?: undefined;
            getLinkParams?: undefined;
            bindOnChanged?: undefined;
        } | {
            name: string;
            target: string;
            getActions: (category?: string) => any[];
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
            getProxySelectors?: undefined;
            elementName?: undefined;
            getLinkParams?: undefined;
            bindOnChanged?: undefined;
        } | {
            name: string;
            target: string;
            elementName: string;
            getLinkParams: () => {
                data: string;
            };
            bindOnChanged: (element: ScomCommissionFeeSetup, callback: (data: any) => Promise<void>) => void;
            getData: () => {
                fee: string;
                chainId: number;
                title?: string;
                logo?: string;
                pairAddress?: string;
                offerIndex: number;
                tokenIn: string;
                customTokenIn?: string;
                tokenOut: string;
                customTokenOut?: string;
                commissions?: ICommissionInfo[];
                wallets: IWalletPlugin[];
                networks: import("@scom/scom-buyback/global/index.ts").INetworkConfig[];
                showHeader?: boolean;
                defaultChainId?: number;
            };
            setData: (properties: IBuybackCampaign, linkParams?: Record<string, any>) => Promise<void>;
            getTag: any;
            setTag: any;
            getProxySelectors?: undefined;
            getActions?: undefined;
        })[];
        getData(): IBuybackCampaign;
        setData(data: IBuybackCampaign): Promise<void>;
        getTag(): Promise<any>;
        setTag(value: any): void;
        private get container();
        private setContaiterTag;
        private updateTag;
        private updateTheme;
        private updateStyle;
        private refreshDappContainer;
        private refreshData;
        removeRpcWalletEvents: () => void;
        resetRpcWallet: () => Promise<void>;
        initWallet: () => Promise<void>;
    }
}
/// <amd-module name="@scom/scom-buyback/model/index.ts" />
declare module "@scom/scom-buyback/model/index.ts" {
    export { BuybackModel } from "@scom/scom-buyback/model/buybackModel.ts";
    export { ConfigModel } from "@scom/scom-buyback/model/configModel.ts";
}
/// <amd-module name="@scom/scom-buyback/translations.json.ts" />
declare module "@scom/scom-buyback/translations.json.ts" {
    const _default_2: {
        en: {
            swapping_to: string;
            approve: string;
            approving: string;
            no_buybacks: string;
            please_connect_with_your_wallet: string;
            connect_wallet: string;
            hide_information: string;
            more_information: string;
            end_time: string;
            group_queue_balance: string;
            your_allocation: string;
            your_balance: string;
            unlimited: string;
            buyback_price: string;
            swap_available: string;
            max: string;
            trade_fee_value: string;
            commission_fee: string;
            a_commission_fee_of_value_will_be_applied_to_the_amount_you_input: string;
            swap: string;
            swapping: string;
            upcoming: string;
            expired: string;
            amount_must_be_greater_than_0: string;
            insufficient_amount_available: string;
            switch_network: string;
            offer_index: string;
            chain: string;
            token_in: string;
            token_in_address: string;
            token_out: string;
            token_out_address: string;
        };
        "zh-hant": {
            swapping_to: string;
            approve: string;
            approving: string;
            no_buybacks: string;
            please_connect_with_your_wallet: string;
            connect_wallet: string;
            hide_information: string;
            more_information: string;
            end_time: string;
            group_queue_balance: string;
            your_allocation: string;
            your_balance: string;
            unlimited: string;
            buyback_price: string;
            swap_available: string;
            max: string;
            trade_fee_value: string;
            commission_fee: string;
            a_commission_fee_of_value_will_be_applied_to_the_amount_you_input: string;
            swap: string;
            swapping: string;
            upcoming: string;
            expired: string;
            amount_must_be_greater_than_0: string;
            insufficient_amount_available: string;
            switch_network: string;
            offer_index: string;
            chain: string;
            token_in: string;
            token_in_address: string;
            token_out: string;
            token_out_address: string;
        };
        vi: {
            swapping_to: string;
            approve: string;
            approving: string;
            no_buybacks: string;
            please_connect_with_your_wallet: string;
            connect_wallet: string;
            hide_information: string;
            more_information: string;
            end_time: string;
            group_queue_balance: string;
            your_allocation: string;
            your_balance: string;
            unlimited: string;
            buyback_price: string;
            swap_available: string;
            max: string;
            trade_fee_value: string;
            commission_fee: string;
            a_commission_fee_of_value_will_be_applied_to_the_amount_you_input: string;
            swap: string;
            swapping: string;
            upcoming: string;
            expired: string;
            amount_must_be_greater_than_0: string;
            insufficient_amount_available: string;
            switch_network: string;
            offer_index: string;
            chain: string;
            token_in: string;
            token_in_address: string;
            token_out: string;
            token_out_address: string;
        };
    };
    export default _default_2;
}
/// <amd-module name="@scom/scom-buyback" />
declare module "@scom/scom-buyback" {
    import { Module, Container, ControlElement } from '@ijstech/components';
    import { IBuybackCampaign, ICommissionInfo, INetworkConfig } from "@scom/scom-buyback/global/index.ts";
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    interface ScomBuybackElement extends ControlElement {
        lazyLoad?: boolean;
        chainId: number;
        title?: string;
        logo?: string;
        offerIndex: number;
        tokenIn: string;
        customTokenIn?: string;
        tokenOut: string;
        customTokenOut?: string;
        commissions?: ICommissionInfo[];
        defaultChainId: number;
        networks: INetworkConfig[];
        wallets: IWalletPlugin[];
        showHeader?: boolean;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-buyback']: ScomBuybackElement;
            }
        }
    }
    export default class ScomBuyback extends Module {
        private state;
        tag: any;
        defaultEdit: boolean;
        private infoStack;
        private emptyStack;
        private loadingElm;
        private txStatusModal;
        private noCampaignSection;
        private firstInputBox;
        private secondInputBox;
        private firstInput;
        private secondInput;
        private lbFee;
        private hStackCommission;
        private lbCommissionFee;
        private btnSwap;
        private mdWallet;
        private approvalModelAction;
        private isApproveButtonShown;
        private isSubmitting;
        private detailWrapper;
        private btnDetail;
        private dappContainer;
        private contractAddress;
        private buybackModel;
        private configModel;
        static create(options?: ScomBuybackElement, parent?: Container): Promise<ScomBuyback>;
        private get data();
        onHide(): void;
        removeRpcWalletEvents(): void;
        getConfigurators(): ({
            name: string;
            target: string;
            getProxySelectors: (chainId: number) => Promise<string[]>;
            getActions: () => any[];
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
            elementName?: undefined;
            getLinkParams?: undefined;
            bindOnChanged?: undefined;
        } | {
            name: string;
            target: string;
            getActions: (category?: string) => any[];
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
            getProxySelectors?: undefined;
            elementName?: undefined;
            getLinkParams?: undefined;
            bindOnChanged?: undefined;
        } | {
            name: string;
            target: string;
            elementName: string;
            getLinkParams: () => {
                data: string;
            };
            bindOnChanged: (element: import("@scom/scom-commission-fee-setup").default, callback: (data: any) => Promise<void>) => void;
            getData: () => {
                fee: string;
                chainId: number;
                title?: string;
                logo?: string;
                pairAddress?: string;
                offerIndex: number;
                tokenIn: string;
                customTokenIn?: string;
                tokenOut: string;
                customTokenOut?: string;
                commissions?: ICommissionInfo[];
                wallets: IWalletPlugin[];
                networks: INetworkConfig[];
                showHeader?: boolean;
                defaultChainId?: number;
            };
            setData: (properties: IBuybackCampaign, linkParams?: Record<string, any>) => Promise<void>;
            getTag: any;
            setTag: any;
            getProxySelectors?: undefined;
            getActions?: undefined;
        })[];
        initModels(): void;
        getData(): Promise<IBuybackCampaign>;
        setData(data: IBuybackCampaign): Promise<void>;
        getTag(): Promise<any>;
        setTag(value: any): Promise<void>;
        private get chainId();
        private get rpcWallet();
        get defaultChainId(): number;
        set defaultChainId(value: number);
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        get commissions(): ICommissionInfo[];
        set commissions(value: ICommissionInfo[]);
        constructor(parent?: Container, options?: ControlElement);
        private updateContractAddress;
        private getContainer;
        private refreshWidget;
        private initializeWidgetConfig;
        private handleFocusInput;
        private updateCommissionInfo;
        private firstInputChange;
        private secondInputChange;
        private onSetMaxBalance;
        private updateBtnSwap;
        private onSwap;
        private onSubmit;
        private updateInput;
        private get submitButtonText();
        private initApprovalModelAction;
        private showResultMessage;
        private connectWallet;
        private initEmptyUI;
        private onToggleDetail;
        private renderEmpty;
        private renderBuybackCampaign;
        init(): Promise<void>;
        render(): any;
    }
}
