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
    IsWalletConnected = 'isWalletConnected',
    IsWalletDisconnected = 'IsWalletDisconnected',
    Paid = 'Paid',
    chainChanged = 'chainChanged',
    EmitButtonStatus = 'buybackEmitButtonStatus',
    EmitInput = 'buybackEmitInput',
    EmitNewToken = 'emitNewToken',
}

export * from './utils/index';
