import { IWalletPlugin } from '@scom/scom-wallet-modal';

export interface ICommissionInfo {
  chainId: number;
  walletAddress: string;
  share: string;
}

export enum QueueType {
  PRIORITY_QUEUE,
  RANGE_QUEUE,
  GROUP_QUEUE,
  PEGGED_QUEUE,
  OTC_QUEUE
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