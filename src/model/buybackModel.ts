import { moment } from "@ijstech/components";
import { ITokenObject, tokenStore } from "@scom/scom-token-list";
import { BigNumber } from "@ijstech/eth-contract";
import { IBuybackCampaign, ICommissionInfo } from "../global/index";
import { executeSwap } from "../swap-utils/index";
import { getGuaranteedBuyBackInfo, GuaranteedBuyBackInfo } from "../buyback-utils/index";
import { State } from "../store/index";
import { CUSTOM_TOKEN } from "@scom/scom-token-input";

export class BuybackModel {
  private state: State;
  private _buybackInfo: GuaranteedBuyBackInfo;

  constructor(state: State) {
    this.state = state;
  }

  get chainId() {
    return this.state.getChainId();
  }

  set buybackInfo(value: GuaranteedBuyBackInfo) {
    this._buybackInfo = value;
  }

  get buybackInfo() {
    return this._buybackInfo;
  }

  get isExpired() {
    if (!this.buybackInfo) return null;
    const info = this.buybackInfo.queueInfo;
    if (!info?.endDate) return null;
    return moment().isAfter(moment(info.endDate));
  }

  get isUpcoming() {
    if (!this.buybackInfo) return null;
    const info = this.buybackInfo.queueInfo;
    if (!info?.startDate) return null;
    return moment().isBefore(moment(info.startDate));
  }

  get isSwapDisabled() {
    if (!this.buybackInfo) return true;
    const info = this.buybackInfo.queueInfo;
    if (!info) return true;
    const { startDate, endDate, allowAll, isApprovedTrader } = info;
    const isUpcoming = moment().isBefore(moment(startDate));
    const isExpired = moment().isAfter(moment(endDate));
    if (isUpcoming || isExpired) {
      return true;
    }
    if (!allowAll) {
      return !isApprovedTrader;
    }
    return false;
  }

  get firstAvailableBalance() {
    const tokenBalances = tokenStore.getTokenBalancesByChainId(this.chainId);
    if (!this.buybackInfo || this.isSwapDisabled || !tokenBalances) {
      return '0';
    }
    const { queueInfo } = this.buybackInfo;
    const { available, offerPrice, tradeFee, amount } = queueInfo;
    const tokenBalance = new BigNumber(tokenBalances[this.getValueByKey('toTokenAddress')]);
    const balance = new BigNumber(available).times(offerPrice).dividedBy(tradeFee);
    const amountIn = new BigNumber(amount).times(offerPrice).dividedBy(tradeFee);
    return (BigNumber.minimum(balance, tokenBalance, amountIn)).toFixed();
  }

  get secondAvailableBalance() {
    if (!this.buybackInfo || !this.buybackInfo.queueInfo) {
      return '0';
    }
    const { queueInfo } = this.buybackInfo;
    const { offerPrice, tradeFee } = queueInfo;
    return new BigNumber(this.firstAvailableBalance).dividedBy(offerPrice).times(tradeFee).toFixed();
  }

  get firstTokenObject() {
    return this.getTokenObject('fromTokenAddress');
  }

  get secondTokenObject() {
    return this.getTokenObject('toTokenAddress');
  }

  get firstTokenBalance() {
    return this.getTokenBalace(this.firstTokenObject);
  }

  get secondTokenBalance() {
    return this.getTokenBalace(this.secondTokenObject);
  }

  get offerPrice() {
    return this.getValueByKey('offerPrice');
  }

  getAvailable = (commissions: ICommissionInfo[]) => {
    const firstAvailable = this.firstAvailableBalance;
    let totalAmount = new BigNumber(this.secondTokenBalance);
    const commissionAmount = this.state.getCommissionAmount(commissions, totalAmount);
    if (commissionAmount.gt(0)) {
      const totalFee = totalAmount.plus(commissionAmount).dividedBy(totalAmount);
      totalAmount = totalAmount.dividedBy(totalFee);
    }
    return totalAmount.gt(firstAvailable) ? firstAvailable : totalAmount;
  }

