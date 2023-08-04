/// <reference path="@ijstech/eth-contract/index.d.ts" />
/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <amd-module name="@scom/scom-buyback/global/utils/helper.ts" />
declare module "@scom/scom-buyback/global/utils/helper.ts" {
    import { BigNumber } from '@ijstech/eth-wallet';
    export const explorerTxUrlsByChainId: {
        [key: number]: string;
    };
    export const DefaultDateFormat = "DD/MM/YYYY";
    export const formatDate: (date: any, customType?: string, showTimezone?: boolean) => string;
    export const formatNumber: (value: any, decimals?: number) => string;
    export const formatNumberWithSeparators: (value: number, precision?: number) => string;
    export const isInvalidInput: (val: any) => boolean;
    export const limitInputNumber: (input: any, decimals?: number) => void;
    export const limitDecimals: (value: any, decimals: number) => any;
    export const toWeiInv: (n: string, unit?: number) => BigNumber;
    export const padLeft: (string: string, chars: number, sign?: string) => string;
    export const numberToBytes32: (value: any, prefix?: string) => any;
    export const viewOnExplorerByTxHash: (chainId: number, txHash: string) => void;
}
/// <amd-module name="@scom/scom-buyback/global/utils/error.ts" />
declare module "@scom/scom-buyback/global/utils/error.ts" {
    export function parseContractError(oMessage: string, tokens: string[]): Promise<string>;
}
/// <amd-module name="@scom/scom-buyback/global/utils/common.ts" />
declare module "@scom/scom-buyback/global/utils/common.ts" {
    import { BigNumber, ISendTxEventsOptions } from '@ijstech/eth-wallet';
    import { ITokenObject } from '@scom/scom-token-list';
    export const registerSendTxEvents: (sendTxEventHandlers: ISendTxEventsOptions) => void;
    export const approveERC20Max: (token: ITokenObject, spenderAddress: string, callback?: any, confirmationCallback?: any) => Promise<import("@ijstech/eth-contract").TransactionReceipt>;
    export const getERC20Allowance: (token: ITokenObject, spenderAddress: string) => Promise<BigNumber>;
}
/// <amd-module name="@scom/scom-buyback/global/utils/approvalModel.ts" />
declare module "@scom/scom-buyback/global/utils/approvalModel.ts" {
    import { ITokenObject } from '@scom/scom-token-list';
    export enum ApprovalStatus {
        TO_BE_APPROVED = 0,
        APPROVING = 1,
        NONE = 2
    }
    export interface IERC20ApprovalEventOptions {
        sender: any;
        payAction: () => Promise<void>;
        onToBeApproved: (token: ITokenObject) => Promise<void>;
        onToBePaid: (token: ITokenObject) => Promise<void>;
        onApproving: (token: ITokenObject, receipt?: string, data?: any) => Promise<void>;
        onApproved: (token: ITokenObject, data?: any) => Promise<void>;
        onPaying: (receipt?: string, data?: any) => Promise<void>;
        onPaid: (data?: any) => Promise<void>;
        onApprovingError: (token: ITokenObject, err: Error) => Promise<void>;
        onPayingError: (err: Error) => Promise<void>;
    }
    export interface IERC20ApprovalOptions extends IERC20ApprovalEventOptions {
        spenderAddress: string;
    }
    export interface IERC20ApprovalAction {
        doApproveAction: (token: ITokenObject, inputAmount: string, data?: any) => Promise<void>;
        doPayAction: (data?: any) => Promise<void>;
        checkAllowance: (token: ITokenObject, inputAmount: string) => Promise<void>;
    }
    export class ERC20ApprovalModel {
        private options;
        constructor(options: IERC20ApprovalOptions);
        set spenderAddress(value: string);
        private checkAllowance;
        private doApproveAction;
        private doPayAction;
        getAction: () => IERC20ApprovalAction;
    }
}
/// <amd-module name="@scom/scom-buyback/global/utils/interfaces.ts" />
declare module "@scom/scom-buyback/global/utils/interfaces.ts" {
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    export interface ICommissionInfo {
        chainId: number;
        walletAddress: string;
        share: string;
    }
    export enum QueueType {
        PRIORITY_QUEUE = 0,
        RANGE_QUEUE = 1,
        GROUP_QUEUE = 2,
        PEGGED_QUEUE = 3,
        OTC_QUEUE = 4
    }
    export interface IBuybackCampaign {
        chainId: number;
        projectName: string;
        pairAddress?: string;
        offerIndex: number;
        description?: string;
        tokenIn: string;
        tokenOut: string;
        detailUrl?: string;
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
    export { parseContractError } from "@scom/scom-buyback/global/utils/error.ts";
    export { registerSendTxEvents, approveERC20Max, getERC20Allowance } from "@scom/scom-buyback/global/utils/common.ts";
    export { ApprovalStatus, IERC20ApprovalEventOptions, IERC20ApprovalOptions, IERC20ApprovalAction, ERC20ApprovalModel } from "@scom/scom-buyback/global/utils/approvalModel.ts";
    export * from "@scom/scom-buyback/global/utils/interfaces.ts";
}
/// <amd-module name="@scom/scom-buyback/global/index.ts" />
declare module "@scom/scom-buyback/global/index.ts" {
    import { INetwork } from '@ijstech/eth-wallet';
    export interface IExtendedNetwork extends INetwork {
        shortName?: string;
        isDisabled?: boolean;
        isMainChain?: boolean;
        isCrossChainSupported?: boolean;
        explorerName?: string;
        explorerTxUrl?: string;
        explorerAddressUrl?: string;
        isTestnet?: boolean;
        symbol?: string;
        env?: string;
    }
    export const enum EventId {
        Paid = "Paid",
        chainChanged = "chainChanged"
    }
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
    export enum Market {
        OPENSWAP = 0,
        UNISWAP = 1,
        SUSHISWAP = 2,
        PANCAKESWAPV1 = 3,
        PANCAKESWAP = 4,
        BAKERYSWAP = 5,
        BURGERSWAP = 6,
        IFSWAPV1 = 7,
        OPENSWAPV1 = 8,
        HYBRID = 9,
        MIXED_QUEUE = 10,
        GROUP_QUEUE = 11,
        QUICKSWAP = 12,
        BISWAP = 13,
        PANGOLIN = 14,
        TRADERJOE = 15,
        SPIRITSWAP = 16,
        SPOOKYSWAP = 17,
        PEGGED_QUEUE = 18,
        HAKUSWAP = 19,
        JETSWAP = 20,
        IFSWAPV3 = 21
    }
}
/// <amd-module name="@scom/scom-buyback/store/utils.ts" />
declare module "@scom/scom-buyback/store/utils.ts" {
    import { BigNumber } from '@ijstech/eth-wallet';
    import { ICommissionInfo, IExtendedNetwork } from "@scom/scom-buyback/global/index.ts";
    import { ITokenObject } from '@scom/scom-token-list';
    export * from "@scom/scom-buyback/store/data/index.ts";
    export const getInfuraId: () => string;
    export const getChainNativeToken: (chainId: number) => ITokenObject;
    export function getAddresses(chainId?: number): {
        [contract: string]: string;
    };
    export const getWETH: (chainId: number) => ITokenObject;
    export const setDataFromConfig: (options: any) => void;
    export const getSlippageTolerance: () => any;
    export const setSlippageTolerance: (value: any) => void;
    export const getTransactionDeadline: () => any;
    export const setTransactionDeadline: (value: any) => void;
    export type ProxyAddresses = {
        [key: number]: string;
    };
    export const state: {
        networkMap: {
            [key: number]: IExtendedNetwork;
        };
        slippageTolerance: number;
        transactionDeadline: number;
        infuraId: string;
        proxyAddresses: ProxyAddresses;
        embedderCommissionFee: string;
        rpcWalletId: string;
    };
    export const setProxyAddresses: (data: ProxyAddresses) => void;
    export const getProxyAddress: (chainId?: number) => string;
    export const getEmbedderCommissionFee: () => string;
    export const getCurrentCommissions: (commissions: ICommissionInfo[]) => ICommissionInfo[];
    export const getCommissionAmount: (commissions: ICommissionInfo[], amount: BigNumber) => BigNumber;
    export function isClientWalletConnected(): boolean;
    export function isRpcWalletConnected(): boolean;
    export function getChainId(): number;
    export function initRpcWallet(defaultChainId: number): string;
    export function getRpcWallet(): import("@ijstech/eth-wallet").IRpcWallet;
    export function getClientWallet(): import("@ijstech/eth-wallet").IClientWallet;
}
/// <amd-module name="@scom/scom-buyback/store/index.ts" />
declare module "@scom/scom-buyback/store/index.ts" {
    export const fallBackUrl: string;
    export * from "@scom/scom-buyback/store/utils.ts";
}
/// <amd-module name="@scom/scom-buyback/buyback-utils/index.ts" />
declare module "@scom/scom-buyback/buyback-utils/index.ts" {
    import { QueueType, IBuybackCampaign } from "@scom/scom-buyback/global/index.ts";
    import { BigNumber } from '@ijstech/eth-wallet';
    export interface AllocationMap {
        address: string;
        allocation: string;
    }
    const getPair: (queueType: QueueType, tokenA: any, tokenB: any) => Promise<string>;
    const getGroupQueueExecuteData: (offerIndex: number | BigNumber) => string;
    interface GuaranteedBuyBackInfo extends IBuybackCampaign {
        queueInfo: ProviderGroupQueueInfo;
    }
    const getGuaranteedBuyBackInfo: (buybackCampaign: IBuybackCampaign) => Promise<GuaranteedBuyBackInfo | null>;
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
        addresses: {
            address: string;
            allocation: string;
        }[];
        allocation: string;
        willGet: string;
        tradeFee: string;
        tokenInAvailable: string;
        available: string;
    }
    interface QueueBasicInfo {
        firstToken: string;
        secondToken: string;
        queueSize: BigNumber;
        topStake: BigNumber | undefined;
        totalOrder: BigNumber;
        totalStake: BigNumber | undefined;
        pairAddress: string;
        isOdd: boolean;
    }
    export { QueueBasicInfo, getPair, getGroupQueueExecuteData, getGuaranteedBuyBackInfo, GuaranteedBuyBackInfo, ProviderGroupQueueInfo, };
}
/// <amd-module name="@scom/scom-buyback/swap-utils/index.ts" />
declare module "@scom/scom-buyback/swap-utils/index.ts" {
    import { BigNumber, TransactionReceipt } from '@ijstech/eth-wallet';
    import { QueueType, IERC20ApprovalEventOptions, ICommissionInfo } from "@scom/scom-buyback/global/index.ts";
    const getHybridRouterAddress: () => string;
    interface SwapData {
        provider: string;
        queueType?: QueueType;
        routeTokens: any[];
        bestSmartRoute: any[];
        pairs: string[];
        fromAmount: BigNumber;
        toAmount: BigNumber;
        isFromEstimated: boolean;
        groupQueueOfferIndex?: number;
        commissions?: ICommissionInfo[];
    }
    const executeSwap: (swapData: SwapData) => Promise<{
        receipt: TransactionReceipt | null;
        error: Record<string, string> | null;
    }>;
    const getApprovalModelAction: (options: IERC20ApprovalEventOptions) => Promise<import("@scom/scom-buyback/global/index.ts").IERC20ApprovalAction>;
    const setApprovalModalSpenderAddress: (contractAddress?: string) => void;
    export { SwapData, executeSwap, getHybridRouterAddress, getApprovalModelAction, setApprovalModalSpenderAddress };
}
/// <amd-module name="@scom/scom-buyback/alert/index.css.ts" />
declare module "@scom/scom-buyback/alert/index.css.ts" {
    const _default_1: string;
    export default _default_1;
}
/// <amd-module name="@scom/scom-buyback/alert/index.tsx" />
declare module "@scom/scom-buyback/alert/index.tsx" {
    import { Module, ControlElement, Container } from '@ijstech/components';
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-buyback-alert']: ControlElement;
            }
        }
    }
    interface IMessage {
        status: 'warning' | 'success' | 'error';
        content?: any;
        txtHash?: string;
        obj?: any;
    }
    export default class Alert extends Module {
        private confirmModal;
        private mainContent;
        private _message;
        get message(): IMessage;
        set message(value: IMessage);
        constructor(parent?: Container, options?: any);
        init(): Promise<void>;
        closeModal(): void;
        showModal(): void;
        private buildLink;
        private renderUI;
        private onErrMsgChanged;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-buyback/data.json.ts" />
declare module "@scom/scom-buyback/data.json.ts" {
    const _default_2: {
        infuraId: string;
        networks: ({
            chainId: number;
            isMainChain: boolean;
            isCrossChainSupported: boolean;
            explorerName: string;
            explorerTxUrl: string;
            explorerAddressUrl: string;
            isTestnet: boolean;
            shortName?: undefined;
        } | {
            chainId: number;
            shortName: string;
            isCrossChainSupported: boolean;
            explorerName: string;
            explorerTxUrl: string;
            explorerAddressUrl: string;
            isTestnet: boolean;
            isMainChain?: undefined;
        })[];
        proxyAddresses: {
            "97": string;
            "43113": string;
        };
        embedderCommissionFee: string;
        defaultBuilderData: {
            defaultChainId: number;
            chainId: number;
            projectName: string;
            description: string;
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
    export default _default_2;
}
/// <amd-module name="@scom/scom-buyback/formSchema.json.ts" />
declare module "@scom/scom-buyback/formSchema.json.ts" {
    const _default_3: {
        general: {
            dataSchema: {
                type: string;
                properties: {
                    chainId: {
                        type: string;
                        enum: number[];
                        required: boolean;
                    };
                    projectName: {
                        type: string;
                        required: boolean;
                    };
                    description: {
                        type: string;
                    };
                    offerIndex: {
                        type: string;
                        required: boolean;
                    };
                    tokenIn: {
                        type: string;
                        required: boolean;
                    };
                    tokenOut: {
                        type: string;
                        required: boolean;
                    };
                    detailUrl: {
                        type: string;
                    };
                };
            };
        };
        theme: {
            dataSchema: {
                type: string;
                properties: {
                    dark: {
                        type: string;
                        properties: {
                            backgroundColor: {
                                type: string;
                                format: string;
                            };
                            fontColor: {
                                type: string;
                                format: string;
                            };
                            inputBackgroundColor: {
                                type: string;
                                format: string;
                            };
                            inputFontColor: {
                                type: string;
                                format: string;
                            };
                            secondaryColor: {
                                type: string;
                                title: string;
                                format: string;
                            };
                            secondaryFontColor: {
                                type: string;
                                title: string;
                                format: string;
                            };
                        };
                    };
                    light: {
                        type: string;
                        properties: {
                            backgroundColor: {
                                type: string;
                                format: string;
                            };
                            fontColor: {
                                type: string;
                                format: string;
                            };
                            inputBackgroundColor: {
                                type: string;
                                format: string;
                            };
                            inputFontColor: {
                                type: string;
                                format: string;
                            };
                            secondaryColor: {
                                type: string;
                                title: string;
                                format: string;
                            };
                            secondaryFontColor: {
                                type: string;
                                title: string;
                                format: string;
                            };
                        };
                    };
                };
            };
        };
    };
    export default _default_3;
}
/// <amd-module name="@scom/scom-buyback/index.css.ts" />
declare module "@scom/scom-buyback/index.css.ts" {
    export const buybackDappContainer: string;
    export const buybackComponent: string;
}
/// <amd-module name="@scom/scom-buyback" />
declare module "@scom/scom-buyback" {
    import { Module, Container, ControlElement } from '@ijstech/components';
    import '@ijstech/eth-contract';
    import { ICommissionInfo, INetworkConfig } from "@scom/scom-buyback/global/index.ts";
    import ScomCommissionFeeSetup from '@scom/scom-commission-fee-setup';
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    interface ScomBuybackElement extends ControlElement {
        lazyLoad?: boolean;
        chainId: number;
        projectName: string;
        offerIndex: number;
        description?: string;
        tokenIn: string;
        tokenOut: string;
        detailUrl?: string;
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
        private _data;
        tag: any;
        defaultEdit: boolean;
        private infoStack;
        private leftStack;
        private emptyStack;
        private $eventBus;
        private loadingElm;
        private buybackComponent;
        private buybackElm;
        private buybackAlert;
        private noCampaignSection;
        private buybackInfo;
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
        private dappContainer;
        private contractAddress;
        private rpcWalletEvents;
        private clientEvents;
        static create(options?: ScomBuybackElement, parent?: Container): Promise<ScomBuyback>;
        onHide(): void;
        private _getActions;
        getConfigurators(): ({
            name: string;
            target: string;
            getActions: (category?: string) => any;
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
            elementName?: undefined;
            getLinkParams?: undefined;
            setLinkParams?: undefined;
            bindOnChanged?: undefined;
        } | {
            name: string;
            target: string;
            elementName: string;
            getLinkParams: () => {
                data: string;
            };
            setLinkParams: (params: any) => Promise<void>;
            bindOnChanged: (element: ScomCommissionFeeSetup, callback: (data: any) => Promise<void>) => void;
            getData: () => Promise<{
                fee: string;
                chainId: number;
                projectName: string;
                pairAddress?: string;
                offerIndex: number;
                description?: string;
                tokenIn: string;
                tokenOut: string;
                detailUrl?: string;
                commissions?: ICommissionInfo[];
                wallets: IWalletPlugin[];
                networks: INetworkConfig[];
                showHeader?: boolean;
                defaultChainId?: number;
            }>;
            setData: any;
            getTag: any;
            setTag: any;
            getActions?: undefined;
        })[];
        private getData;
        private setData;
        getTag(): Promise<any>;
        private updateTag;
        private setTag;
        private updateStyle;
        private updateTheme;
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
        private registerEvent;
        private updateContractAddress;
        private refreshData;
        private refreshDappContainer;
        private refreshWidget;
        private initializeWidgetConfig;
        private get isSellDisabled();
        private getFirstAvailableBalance;
        private getSecondAvailableBalance;
        private getTokenObject;
        private handleFocusInput;
        private updateCommissionInfo;
        private firstInputChange;
        private secondInputChange;
        private updateBtnSwap;
        private onSwap;
        private onSubmit;
        private updateInput;
        private get submitButtonText();
        private initApprovalModelAction;
        getValueByKey: (key: string) => any;
        private showResultMessage;
        private connectWallet;
        private initEmptyUI;
        private renderEmpty;
        private renderBuybackCampaign;
        private renderLeftPart;
        private isEmptyData;
        init(): Promise<void>;
        render(): any;
    }
}
