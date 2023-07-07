import {IWallet, Contract as _Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj, TransactionOptions} from "@ijstech/eth-contract";
import Bin from "./OSWAP_OracleConstantLimited.json";
export interface IDeployParams {token0:string[];token1:string[];price0:(number|BigNumber)[];price1:(number|BigNumber)[];limit0:(number|BigNumber)[];limit1:(number|BigNumber)[]}
export interface IGetLatestPriceParams {from:string;to:string;param3:string}
export interface IGetRatioParams {from:string;to:string;fromAmount:number|BigNumber;toAmount:number|BigNumber;payload:string}
export interface IIsSupportedParams {param1:string;param2:string}
export interface ILimitsParams {param1:string;param2:string;param3:boolean}
export interface IPricesParams {param1:string;param2:string}
export class OSWAP_OracleConstantLimited extends _Contract{
    static _abi: any = Bin.abi;
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
        this.assign()
    }
    deploy(params: IDeployParams, options?: TransactionOptions): Promise<string>{
        return this.__deploy([params.token0,params.token1,this.wallet.utils.toString(params.price0),this.wallet.utils.toString(params.price1),this.wallet.utils.toString(params.limit0),this.wallet.utils.toString(params.limit1)], options);
    }
    decimals: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    getLatestPrice: {
        (params: IGetLatestPriceParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    getRatio: {
        (params: IGetRatioParams, options?: TransactionOptions): Promise<{numerator:BigNumber,denominator:BigNumber}>;
    }
    isSupported: {
        (params: IIsSupportedParams, options?: TransactionOptions): Promise<boolean>;
    }
    limits: {
        (params: ILimitsParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    prices: {
        (params: IPricesParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    private assign(){
        let decimals_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('decimals',[],options);
            return new BigNumber(result);
        }
        this.decimals = decimals_call
        let getLatestPriceParams = (params: IGetLatestPriceParams) => [params.from,params.to,this.wallet.utils.stringToBytes(params.param3)];
        let getLatestPrice_call = async (params: IGetLatestPriceParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('getLatestPrice',getLatestPriceParams(params),options);
            return new BigNumber(result);
        }
        this.getLatestPrice = getLatestPrice_call
        let getRatioParams = (params: IGetRatioParams) => [params.from,params.to,this.wallet.utils.toString(params.fromAmount),this.wallet.utils.toString(params.toAmount),this.wallet.utils.stringToBytes(params.payload)];
        let getRatio_call = async (params: IGetRatioParams, options?: TransactionOptions): Promise<{numerator:BigNumber,denominator:BigNumber}> => {
            let result = await this.call('getRatio',getRatioParams(params),options);
            return {
                numerator: new BigNumber(result.numerator),
                denominator: new BigNumber(result.denominator)
            };
        }
        this.getRatio = getRatio_call
        let isSupportedParams = (params: IIsSupportedParams) => [params.param1,params.param2];
        let isSupported_call = async (params: IIsSupportedParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('isSupported',isSupportedParams(params),options);
            return result;
        }
        this.isSupported = isSupported_call
        let limitsParams = (params: ILimitsParams) => [params.param1,params.param2,params.param3];
        let limits_call = async (params: ILimitsParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('limits',limitsParams(params),options);
            return new BigNumber(result);
        }
        this.limits = limits_call
        let pricesParams = (params: IPricesParams) => [params.param1,params.param2];
        let prices_call = async (params: IPricesParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('prices',pricesParams(params),options);
            return new BigNumber(result);
        }
        this.prices = prices_call
    }
}