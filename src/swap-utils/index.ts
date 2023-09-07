import { BigNumber, Utils, TransactionReceipt, Wallet, IWallet } from '@ijstech/eth-wallet';
import { Contracts } from '@scom/oswap-openswap-contract';
import { Contracts as ProxyContracts } from '@scom/scom-commission-proxy-contract';
import { ICommissionInfo } from '../global/index';
import { State } from '../store/index';
import { getGroupQueueExecuteData } from '../buyback-utils/index';

const getHybridRouterAddress = (state: State): string => {
  let Address = state.getAddresses();
  return Address['OSWAP_HybridRouter2'];
}

const hybridTradeExactIn = async (state: State, wallet: IWallet, path: any[], pairs: string[], amountIn: string, amountOutMin: string, toAddress: string, deadline: number, feeOnTransfer: boolean, data: string, commissions?: ICommissionInfo[]) => {
  if (path.length < 2) {
    return null
  }

  let tokenIn = path[0];
  let tokenOut = path[path.length - 1];

  const hybridRouterAddress = getHybridRouterAddress(state);
  const hybridRouter = new Contracts.OSWAP_HybridRouter2(wallet, hybridRouterAddress);

  const proxyAddress = state.getProxyAddress();
  const proxy = new ProxyContracts.Proxy(wallet, proxyAddress);
  const amount = tokenIn.address ? Utils.toDecimals(amountIn.toString(), tokenIn.decimals).dp(0) : Utils.toDecimals(amountIn.toString()).dp(0);
  const _amountOutMin = Utils.toDecimals(amountOutMin, tokenOut.decimals).dp(0);
  const _commissions = (commissions || []).filter(v => v.chainId == state.getChainId()).map(v => {
    return {
      to: v.walletAddress,
      amount: amount.times(v.share).dp(0)
    }
  });
  const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)).dp(0) : new BigNumber(0);

  let receipt: TransactionReceipt;
  if (!tokenIn.address) {
    let params = {
      amountOutMin: _amountOutMin,
      pair: pairs,
      to: toAddress,
      deadline,
      data
    };
    if (_commissions.length) {
      let txData: string;
      if (feeOnTransfer) {
        txData = await hybridRouter.swapExactETHForTokensSupportingFeeOnTransferTokens.txData(params, amount);
      } else {
        txData = await hybridRouter.swapExactETHForTokens.txData(params, amount);
      }
      receipt = await proxy.proxyCall({
        target: hybridRouterAddress,
        tokensIn: [
          {
            token: Utils.nullAddress,
            amount: amount.plus(commissionsAmount),
            directTransfer: false,
            commissions: _commissions
          }
        ],
        data: txData,
        to: wallet.address,
        tokensOut: []
      })
    } else {
      if (feeOnTransfer) {
        receipt = await hybridRouter.swapExactETHForTokensSupportingFeeOnTransferTokens(params, amount);
      } else {
        receipt = await hybridRouter.swapExactETHForTokens(params, amount);
      }
    }
  } else if (!tokenOut.address) {
    let params = {
      amountIn: amount,
      amountOutMin: _amountOutMin,
      pair: pairs,
      to: toAddress,
      deadline,
      data
    };
    if (_commissions.length) {
      let txData: string;
      if (feeOnTransfer) {
        txData = await hybridRouter.swapExactTokensForETHSupportingFeeOnTransferTokens.txData(params);
      } else {
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
      })
    } else {
      if (feeOnTransfer) {
        receipt = await hybridRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(params)
      } else {
        receipt = await hybridRouter.swapExactTokensForETH(params)
      }
    }
  } else {
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
      let txData: string;
      if (feeOnTransfer) {
        txData = await hybridRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens.txData(params);
      } else {
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
      })
    } else {
      if (feeOnTransfer) {
        receipt = await hybridRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(params);
      } else {
        receipt = await hybridRouter.swapExactTokensForTokens(params);
      }
    }
  }
  return receipt;
}

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
}> = async (state: State, swapData: SwapData) => {
  let receipt: TransactionReceipt | null = null;
  const wallet = Wallet.getClientInstance();
  try {
    const toAddress = wallet.account.address;
    const slippageTolerance = state.slippageTolerance;
    const transactionDeadlineInMinutes = state.transactionDeadline;
    const transactionDeadline = Math.floor(
      Date.now() / 1000 + transactionDeadlineInMinutes * 60
    );
    if (swapData.provider === "RestrictedOracle") {
      const data = getGroupQueueExecuteData(swapData.groupQueueOfferIndex);
      if (!data) return {
        receipt: null,
        error: { message: "No data from Group Queue Trader" },
      };
      const amountOutMin = swapData.toAmount.times(1 - slippageTolerance / 100);
      receipt = await hybridTradeExactIn(
        state,
        wallet,
        swapData.routeTokens,
        swapData.pairs,
        swapData.fromAmount.toString(),
        amountOutMin.toString(),
        toAddress,
        transactionDeadline,
        false,
        data,
        swapData.commissions
      );
    }
  } catch (error) {
    return { receipt: null, error: error as any };
  }
  return { receipt, error: null };
};

const getProxySelectors = async (state: State, chainId: number): Promise<string[]> => {
  const wallet = state.getRpcWallet();
  await wallet.init();
  if (wallet.chainId != chainId) await wallet.switchNetwork(chainId);
  const hybridRouterAddress = getHybridRouterAddress(state);
  const hybridRouter = new Contracts.OSWAP_HybridRouter2(wallet, hybridRouterAddress);
  const permittedProxyFunctions: (keyof Contracts.OSWAP_HybridRouter2)[] = [
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
}

export {
  SwapData,
  executeSwap,
  getHybridRouterAddress,
  getProxySelectors
}