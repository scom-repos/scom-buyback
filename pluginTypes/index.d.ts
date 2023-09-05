/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-commission-proxy-contract/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-token-input/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-token-input/@scom/scom-token-modal/@ijstech/eth-wallet/index.d.ts" />
/// <amd-module name="@scom/scom-buyback/global/utils/helper.ts" />
declare module "@scom/scom-buyback/global/utils/helper.ts" {
    import { BigNumber } from '@ijstech/eth-wallet';
    export const DefaultDateFormat = "DD/MM/YYYY hh:mm:ss";
    export const formatDate: (date: any, customType?: string, showTimezone?: boolean) => string;
    export const formatNumber: (value: any, decimals?: number) => string;
    export const formatNumberWithSeparators: (value: number, precision?: number) => string;
    export const isInvalidInput: (val: any) => boolean;
    export const limitInputNumber: (input: any, decimals?: number) => void;
    export const limitDecimals: (value: any, decimals: number) => any;
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
        tokenOut: string;
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
/// <amd-module name="@scom/scom-buyback/store/index.ts" />
declare module "@scom/scom-buyback/store/index.ts" {
    export const fallBackUrl: string;
    export * from "@scom/scom-buyback/store/utils.ts";
}
/// <amd-module name="@scom/scom-buyback/buyback-utils/index.ts" />
declare module "@scom/scom-buyback/buyback-utils/index.ts" {
    import { IBuybackCampaign } from "@scom/scom-buyback/global/index.ts";
    import { BigNumber } from '@ijstech/eth-wallet';
    import { State } from "@scom/scom-buyback/store/index.ts";
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
    export { getGroupQueueExecuteData, getGuaranteedBuyBackInfo, GuaranteedBuyBackInfo, ProviderGroupQueueInfo };
}
/// <amd-module name="@scom/scom-buyback/swap-utils/index.ts" />
declare module "@scom/scom-buyback/swap-utils/index.ts" {
    import { BigNumber, TransactionReceipt } from '@ijstech/eth-wallet';
    import { ICommissionInfo } from "@scom/scom-buyback/global/index.ts";
    import { State } from "@scom/scom-buyback/store/index.ts";
    const getHybridRouterAddress: (state: State) => string;
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
    export { SwapData, executeSwap, getHybridRouterAddress };
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
        };
        embedderCommissionFee: string;
        defaultBuilderData: {
            defaultChainId: number;
            chainId: number;
            title: string;
            logo: string;
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
/// <amd-module name="@scom/scom-buyback/formSchema.ts" />
declare module "@scom/scom-buyback/formSchema.ts" {
    import ScomNetworkPicker from '@scom/scom-network-picker';
    import ScomTokenInput from '@scom/scom-token-input';
    const _default_2: {
        dataSchema: {
            type: string;
            properties: {
                title: {
                    type: string;
                };
                logo: {
                    type: string;
                    format: string;
                };
                offerIndex: {
                    type: string;
                    required: boolean;
                };
                chainId: {
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
                    };
                };
            };
        };
        uiSchema: {
            type: string;
            elements: ({
                type: string;
                label: string;
                elements: {
                    type: string;
                    elements: {
                        type: string;
                        scope: string;
                    }[];
                }[];
            } | {
                type: string;
                label: string;
                elements: {
                    type: string;
                    elements: {
                        type: string;
                        label: string;
                        scope: string;
                    }[];
                }[];
            })[];
        };
        customControls(rpcWalletId: string): {
            "#/properties/chainId": {
                render: () => ScomNetworkPicker;
                getData: (control: ScomNetworkPicker) => number;
                setData: (control: ScomNetworkPicker, value: number) => void;
            };
            "#/properties/tokenIn": {
                render: () => ScomTokenInput;
                getData: (control: ScomTokenInput) => string;
                setData: (control: ScomTokenInput, value: string) => void;
            };
            "#/properties/tokenOut": {
                render: () => ScomTokenInput;
                getData: (control: ScomTokenInput) => string;
                setData: (control: ScomTokenInput, value: string) => void;
            };
        };
    };
    export default _default_2;
}
/// <amd-module name="@scom/scom-buyback/index.css.ts" />
declare module "@scom/scom-buyback/index.css.ts" {
    export const buybackDappContainer: string;
    export const buybackComponent: string;
}
/// <amd-module name="@scom/scom-buyback" />
declare module "@scom/scom-buyback" {
    import { Module, Container, ControlElement } from '@ijstech/components';
    import { IBuybackCampaign, ICommissionInfo, INetworkConfig } from "@scom/scom-buyback/global/index.ts";
    import ScomCommissionFeeSetup from '@scom/scom-commission-fee-setup';
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    interface ScomBuybackElement extends ControlElement {
        lazyLoad?: boolean;
        chainId: number;
        title?: string;
        logo?: string;
        offerIndex: number;
        tokenIn: string;
        tokenOut: string;
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
        private _data;
        tag: any;
        defaultEdit: boolean;
        private infoStack;
        private topStack;
        private bottomStack;
        private emptyStack;
        private loadingElm;
        private txStatusModal;
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
        static create(options?: ScomBuybackElement, parent?: Container): Promise<ScomBuyback>;
        onHide(): void;
        removeRpcWalletEvents(): void;
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
                tokenOut: string;
                commissions?: ICommissionInfo[];
                wallets: IWalletPlugin[];
                networks: INetworkConfig[];
                showHeader?: boolean;
                defaultChainId?: number;
            };
            setData: (properties: IBuybackCampaign, linkParams?: Record<string, any>) => Promise<void>;
            getTag: any;
            setTag: any;
            getActions?: undefined;
        })[];
        private getData;
        private resetRpcWallet;
        private setData;
        getTag(): Promise<any>;
        private updateTag;
        private setTag;
        private updateStyle;
        private updateTheme;
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
        private refreshData;
        private refreshDappContainer;
        private refreshWidget;
        private initializeWidgetConfig;
        private initWallet;
        private get isSwapDisabled();
        private getFirstAvailableBalance;
        private getSecondAvailableBalance;
        private getTokenObject;
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
        private getValueByKey;
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
