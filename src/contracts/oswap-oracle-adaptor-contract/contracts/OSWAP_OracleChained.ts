import {IWallet, Contract as _Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj, TransactionOptions} from "@ijstech/eth-contract";
import Bin from "./OSWAP_OracleChained.json";
export interface IDeployParams {from:string[];to:string[];count:(number|BigNumber)[];paths:string[];oracles:string[]}
export interface IGetLatestPriceParams {from:string;to:string;payload:string}
export interface IGetRatioParams {from:string;to:string;param3:number|BigNumber;param4:number|BigNumber;payload:string}
export interface IIsSupportedParams {from:string;to:string}
export interface IOraclesStoreParams {param1:string;param2:string;param3:number|BigNumber}
export interface IPathsStoreParams {param1:string;param2:string;param3:number|BigNumber}
export class OSWAP_OracleChained extends _Contract{
    static _abi: any = Bin.abi;
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
        this.assign()
    }
    deploy(params: IDeployParams, options?: TransactionOptions): Promise<string>{
        return this.__deploy([params.from,params.to,this.wallet.utils.toString(params.count),params.paths,params.oracles], options);
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
    oraclesStore: {
        (params: IOraclesStoreParams, options?: TransactionOptions): Promise<string>;
    }
    pathsStore: {
        (params: IPathsStoreParams, options?: TransactionOptions): Promise<string>;
    }
    priceFeedAddresses: {
        (param1:string, options?: TransactionOptions): Promise<string>;
    }
    private assign(){
        let decimals_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('decimals',[],options);
            return new BigNumber(result);
        }
        this.decimals = decimals_call
        let getLatestPriceParams = (params: IGetLatestPriceParams) => [params.from,params.to,this.wallet.utils.stringToBytes(params.payload)];
        let getLatestPrice_call = async (params: IGetLatestPriceParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('getLatestPrice',getLatestPriceParams(params),options);
            return new BigNumber(result);
        }
        this.getLatestPrice = getLatestPrice_call
        let getRatioParams = (params: IGetRatioParams) => [params.from,params.to,this.wallet.utils.toString(params.param3),this.wallet.utils.toString(params.param4),this.wallet.utils.stringToBytes(params.payload)];
        let getRatio_call = async (params: IGetRatioParams, options?: TransactionOptions): Promise<{numerator:BigNumber,denominator:BigNumber}> => {
            let result = await this.call('getRatio',getRatioParams(params),options);
            return {
                numerator: new BigNumber(result.numerator),
                denominator: new BigNumber(result.denominator)
            };
        }
        this.getRatio = getRatio_call
        let isSupportedParams = (params: IIsSupportedParams) => [params.from,params.to];
        let isSupported_call = async (params: IIsSupportedParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('isSupported',isSupportedParams(params),options);
            return result;
        }
        this.isSupported = isSupported_call
        let oraclesStoreParams = (params: IOraclesStoreParams) => [params.param1,params.param2,this.wallet.utils.toString(params.param3)];
        let oraclesStore_call = async (params: IOraclesStoreParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('oraclesStore',oraclesStoreParams(params),options);
            return result;
        }
        this.oraclesStore = oraclesStore_call
        let pathsStoreParams = (params: IPathsStoreParams) => [params.param1,params.param2,this.wallet.utils.toString(params.param3)];
        let pathsStore_call = async (params: IPathsStoreParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('pathsStore',pathsStoreParams(params),options);
            return result;
        }
        this.pathsStore = pathsStore_call
        let priceFeedAddresses_call = async (param1:string, options?: TransactionOptions): Promise<string> => {
            let result = await this.call('priceFeedAddresses',[param1],options);
            return result;
        }
        this.priceFeedAddresses = priceFeedAddresses_call
    }
}