import {
  QueueType,
  toWeiInv,
  numberToBytes32,
  IBuybackCampaign,
} from '../global/index';
import { BigNumber, IWallet, Utils, Wallet } from '@ijstech/eth-wallet';
import {
  getChainNativeToken,
  getAddresses,
  getChainId,
  getRpcWallet
} from '../store/index';
import { Contracts } from '../contracts/oswap-openswap-contract/index';
import { Contracts as AdaptorContracts } from '../contracts/oswap-oracle-adaptor-contract/index';
import { moment } from '@ijstech/components';
import { ITokenObject, WETHByChainId, tokenStore } from '@scom/scom-token-list';

export interface AllocationMap { address: string, allocation: string }

const getWETH = (chainId: number): ITokenObject => {
  let wrappedToken = WETHByChainId[chainId];
  return wrappedToken;
};

const getAddressByKey = (key: string) => {
  let Address = getAddresses(getChainId());
  return Address[key];
}

function toTokenAmount(token: any, amount: any) {
  return (BigNumber.isBigNumber(amount) ? amount : new BigNumber(amount.toString())).shiftedBy(Number(token.decimals)).decimalPlaces(0, BigNumber.ROUND_FLOOR);
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

interface GroupQueueOfferDetail {
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

const getGroupQueueItemsForTrader = async (pairAddress: string, tokenIn: any, tokenOut: any): Promise<GroupQueueOfferDetail[]> => {
  let wallet = Wallet.getClientInstance();
  let chainId = getChainId();
  const nativeToken = getChainNativeToken(chainId);
  var direction = new BigNumber(tokenIn.address.toLowerCase()).lt(tokenOut.address.toLowerCase());
  let trader = wallet.address;
  const pairContract = new Contracts.OSWAP_RestrictedPair(wallet, pairAddress);
  let traderOffer = await pairContract.getTraderOffer({ trader, direction, start: 0, length: 100 });
  let amounts = traderOffer.amountAndPrice.slice(0, traderOffer.amountAndPrice.length / 2);
  let prices = traderOffer.amountAndPrice.slice(traderOffer.amountAndPrice.length / 2, traderOffer.amountAndPrice.length);
  let startDates = traderOffer.startDateAndExpire.slice(0, traderOffer.startDateAndExpire.length / 2);
  let endDates = traderOffer.startDateAndExpire.slice(traderOffer.startDateAndExpire.length / 2, traderOffer.startDateAndExpire.length);
  let locked = traderOffer.lockedAndAllowAll.slice(0, traderOffer.lockedAndAllowAll.length);
  let queueArr: GroupQueueOfferDetail[] = [];
  let tradeFeeObj = getTradeFee(QueueType.GROUP_QUEUE);
  let tradeFee = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
  const WETH9Address = getAddressByKey('WETH9');
  const isTokenInNative = tokenIn.address.toLowerCase() == WETH9Address.toLowerCase();
  const isTokenOutNative = tokenOut.address.toLowerCase() == WETH9Address.toLowerCase();

  for (let i = 0; i < amounts.length; i++) {
    if (amounts[i].eq("0")) continue;
    let allocation = await getGroupQueueAllocation(wallet, trader, traderOffer.index[i].toNumber(), pairAddress, tokenIn, tokenOut);
    if (allocation.eq("0")) continue;
    let tokenOutAvailable = new BigNumber(amounts[i]).gt(new BigNumber(allocation)) ? allocation : amounts[i]
    let tokenInAvailable = new BigNumber(tokenOutAvailable).dividedBy(new BigNumber(prices[i])).shiftedBy(18 - tokenOut.decimals).dividedBy(new BigNumber(tradeFee)).decimalPlaces(tokenIn.decimals, 1).toFixed();
    queueArr.push({
      pairAddress,
      tokenIn: isTokenInNative ? nativeToken.symbol : tokenIn.address,
      tokenOut: isTokenOutNative ? nativeToken.symbol : tokenOut.address,
      index: traderOffer.index[i],
      provider: traderOffer.provider[i],
      amount: amounts[i],
      allocation,
      tokenInAvailable,
      price: prices[i],
      start: startDates[i].toNumber() * 1000,
      expire: endDates[i].toNumber() * 1000,
      allowAll: false,
      locked: locked[i],
      tradeFee
    });
  }
  return queueArr.filter(v => moment().isBetween(v.start, v.expire));
}

const getGroupQueueItemsForAllowAll = async (pairAddress: string, tokenIn: any, tokenOut: any): Promise<GroupQueueOfferDetail[]> => {
  let wallet = Wallet.getClientInstance();
  let chainId = getChainId();
  const nativeToken = getChainNativeToken(chainId);
  var direction = new BigNumber(tokenIn.address.toLowerCase()).lt(tokenOut.address.toLowerCase());
  const oracleContract = new Contracts.OSWAP_RestrictedPair(wallet, pairAddress);
  let allOffer = await oracleContract.getOffers({ direction, start: 0, length: 100 });
  let amounts = allOffer.amountAndPrice.slice(0, allOffer.amountAndPrice.length / 2);
  let prices = allOffer.amountAndPrice.slice(allOffer.amountAndPrice.length / 2, allOffer.amountAndPrice.length);
  let startDates = allOffer.startDateAndExpire.slice(0, allOffer.startDateAndExpire.length / 2);
  let endDates = allOffer.startDateAndExpire.slice(allOffer.startDateAndExpire.length / 2, allOffer.startDateAndExpire.length);
  let allowAll = allOffer.lockedAndAllowAll.slice(allOffer.lockedAndAllowAll.length / 2, allOffer.lockedAndAllowAll.length);
  let locked = allOffer.lockedAndAllowAll.slice(0, allOffer.lockedAndAllowAll.length);
  let queueArr: GroupQueueOfferDetail[] = [];
  let tradeFeeObj = getTradeFee(QueueType.GROUP_QUEUE);
  let tradeFee = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
  const WETH9Address = getAddressByKey('WETH9');
  const isTokenInNative = tokenIn.address.toLowerCase() == WETH9Address.toLowerCase();
  const isTokenOutNative = tokenOut.address.toLowerCase() == WETH9Address.toLowerCase();

  for (let i = 0; i < amounts.length; i++) {
    let tokenOutAvailable = amounts[i]
    let tokenInAvailable = tokenOutAvailable.dividedBy(prices[i]).shiftedBy(18 - tokenOut.decimals).dividedBy(new BigNumber(tradeFee)).decimalPlaces(tokenIn.decimals, 1).toFixed();

    queueArr.push({
      pairAddress,
      tokenIn: isTokenInNative ? nativeToken.symbol : tokenIn.address,
      tokenOut: isTokenOutNative ? nativeToken.symbol : tokenOut.address,
      index: allOffer.index[i],
      provider: allOffer.provider[i],
      amount: amounts[i],
      allocation: amounts[i],
      tokenInAvailable,
      price: prices[i],
      start: startDates[i].toNumber() * 1000,
      expire: endDates[i].toNumber() * 1000,
      allowAll: allowAll[i],
      locked: locked[i],
      tradeFee
    });
  }

  return queueArr.filter(v => (moment().isBetween(v.start, v.expire) && v.allowAll == true));
}

const getGroupQueueTraderDataObj = async (pairAddress: string, tokenIn: any, tokenOut: any, amountIn: string, offerIndex?: string) => {
  let tokens = mapTokenObjectSet({ tokenIn, tokenOut });
  let tokenAmountIn = toTokenAmount(tokens.tokenIn, amountIn).toFixed();
  let tradeFeeObj = getTradeFee(QueueType.GROUP_QUEUE);
  let tradeFee = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();
  let queueArr = await getGroupQueueItemsForTrader(pairAddress, tokens.tokenIn, tokens.tokenOut);
  let queueAll = await getGroupQueueItemsForAllowAll(pairAddress, tokens.tokenIn, tokens.tokenOut);
  queueArr = queueArr.concat(queueAll);
  queueArr = queueArr.map(v => {
    return {
      ...v,
      amountIn: new BigNumber(tokenAmountIn).shiftedBy(-tokens.tokenIn.decimals).toFixed(),
      amountOut: new BigNumber(tokenAmountIn).times(v.price).shiftedBy(-18 - Number(tokens.tokenIn.decimals) + Number(tokens.tokenOut.decimals)).times(tradeFee).toFixed()
    }
  }).filter(v => new BigNumber(v.tokenInAvailable).gte(new BigNumber(v.amountIn))).sort((a, b) => new BigNumber(b.amountOut).minus(a.amountOut).toNumber());

  if (queueArr.length == 0) {
    return {
      sufficientLiquidity: false
    }
  }

  let ratioArr = [toWeiInv('1')];
  let queueItem;
  if (offerIndex) {
    queueItem = queueArr.find(o => o.index.eq(offerIndex));
    if (!queueItem) return null;
  }
  else {
    queueItem = queueArr[0];
  }

  let indexArr = [queueItem.index];
  let amountOut = queueItem.amount; //was amountOut
  let price = new BigNumber(1).shiftedBy(18).div(queueItem.price).toFixed();
  let priceSwap = new BigNumber(queueItem.price).shiftedBy(-18).toFixed();

  let data = "0x" + numberToBytes32((indexArr.length * 2 + 1) * 32) + numberToBytes32(indexArr.length) + indexArr.map(e => numberToBytes32(e)).join('') + ratioArr.map(e => numberToBytes32(e)).join('');
  return {
    sufficientLiquidity: true,
    price: parseFloat(price),
    priceSwap: parseFloat(priceSwap),
    amountIn,
    amountOut: new BigNumber(amountOut).shiftedBy(-tokens.tokenOut.decimals).toFixed(),
    data,
    tradeFeeObj
  }
}

const getGroupQueueAllocation = async (wallet: IWallet, traderAddress: string, offerIndex: number, pairAddress: string, tokenIn: any, tokenOut: any) => {
  let direction = new BigNumber(tokenIn.address.toLowerCase()).lt(tokenOut.address.toLowerCase());
  return await new Contracts.OSWAP_RestrictedPair(wallet, pairAddress).traderAllocation({ param1: direction, param2: offerIndex, param3: traderAddress });
};

const getLatestOraclePrice = async (queueType: QueueType, token: ITokenObject, againstToken: ITokenObject) => {
  let tokens = mapTokenObjectSet({ token, againstToken });
  let wallet = Wallet.getClientInstance();
  let address = getFactoryAddress(queueType);
  let factory = new Contracts.OSWAP_OracleFactory(wallet, address);
  let oracleAdapterAddress = await factory.oracles({ param1: tokens.token.address, param2: tokens.againstToken.address });
  let price = '0';
  try {
    const oracleAdaptorContract = new AdaptorContracts.OSWAP_OracleChainlink(wallet, oracleAdapterAddress);
    price = (await oracleAdaptorContract.getLatestPrice({
      from: tokens.token.address,
      to: tokens.againstToken.address,
      payload: "0x"
    })).toFixed();
  }
  catch (err) {
    console.log("Fail to get latest price from oracle");
  }
  return price;
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
    oracleContract.getOffers({ direction, start: offerIndex, length: 1 }),
    getTradersAllocation(oracleContract, direction, offerIndex, Number(tokenIn.decimals), (address: string, allocation: string) => {
      totalAllocation = totalAllocation.plus(allocation)
    })
  ]);
  let tradeFeeObj = getTradeFee(QueueType.GROUP_QUEUE);
  let tradeFee = new BigNumber(tradeFeeObj.base).minus(tradeFeeObj.fee).div(tradeFeeObj.base).toFixed();

  let price = toWeiInv(new BigNumber(offer.amountAndPrice[1]).shiftedBy(-tokenOut.decimals).toFixed()).shiftedBy(-tokenIn.decimals).toFixed();
  let amount = new BigNumber(offer.amountAndPrice[0]).shiftedBy(-Number(tokenIn.decimals)).toFixed();
  const selectedAddress = wallet.address;
  let available = offer.lockedAndAllowAll[1] ? amount : new BigNumber(await getGroupQueueAllocation(wallet, selectedAddress, offerIndex, pairAddress, tokenOut, tokenIn)).shiftedBy(-Number(tokenIn.decimals)).toFixed();
  let tokenInAvailable = new BigNumber(available).dividedBy(new BigNumber(price)).dividedBy(new BigNumber(tradeFee)).toFixed();
  return {
    pairAddress: pairAddress.toLowerCase(),
    fromTokenAddress: tokenInAddress == WETH9Address.toLowerCase() ? nativeToken.symbol : tokenInAddress,
    toTokenAddress: tokenOut.address ? tokenOut.address.toLowerCase() == WETH9Address.toLowerCase() ? nativeToken.symbol : tokenOut.address.toLowerCase() : "",
    amount,
    offerPrice: price,
    startDate: offer.startDateAndExpire[0].times(1000).toNumber(),
    endDate: offer.startDateAndExpire[1].times(1000).toNumber(),
    state: offer.lockedAndAllowAll[0] ? 'Locked' : 'Unlocked',
    allowAll: offer.lockedAndAllowAll[1],
    direct: true,
    offerIndex,
    addresses,
    allocation: totalAllocation.toFixed(),
    willGet: new BigNumber(offer.amountAndPrice[0]).times(new BigNumber(price)).shiftedBy(-Number(tokenIn.decimals)).toFixed(),
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

const getRangeQueueData = async (pair: string, tokenA: ITokenObject, tokenB: ITokenObject, amountOut: BigNumber) => {
  let data = '0x';
  let wallet = Wallet.getClientInstance();
  let chainId = getChainId();

  if (!tokenA.address) tokenA = getWETH(chainId);
  if (!tokenB.address) tokenB = getWETH(chainId);
  let direction = (new BigNumber(tokenA.address!.toLowerCase()).lt(tokenB.address!.toLowerCase()));
  let rangePair = new Contracts.OSWAP_RangePair(wallet, pair);
  let offers = await rangePair.getOffers({
    direction,
    start: 0,
    end: 100
  });
  let amounts = offers.amountAndReserve.slice(0, offers.amountAndReserve.length / 2);
  let reserves = offers.amountAndReserve.slice(offers.amountAndReserve.length / 2, offers.amountAndReserve.length);
  let expiryDates = offers.startDateAndExpire.slice(offers.startDateAndExpire.length / 2, offers.startDateAndExpire.length);
  let lowerLimits = offers.lowerLimitAndUpperLimit.slice(0, offers.lowerLimitAndUpperLimit.length / 2);
  let upperLimits = offers.lowerLimitAndUpperLimit.slice(offers.lowerLimitAndUpperLimit.length / 2, offers.lowerLimitAndUpperLimit.length);

  if (amounts.length > 1) {
    let index = [];
    let remainingAmt = new BigNumber(amountOut);
    const priceSwap = await getLatestOraclePrice(QueueType.RANGE_QUEUE, tokenA, tokenB);
    let offerArr = [...Array(amounts.length).keys()].map(i => i + 1).map(v => {
      return {
        index: v,
        provider: offers.provider[v],
        amount: amounts[v],
        reserve: reserves[v],
        lowerLimit: lowerLimits[v],
        upperLimit: upperLimits[v],
        expire: expiryDates[v],
        privateReplenish: offers.privateReplenish[v]
      }
    }).sort((a, b) => new BigNumber(b.amount).minus(a.amount).toNumber())

    for (let i = 0; i < offerArr.length; i++) {
      let offer = offerArr[i];
      let lowerLimit = offer.lowerLimit;
      let upperLimit = offer.upperLimit;
      let expire = offer.expire.toNumber() * 1000;
      if (moment(expire).isBefore(moment())) continue;
      if (new BigNumber(lowerLimit).gt(priceSwap)) continue;
      if (new BigNumber(upperLimit).gt(0) && new BigNumber(upperLimit).lt(priceSwap)) continue;
      if (remainingAmt.gt(offer.amount)) {
        index.push(offer.index);
        remainingAmt = remainingAmt.minus(offer.amount);
      }
      else {
        index.push(offer.index);
        break;
      }
    }
    data = "0x" + Utils.numberToBytes32(0x20 * (index.length + 1)) + Utils.numberToBytes32(index.length) + index.map(e => Utils.numberToBytes32(e)).join('');
  }
  return data;
}

export {
  QueueBasicInfo,
  getRangeQueueData,
  getPair,
  getLatestOraclePrice,
  getGroupQueueTraderDataObj,
  getGuaranteedBuyBackInfo,
  GuaranteedBuyBackInfo,
  ProviderGroupQueueInfo,
}
