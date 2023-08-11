import {
  toWeiInv,
  numberToBytes32,
  IBuybackCampaign,
} from '../global/index';
import { BigNumber } from '@ijstech/eth-wallet';
import {
  getChainNativeToken,
  getWETH,
  State
} from '../store/index';
import { Contracts } from '@scom/oswap-openswap-contract';
import { ITokenObject, tokenStore } from '@scom/scom-token-list';

const tradeFeeObj = { fee: '1', base: '1000' };

interface AllocationMap { address: string, allocation: string };

const getAddressByKey = (state: State, key: string) => {
  let Address = state.getAddresses();
  return Address[key];
}

const mapTokenObjectSet = (state: State, obj: any) => {
  let chainId = state.getChainId();
  const WETH9 = getWETH(chainId);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (!obj[key]?.address) obj[key] = WETH9;
    }
  }
  return obj;
}

const getTokenObjectByAddress = (state: State, address: string) => {
  let chainId = state.getChainId();
  if (address.toLowerCase() === getAddressByKey(state, 'WETH9')?.toLowerCase()) {
    return getWETH(chainId);
  }
  let tokenMap = tokenStore.tokenMap;
  return tokenMap[address.toLowerCase()];
}

const getPair = async (state: State, tokenA: ITokenObject, tokenB: ITokenObject) => {
  const wallet = state.getRpcWallet();
  let tokens = mapTokenObjectSet(state, { tokenA, tokenB });
  let params = { param1: tokens.tokenA.address, param2: tokens.tokenB.address };
  let factoryAddress = getAddressByKey(state, 'OSWAP_RestrictedFactory');
  let groupQ = new Contracts.OSWAP_RestrictedFactory(wallet, factoryAddress);
  return await groupQ.getPair({ ...params, param3: 0 });
}

const getGroupQueueExecuteData = (offerIndex: number | BigNumber) => {
  let indexArr = [offerIndex];
  let ratioArr = [toWeiInv('1')];
  let data = "0x" + numberToBytes32((indexArr.length * 2 + 1) * 32) + numberToBytes32(indexArr.length) + indexArr.map(e => numberToBytes32(e)).join('') + ratioArr.map(e => numberToBytes32(e)).join('');
  return data;
}

interface GuaranteedBuyBackInfo extends IBuybackCampaign {
  queueInfo: ProviderGroupQueueInfo;
}

const getGuaranteedBuyBackInfo = async (state: State, buybackCampaign: IBuybackCampaign): Promise<GuaranteedBuyBackInfo | null> => {
  let info = buybackCampaign;
  let allInfo: GuaranteedBuyBackInfo;
  if (!info) return null;
  info.tokenIn = info.tokenIn?.startsWith('0x') ? info.tokenIn.toLowerCase() : info.tokenIn;
  info.tokenOut = info.tokenOut?.startsWith('0x') ? info.tokenOut.toLowerCase() : info.tokenOut;
  if (!info.pairAddress) {
    info.pairAddress = await getPair(state, getTokenObjectByAddress(state, info.tokenIn), getTokenObjectByAddress(state, info.tokenOut));
  }
  const queueInfo = await getProviderGroupQueueInfoByIndex(
    state,
    info.pairAddress,
    info.tokenIn,
    info.offerIndex
  );

  queueInfo.offerPrice = new BigNumber(queueInfo.offerPrice).shiftedBy(getTokenObjectByAddress(state, info.tokenIn).decimals - getTokenObjectByAddress(state, info.tokenOut).decimals).toFixed();

  allInfo = {
    ...info,
    queueInfo
  }
  return allInfo;
}

interface ProviderGroupQueueInfo {
  pairAddress: string,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  offerPrice: string,
  startDate: number,
  endDate: number,
  state: string,
  allowAll: boolean,
  direct: boolean,
  offerIndex: number,
  addresses: { address: string, allocation: string }[],
  allocation: string,
  willGet: string,
  tradeFee: string,
  tokenInAvailable: string,
  available: string
}

