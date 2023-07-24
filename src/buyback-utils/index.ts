import {
  QueueType,
  toWeiInv,
  numberToBytes32,
  IBuybackCampaign,
} from '../global/index';
import { BigNumber } from '@ijstech/eth-wallet';
import {
  getChainNativeToken,
  getAddresses,
  getChainId,
  getRpcWallet,
  getWETH
} from '../store/index';
import { Contracts } from '../contracts/oswap-openswap-contract/index';
import { ITokenObject, tokenStore } from '@scom/scom-token-list';

export interface AllocationMap { address: string, allocation: string }

const getAddressByKey = (key: string) => {
  let Address = getAddresses(getChainId());
  return Address[key];
}

const mapTokenObjectSet = (obj: any) => {
  let chainId = getChainId();
  const WETH9 = getWETH(chainId);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (!obj[key]?.address) obj[key] = WETH9;
    }
  }
  return obj;
}

const getTokenObjectByAddress = (address: string) => {
  let chainId = getChainId();
  if (address.toLowerCase() === getAddressByKey('WETH9').toLowerCase()) {
    return getWETH(chainId);
  }
  let tokenMap = tokenStore.tokenMap;
  return tokenMap[address.toLowerCase()];
}

const getFactoryAddress = (queueType: QueueType) => {
  switch (queueType) {
    case QueueType.PRIORITY_QUEUE:
      return getAddressByKey("OSWAP_OracleFactory");
    case QueueType.RANGE_QUEUE:
      return getAddressByKey("OSWAP_RangeFactory");
    case QueueType.PEGGED_QUEUE:
      return getAddressByKey("OSWAP_PeggedOracleFactory");
    case QueueType.GROUP_QUEUE:
      return getAddressByKey("OSWAP_RestrictedFactory");
  }
}

const getTradeFee = (queueType: QueueType) => {
  switch (queueType) {
    case QueueType.PRIORITY_QUEUE:
    case QueueType.RANGE_QUEUE:
    case QueueType.GROUP_QUEUE:
      return { fee: "1", base: "1000" };
    case QueueType.PEGGED_QUEUE:
      return { fee: "1", base: "1000" };
  }
}

const getPair = async (queueType: QueueType, tokenA: any, tokenB: any) => {
  const wallet = getRpcWallet();
  let tokens = mapTokenObjectSet({ tokenA, tokenB });
  let params = { param1: tokens.tokenA.address, param2: tokens.tokenB.address };
  let factoryAddress = getFactoryAddress(queueType);
  switch (queueType) {
    case QueueType.PEGGED_QUEUE:
    case QueueType.PRIORITY_QUEUE:
      let priorityQ = new Contracts.OSWAP_OracleFactory(wallet, factoryAddress);
      return await priorityQ.getPair(params);
    case QueueType.RANGE_QUEUE:
      let rangeQ = new Contracts.OSWAP_RangeFactory(wallet, factoryAddress);
      return await rangeQ.getPair(params);
    case QueueType.GROUP_QUEUE:
      let groupQ = new Contracts.OSWAP_RestrictedFactory(wallet, factoryAddress);
      return await groupQ.getPair({ ...params, param3: 0 });
  }
}
/*
interface GroupQueueOffer {
  pairAddress: string,
  tokenIn: string,
  tokenOut: string,
  index: BigNumber,
  provider: string,
  amount: BigNumber,
  allocation: BigNumber,
  tokenInAvailable: string,
  price: BigNumber,
  start: number,
  expire: number,
  allowAll: boolean,
  locked: boolean,
  tradeFee: string,
}
interface GroupQueueOfferDetail extends GroupQueueOffer {
  amountIn:string,
  amountOut:string,
}

async function getGroupQueueOffer(pairAddress: string, tokenIn: ITokenObject, tokenOut: ITokenObject, offerIndex: number|BigNumber):Promise<GroupQueueOffer> {
  let wallet = Wallet.getClientInstance();
  let chainId = wallet.chainId;

  var direction = new BigNumber(tokenIn.address.toLowerCase()).lt(tokenOut.address.toLowerCase());
  const pairContract = new Contracts.OSWAP_RestrictedPair(wallet, pairAddress);
  try {
    let traderOffer = await pairContract.offers({param1:direction, param2:offerIndex});
    //assuming if allowAll, allocation for anyone is 0
    let allocation = new BigNumber("0");
    if (!traderOffer.allowAll) allocation = await pairContract.traderAllocation({ param1: direction, param2: offerIndex, param3: wallet.address });
    let tokenOutAvailable = (!traderOffer.allowAll && traderOffer.amount.gt(allocation))? allocation : traderOffer.amount
    
    let tradeFeeObj = getTradeFee(QueueType.GROUP_QUEUE);
    let tradeFee = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
    let tokenInAvailable = tokenOutAvailable.dividedBy(traderOffer.restrictedPrice).shiftedBy(18 - tokenOut.decimals).dividedBy(new BigNumber(tradeFee)).decimalPlaces(tokenIn.decimals, 1).toFixed();
    const WETH9Address = getAddressByKey('WETH9');
    const isTokenInNative =  tokenIn.address.toLowerCase() == WETH9Address.toLowerCase();
    const isTokenOutNative = tokenOut.address.toLowerCase() == WETH9Address.toLowerCase();
    const nativeToken = getChainNativeToken(chainId);
  
    return {
      pairAddress,
      tokenIn: isTokenInNative ? nativeToken.symbol : tokenIn.address,
      tokenOut: isTokenOutNative ? nativeToken.symbol : tokenOut.address,
      index: new BigNumber(offerIndex),
      provider: traderOffer.provider,
      amount: traderOffer.amount,
      allocation, //will be 0 if allowAll
      tokenInAvailable,
      price: traderOffer.restrictedPrice,
      start: traderOffer.startDate.shiftedBy(3).toNumber(),
      expire: traderOffer.expire.shiftedBy(3).toNumber(),
      allowAll: traderOffer.allowAll,
      locked: traderOffer.locked,
      tradeFee
    }
  } catch (error) { // most likely error in pairContract.offers
    return null;
  }
}
*/
const getGroupQueueExecuteData = (offerIndex: number|BigNumber) => {
  let indexArr = [offerIndex];
  let ratioArr = [toWeiInv('1')];
  let data = "0x" + numberToBytes32((indexArr.length * 2 + 1) * 32) + numberToBytes32(indexArr.length) + indexArr.map(e => numberToBytes32(e)).join('') + ratioArr.map(e => numberToBytes32(e)).join('');
  return data;
}

