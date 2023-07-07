import { Wallet, BigNumber, Utils, TransactionReceipt } from '@ijstech/eth-wallet';
import { Contracts } from '../contracts/oswap-openswap-contract/index';
import { Contracts as ProxyContracts } from '../contracts/scom-commission-proxy-contract/index';

import {
  QueueType,
  ITokenObject,
  IERC20ApprovalEventOptions,
  ERC20ApprovalModel,
  ICommissionInfo,
} from '../global/index';

import {
  Market,
  CoreContractAddressesByChainId,
  getSlippageTolerance,
  getTransactionDeadline,
  getChainId,
  getProxyAddress,
} from '../store/index';

import { getRangeQueueData, getGroupQueueTraderDataObj } from '../buyback-utils/index';
import { WETHByChainId } from '@scom/scom-token-list';

interface TradeFee {
  fee: string
  base: string
}

const RouterV1 = "OAXDEX_RouterV1";
const Router = "OAXDEX_Router";

function getAddresses() {
  return CoreContractAddressesByChainId[getChainId()] || {};
}

const getWETH = (): ITokenObject => {
  return WETHByChainId[getChainId()];
}

const getWrappedTokenAddress = (): string => {
  return getWETH().address!;
}

const getHybridRouterAddress = (): string => {
  let Address = getAddresses();
  return Address['OSWAP_HybridRouter2'];
}

function getRouterAddress(market: Market): string {
  let Address = getAddresses();
  switch (market) {
    case Market.OPENSWAP:
      return Address[Router];
    case Market.UNISWAP:
      return Address.UniswapV2Router02;
    case Market.SUSHISWAP:
      return Address.SushiSwapV2Router02;
    case Market.PANCAKESWAPV1:
      return Address.PancakeSwapRouterV1;
    case Market.PANCAKESWAP:
      return Address.PancakeSwapRouter;
    case Market.BAKERYSWAP:
      return Address.BakerySwapRouter;
    case Market.BURGERSWAP:
      return Address.BurgerSwapRouter;
    case Market.IFSWAPV1:
      return Address.IFSwapRouterV1;
    case Market.OPENSWAPV1:
      return Address[RouterV1];
    case Market.QUICKSWAP:
      return Address.QuickSwapRouter;
    case Market.BISWAP:
      return Address.BiSwapRouter;
    case Market.PANGOLIN:
      return Address.PangolinRouter;
    case Market.TRADERJOE:
      return Address.TraderJoeRouter;
    case Market.SPIRITSWAP:
      return Address.SpiritSwapRouter;
    case Market.SPOOKYSWAP:
      return Address.SpookySwapRouter;
    case Market.IFSWAPV3:
      return Address.IFSwapRouterV3;
    default:
      return Address[Router];
  }
}

const calculateAmountInByTradeFee = (tradeFeeMap: any, pairInfo: any, amountOut: string) => {
  let tradeFeeObj = tradeFeeMap[pairInfo.market];
  let feeMultiplier = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee);
  if (pairInfo.reserveB.lte(amountOut)) {
    return null;
  }
  let amtIn = new BigNumber(pairInfo.reserveA).times(amountOut).times(tradeFeeObj.base).idiv(new BigNumber(pairInfo.reserveB.minus(amountOut)).times(feeMultiplier)).plus(1).toFixed();
  return amtIn;
}

const getPathsByTokenIn = (tradeFeeMap: any, pairInfoList: any[], routeObj: any, tokenIn: ITokenObject) => {
  let routeObjList: any[] = [];
  let listItems = pairInfoList.filter(v => v.tokenOut.address == routeObj.route[routeObj.route.length - 1].address && routeObj.route.every((n: any) => n.address != v.tokenIn.address));

  let getNewAmmRouteObj = (pairInfo: any, routeObj: any, amountOut: string) => {
    let amtIn = calculateAmountInByTradeFee(tradeFeeMap, pairInfo, amountOut);
    if (!amtIn) return null;
    let newRouteObj = {
      pairs: [...routeObj.pairs, pairInfo.pair],
      market: [...routeObj.market, pairInfo.market],
      customDataList: [...routeObj.customDataList, {
        reserveA: pairInfo.reserveA,
        reserveB: pairInfo.reserveB
      }],
      route: [...routeObj.route, pairInfo.tokenIn],
      amounts: [...routeObj.amounts, amtIn]
    }
    return newRouteObj;
  }

  let getNewQueueRouteObj = (pairInfo: any, routeObj: any, amountOut: string) => {
    let tradeFeeObj = tradeFeeMap[pairInfo.market];
    let tradeFeeFactor = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
    let amtIn = new BigNumber(amountOut).shiftedBy(18 - Number(pairInfo.tokenOut.decimals)).div(pairInfo.priceSwap).shiftedBy(pairInfo.tokenIn.decimals).div(tradeFeeFactor).toFixed()
    let sufficientLiquidity = new BigNumber(pairInfo.totalLiquidity).gt(amountOut);
    if (!sufficientLiquidity) return null
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
    }
    return newRouteObj;
  }

  for (let i = 0; i < listItems.length; i++) {
    let listItem = listItems[i];
    let lastAmtIn = routeObj.amounts[routeObj.amounts.length - 1];
    let newRouteObj = listItem.market == Market.MIXED_QUEUE ? getNewQueueRouteObj(listItem, routeObj, lastAmtIn) : getNewAmmRouteObj(listItem, routeObj, lastAmtIn);
    if (!newRouteObj) continue;
    if (listItem.tokenIn.address == tokenIn.address) {
      routeObjList.push(newRouteObj);
      break;
    }
    else {
      if (newRouteObj.route.length >= 4) continue;
      let childPaths = getPathsByTokenIn(tradeFeeMap, pairInfoList, { ...newRouteObj }, tokenIn);
      routeObjList.push(...childPaths);
    }
  }
  return routeObjList;
}