const getProviderGroupQueueInfoByIndex = async (state: State, pairAddress: string, tokenInAddress: string, offerIndex: number): Promise<ProviderGroupQueueInfo> => {
  let wallet = state.getRpcWallet();
  let chainId = state.getChainId();
  const nativeToken = getChainNativeToken(chainId);
  const WETH9Address = getAddressByKey(state, 'WETH9');
  const oracleContract = new Contracts.OSWAP_RestrictedPair(wallet, pairAddress);
  let [token0Address, token1Address] = await Promise.all([oracleContract.token0(), oracleContract.token1()]);
  let direction: boolean;
  let tokenOut: ITokenObject;
  let tokenIn: ITokenObject;
  tokenInAddress = tokenInAddress.toLowerCase()
  token0Address = token0Address.toLowerCase()
  token1Address = token1Address.toLowerCase()
  if (token0Address == tokenInAddress) {
    direction = !(new BigNumber(token0Address).lt(token1Address));
    tokenIn = getTokenObjectByAddress(state, token0Address);
    tokenOut = getTokenObjectByAddress(state, token1Address);
  } else {
    direction = new BigNumber(token0Address).lt(token1Address);
    tokenIn = getTokenObjectByAddress(state, token1Address);
    tokenOut = getTokenObjectByAddress(state, token0Address);
  }
  let totalAllocation = new BigNumber('0');
  let [offer, addresses] = await Promise.all([
    oracleContract.offers({ param1: direction, param2: offerIndex }),
    getTradersAllocation(oracleContract, direction, offerIndex, Number(tokenIn.decimals), (address: string, allocation: string) => {
      totalAllocation = totalAllocation.plus(allocation)
    })
  ]);

  let price = toWeiInv(offer.restrictedPrice.shiftedBy(-tokenOut.decimals).toFixed()).shiftedBy(-tokenIn.decimals).toFixed();
  let amount = new BigNumber(offer.amount).shiftedBy(-Number(tokenIn.decimals)).toFixed();
  let userAllo: AllocationMap = addresses.find(v => v.address === wallet.address) || { address: wallet.address, allocation: "0" };
  let available = offer.allowAll ? amount : new BigNumber(userAllo.allocation).shiftedBy(-Number(tokenIn.decimals)).toFixed();
  let tradeFee = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
  let tokenInAvailable = new BigNumber(available).dividedBy(new BigNumber(price)).dividedBy(new BigNumber(tradeFee)).toFixed();

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
    willGet: offer.amount.times(new BigNumber(price)).shiftedBy(-Number(tokenIn.decimals)).toFixed(),
    tradeFee,
    tokenInAvailable,
    available
  }
}

async function getTradersAllocation(pair: Contracts.OSWAP_RestrictedPair, direction: boolean, offerIndex: number | BigNumber, allocationTokenDecimals: number, callbackPerRecord?: (address: string, allocation: string) => void) {
  let traderLength = (await pair.getApprovedTraderLength({ direction, offerIndex })).toNumber();
  let tasks: Promise<void>[] = [];
  let allo: AllocationMap[] = [];

  for (let i = 0; i < traderLength; i += 100) {//get trader allocation
    tasks.push(
      (async () => {
        try {
          let approvedTrader = await pair.getApprovedTrader({ direction, offerIndex, start: i, length: 100 });
          allo.push(...approvedTrader.trader.map((address, i) => {
            let allocation = new BigNumber(approvedTrader.allocation[i]).shiftedBy(-allocationTokenDecimals).toFixed();
            if (callbackPerRecord) callbackPerRecord(address, allocation);
            return { address, allocation };
          }));
        } catch (error) {
          console.log("getTradersAllocation", error);
          return;
        }
      })());
  }
  await Promise.all(tasks);
  return allo;
}

export {
  getGroupQueueExecuteData,
  getGuaranteedBuyBackInfo,
  GuaranteedBuyBackInfo,
  ProviderGroupQueueInfo
}