interface GuaranteedBuyBackInfo extends IBuybackCampaign {
  queueInfo: ProviderGroupQueueInfo;
}

const getGuaranteedBuyBackInfo = async (buybackCampaign: IBuybackCampaign): Promise<GuaranteedBuyBackInfo | null> => {
  let info = buybackCampaign;
  let allInfo: GuaranteedBuyBackInfo;
  if (!info) return null;
  info.tokenIn = info.tokenIn?.startsWith('0x') ? info.tokenIn.toLowerCase() : info.tokenIn;
  info.tokenOut = info.tokenOut?.startsWith('0x') ? info.tokenOut.toLowerCase() : info.tokenOut;
  if (!info.pairAddress) {
    info.pairAddress = await getPair(QueueType.GROUP_QUEUE, getTokenObjectByAddress(info.tokenIn), getTokenObjectByAddress(info.tokenOut));
  }
  const queueInfo = await getProviderGroupQueueInfoByIndex(
    info.pairAddress,
    info.tokenIn,
    info.offerIndex
  );

  queueInfo.offerPrice = new BigNumber(queueInfo.offerPrice).shiftedBy(getTokenObjectByAddress(info.tokenIn).decimals - getTokenObjectByAddress(info.tokenOut).decimals).toFixed();

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

const getProviderGroupQueueInfoByIndex = async (pairAddress: string, tokenInAddress: string, offerIndex: number): Promise<ProviderGroupQueueInfo> => {
  let wallet = getRpcWallet();
  let chainId = getChainId();
  const nativeToken = getChainNativeToken(chainId);
  const WETH9Address = getAddressByKey('WETH9');
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
    tokenIn = getTokenObjectByAddress(token0Address);
    tokenOut = getTokenObjectByAddress(token1Address);
  } else {
    direction = new BigNumber(token0Address).lt(token1Address);
    tokenIn = getTokenObjectByAddress(token1Address);
    tokenOut = getTokenObjectByAddress(token0Address);
  }
  let totalAllocation = new BigNumber('0');
  let [offer, addresses] = await Promise.all([
    oracleContract.offers({ param1:direction, param2: offerIndex}),
    getTradersAllocation(oracleContract, direction, offerIndex, Number(tokenIn.decimals), (address: string, allocation: string) => {
      totalAllocation = totalAllocation.plus(allocation)
    })
  ]);

  let price = toWeiInv(offer.restrictedPrice.shiftedBy(-tokenOut.decimals).toFixed()).shiftedBy(-tokenIn.decimals).toFixed();
  let amount = new BigNumber(offer.amount).shiftedBy(-Number(tokenIn.decimals)).toFixed();
  let userAllo:AllocationMap  = addresses.find(v=>v.address===wallet.address) || {address: wallet.address,allocation:"0"};
  let available = offer.allowAll ? amount : new BigNumber(userAllo.allocation).shiftedBy(-Number(tokenIn.decimals)).toFixed();
  let tradeFeeObj = getTradeFee(QueueType.GROUP_QUEUE);
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

interface QueueBasicInfo {
  firstToken: string,
  secondToken: string,
  queueSize: BigNumber,
  topStake: BigNumber | undefined,
  totalOrder: BigNumber,
  totalStake: BigNumber | undefined,
  pairAddress: string,
  isOdd: boolean,
}

export {
  QueueBasicInfo,
  getPair,
  getGroupQueueExecuteData,
  getGuaranteedBuyBackInfo,
  GuaranteedBuyBackInfo,
  ProviderGroupQueueInfo,
}