  getSubmitButtonText(isApproveButtonShown: boolean, isSubmitting: boolean, firstValue: number, secondValue: number, commissions: ICommissionInfo[]) {
    if (!this.state.isRpcWalletConnected()) {
      return 'Switch Network';
    }
    if (this.isUpcoming) {
      return 'Upcoming';
    }
    if (this.isExpired) {
      return 'Expired';
    }
    if (isApproveButtonShown) {
      return isSubmitting ? 'Approving' : 'Approve';
    }
    const firstVal = new BigNumber(firstValue);
    const secondVal = new BigNumber(secondValue);
    if (firstVal.lt(0) || secondVal.lt(0)) {
      return 'Amount must be greater than 0';
    }
    if (this.buybackInfo) {
      const firstMaxVal = new BigNumber(this.firstAvailableBalance);
      const secondMaxVal = new BigNumber(this.secondAvailableBalance);

      const commissionAmount = this.state.getCommissionAmount(commissions, firstVal);
      const tokenBalances = tokenStore.getTokenBalancesByChainId(this.chainId);
      const balance = new BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
      const total = firstVal.plus(commissionAmount);

      if (firstVal.gt(firstMaxVal) || secondVal.gt(secondMaxVal) || total.gt(balance)) {
        return 'Insufficient amount available';
      }
    }
    if (isSubmitting) {
      return 'Swapping';
    }
    return 'Swap';
  }

  executeSwap = async (fromAmount: BigNumber, toAmount: BigNumber, commissions: ICommissionInfo[]) => {
    const { pairAddress, offerIndex } = this.buybackInfo.queueInfo;
    const firstToken = this.secondTokenObject;
    const secondToken = this.firstTokenObject;
    const params = {
      provider: "RestrictedOracle",
      routeTokens: [firstToken, secondToken],
      bestSmartRoute: [firstToken, secondToken],
      pairs: [pairAddress],
      fromAmount,
      toAmount,
      isFromEstimated: false,
      groupQueueOfferIndex: offerIndex,
      commissions
    }
    const data = await executeSwap(this.state, params);
    return data;
  }

  fetchGuaranteedBuyBackInfo = async (data: IBuybackCampaign) => {
    const { tokenIn, tokenOut, customTokenIn, customTokenOut } = data;
    const isCustomTokenIn = tokenIn?.toLowerCase() === CUSTOM_TOKEN.address.toLowerCase();
    const isCustomTokenOut = tokenOut?.toLowerCase() === CUSTOM_TOKEN.address.toLowerCase();
    const buybackInfo = await getGuaranteedBuyBackInfo(this.state, {
      ...data,
      tokenIn: isCustomTokenIn ? (customTokenIn?.toLowerCase() === 'native token' ? null : customTokenIn) : tokenIn,
      tokenOut: isCustomTokenOut ? (customTokenOut?.toLowerCase() === 'native token' ? null : customTokenOut) : tokenOut
    });
    this._buybackInfo = buybackInfo;
    return buybackInfo;
  }

  getValueByKey = (key: string) => {
    const item = this.buybackInfo;
    if (!item?.queueInfo) return null;
    return item.queueInfo[key];
  }

  isEmptyData(value: IBuybackCampaign) {
    return !value || !value.chainId || !value.offerIndex;
  }

  private getTokenObject = (key: string) => {
    const chainId = this.chainId;
    const tokenMap = tokenStore.getTokenMapByChainId(chainId);
    const tokenAddress = this.getValueByKey(key);
    if (tokenAddress && tokenMap) {
      let token = tokenMap[tokenAddress.toLowerCase()];
      if (!token) {
        token = tokenMap[tokenAddress];
      }
      return token;
    }
    return null;
  }

  private getTokenBalace = (token: ITokenObject) => {
    const tokenBalances = tokenStore.getTokenBalancesByChainId(this.chainId);
    if (token && tokenBalances) {
      return tokenBalances[token.address?.toLowerCase() || token.symbol] || 0;
    }
    return 0;
  }
}