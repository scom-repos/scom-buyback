import {IWallet, Contract as _Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj, TransactionOptions} from "@ijstech/eth-contract";
import Bin from "./OSWAP_OracleChainlinkPriceGuardFiatBinance.json";
export interface IDeployParams {factory:string;maxValue:number|BigNumber;deviation:number|BigNumber;returnAmmPrice:boolean}
export interface IGetLatestPriceParams {from:string;to:string;payload:string}
export interface IGetPriceInfoParams {from:string;to:string;fromAmount:number|BigNumber;toAmount:number|BigNumber}
export interface IGetRatioParams {from:string;to:string;fromAmount:number|BigNumber;toAmount:number|BigNumber;payload:string}
export interface IIsSupportedParams {from:string;to:string}
export class OSWAP_OracleChainlinkPriceGuardFiatBinance extends _Contract{
    static _abi: any = Bin.abi;
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
        this.assign()
    }
    deploy(params: IDeployParams, options?: TransactionOptions): Promise<string>{
        return this.__deploy([params.factory,this.wallet.utils.toString(params.maxValue),this.wallet.utils.toString(params.deviation),params.returnAmmPrice], options);
    }
    WETH: {
        (options?: TransactionOptions): Promise<string>;
    }
    chainlinkDeicmals: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    decimals: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    decimals_1: {
        (param1:string, options?: TransactionOptions): Promise<BigNumber>;
    }
    factory: {
        (options?: TransactionOptions): Promise<string>;
    }
    getLatestPrice: {
        (params: IGetLatestPriceParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    getPriceInfo: {
        (params: IGetPriceInfoParams, options?: TransactionOptions): Promise<{chainlinkPrice:BigNumber,ammPrice:BigNumber,usdAmount:BigNumber}>;
    }
    getRatio: {
        (params: IGetRatioParams, options?: TransactionOptions): Promise<{numerator:BigNumber,denominator:BigNumber}>;
    }
    high: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    isSupported: {
        (params: IIsSupportedParams, options?: TransactionOptions): Promise<boolean>;
    }
    low: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    maxValue: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    priceFeedAddresses: {
        (param1:string, options?: TransactionOptions): Promise<string>;
    }
    returnAmmPrice: {
        (options?: TransactionOptions): Promise<boolean>;
    }
    wethDecimals: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    wethPriceFeed: {
        (options?: TransactionOptions): Promise<string>;
    }
    private assign(){
        let WETH_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('WETH',[],options);
            return result;
        }
        this.WETH = WETH_call
        let chainlinkDeicmals_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('chainlinkDeicmals',[],options);
            return new BigNumber(result);
        }
        this.chainlinkDeicmals = chainlinkDeicmals_call
        let decimals_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('decimals',[],options);
            return new BigNumber(result);
        }
        this.decimals = decimals_call
        let decimals_1_call = async (param1:string, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('decimals',[param1],options);
            return new BigNumber(result);
        }
        this.decimals_1 = decimals_1_call
        let factory_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('factory',[],options);
            return result;
        }
        this.factory = factory_call
        let getLatestPriceParams = (params: IGetLatestPriceParams) => [params.from,params.to,this.wallet.utils.stringToBytes(params.payload)];
        let getLatestPrice_call = async (params: IGetLatestPriceParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('getLatestPrice',getLatestPriceParams(params),options);
            return new BigNumber(result);
        }
        this.getLatestPrice = getLatestPrice_call
        let getPriceInfoParams = (params: IGetPriceInfoParams) => [params.from,params.to,this.wallet.utils.toString(params.fromAmount),this.wallet.utils.toString(params.toAmount)];
        let getPriceInfo_call = async (params: IGetPriceInfoParams, options?: TransactionOptions): Promise<{chainlinkPrice:BigNumber,ammPrice:BigNumber,usdAmount:BigNumber}> => {
            let result = await this.call('getPriceInfo',getPriceInfoParams(params),options);
            return {
                chainlinkPrice: new BigNumber(result.chainlinkPrice),
                ammPrice: new BigNumber(result.ammPrice),
                usdAmount: new BigNumber(result.usdAmount)
            };
        }
        this.getPriceInfo = getPriceInfo_call
        let getRatioParams = (params: IGetRatioParams) => [params.from,params.to,this.wallet.utils.toString(params.fromAmount),this.wallet.utils.toString(params.toAmount),this.wallet.utils.stringToBytes(params.payload)];
        let getRatio_call = async (params: IGetRatioParams, options?: TransactionOptions): Promise<{numerator:BigNumber,denominator:BigNumber}> => {
            let result = await this.call('getRatio',getRatioParams(params),options);
            return {
                numerator: new BigNumber(result.numerator),
                denominator: new BigNumber(result.denominator)
            };
        }
        this.getRatio = getRatio_call
        let high_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('high',[],options);
            return new BigNumber(result);
        }
        this.high = high_call
        let isSupportedParams = (params: IIsSupportedParams) => [params.from,params.to];
        let isSupported_call = async (params: IIsSupportedParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('isSupported',isSupportedParams(params),options);
            return result;
        }
        this.isSupported = isSupported_call
        let low_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('low',[],options);
            return new BigNumber(result);
        }
        this.low = low_call
        let maxValue_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('maxValue',[],options);
            return new BigNumber(result);
        }
        this.maxValue = maxValue_call
        let priceFeedAddresses_call = async (param1:string, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('priceFeedAddresses',[param1],options);
            return result;
        }
        this.priceFeedAddresses = priceFeedAddresses_call
        let returnAmmPrice_call = async (options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('returnAmmPrice',[],options);
            return result;
        }
        this.returnAmmPrice = returnAmmPrice_call
        let wethDecimals_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('wethDecimals',[],options);
            return new BigNumber(result);
        }
        this.wethDecimals = wethDecimals_call
        let wethPriceFeed_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('wethPriceFeed',[],options);
            return result;
        }
        this.wethPriceFeed = wethPriceFeed_call
    }
}