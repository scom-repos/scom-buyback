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
};

export const enum EventId {
    Paid = 'Paid',
    chainChanged = 'chainChanged',
}

export * from './utils/index';
