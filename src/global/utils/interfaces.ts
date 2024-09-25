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