const getHybridAmountsOut = async (wallet: Wallet, amountIn: BigNumber, tokenIn: string, pair: string[], data: string = '0x') => {
  let result
  try {
    let Address = getAddresses();
    let hybridRouter = new Contracts.OSWAP_HybridRouter2(wallet as any, Address['OSWAP_HybridRouter2']);
    result = await hybridRouter.getAmountsOutStartsWith({
      amountIn,
      pair,
      tokenIn,
      data
    })
  }
  catch (err) {
    console.log('getHybrid2AmountsOut', err)
  }
  return result;
}

const hybridTradeExactIn = async (wallet: Wallet, bestSmartRoute: any[], path: any[], pairs: string[], amountIn: string, amountOutMin: string, toAddress: string, deadline: number, feeOnTransfer: boolean, data: string, commissions?: ICommissionInfo[], callback?: any, confirmationCallback?: any) => {
  if (path.length < 2) {
    return null;
  }

  let tokenIn = path[0];
  let tokenOut = path[path.length - 1];

  if (bestSmartRoute && bestSmartRoute.length > 0) {
    let pairIndex = bestSmartRoute.findIndex(n => n.queueType == QueueType.RANGE_QUEUE);
    if (pairIndex != -1) {
      if (bestSmartRoute[pairIndex].orderIds) {
        let orderIds: number[] = bestSmartRoute[pairIndex].orderIds;
        data = "0x" + Utils.numberToBytes32(0x20 * (orderIds.length + 1)) + Utils.numberToBytes32(orderIds.length) + orderIds.map(e => Utils.numberToBytes32(e)).join('');
      }
      else {
        let amountInTokenAmount = Utils.toDecimals(amountIn, tokenIn.decimals).dp(0);
        let tokenInAddress = tokenIn.address ? tokenIn.address : getWrappedTokenAddress();
        let amountsOutObj = await getHybridAmountsOut(wallet, amountInTokenAmount, tokenInAddress, pairs);
        if (!amountsOutObj) return null;
        let pair = pairs[pairIndex];
        let tokenA = path[pairIndex];
        let tokenB = path[pairIndex + 1];
        let rangeAmountOut = amountsOutObj[pairIndex + 1];
        data = await getRangeQueueData(pair, tokenA, tokenB, rangeAmountOut);
      }
    }
  }

  const hybridRouterAddress = getHybridRouterAddress();
  const hybridRouter = new Contracts.OSWAP_HybridRouter2(wallet, hybridRouterAddress);

  const proxyAddress = getProxyAddress();
  const proxy = new ProxyContracts.Proxy(wallet, proxyAddress);
  const amount = tokenIn.address ? Utils.toDecimals(amountIn.toString(), tokenIn.decimals).dp(0) : Utils.toDecimals(amountIn.toString()).dp(0);
  const _amountOutMin = Utils.toDecimals(amountOutMin, tokenOut.decimals).dp(0);
  const _commissions = (commissions || []).filter(v => v.chainId == getChainId()).map(v => {
    return {
      to: v.walletAddress,
      amount: amount.times(v.share).dp(0)
    }
  });
  const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)).dp(0) : new BigNumber(0);

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
}> = async (swapData: SwapData) => {
  let receipt: TransactionReceipt | null = null;
  const wallet = Wallet.getClientInstance() as any;
  try {
    const toAddress = wallet.account.address;
    const slippageTolerance = getSlippageTolerance();
    const transactionDeadlineInMinutes = getTransactionDeadline();
    const transactionDeadline = Math.floor(
      Date.now() / 1000 + transactionDeadlineInMinutes * 60
    );
    if (swapData.provider === "RestrictedOracle") {
      const obj = await getGroupQueueTraderDataObj(
        swapData.pairs[0],
        swapData.routeTokens[0],
        swapData.routeTokens[1],
        swapData.fromAmount.toString(),
        swapData.groupQueueOfferIndex?.toString()
      );
      if (!obj || !obj.data)
        return {
          receipt: null,
          error: { message: "No data from Group Queue Trader" },
        };
      const data = obj.data;
      const amountOutMin = swapData.toAmount.times(1 - slippageTolerance / 100);
      receipt = await hybridTradeExactIn(
        wallet,
        swapData.bestSmartRoute,
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

var approvalModel: ERC20ApprovalModel;

const getApprovalModelAction = async (options: IERC20ApprovalEventOptions) => {
  const approvalOptions = {
    ...options,
    spenderAddress: ''
  };
  approvalModel = new ERC20ApprovalModel(approvalOptions);
  let approvalModelAction = approvalModel.getAction();
  return approvalModelAction;
}

const setApprovalModalSpenderAddress = (market: Market, contractAddress?: string) => {
  let spender;
  if (contractAddress) {
    spender = contractAddress
  } else {
    if (market == Market.HYBRID || market == Market.MIXED_QUEUE || market == Market.PEGGED_QUEUE || market == Market.GROUP_QUEUE) {
      spender = getHybridRouterAddress();
    }
    else {
      spender = getRouterAddress(market);
    }
  }
  approvalModel.spenderAddress = spender;
}

export {
  SwapData,
  executeSwap,
  getRouterAddress,
  getHybridRouterAddress,
  getApprovalModelAction,
  setApprovalModalSpenderAddress
}