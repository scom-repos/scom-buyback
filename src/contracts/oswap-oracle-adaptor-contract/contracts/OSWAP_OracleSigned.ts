import {IWallet, Contract as _Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj, TransactionOptions} from "@ijstech/eth-contract";
import Bin from "./OSWAP_OracleSigned.json";
export interface IGetLatestPriceParams {from:string;to:string;payload:string}
export interface IGetRatioParams {from:string;to:string;param3:number|BigNumber;param4:number|BigNumber;payload:string}
export interface IIsSupportedParams {param1:string;param2:string}
export interface IUpdateSequenceNumberParams {from:string;to:string;payload:string}
export class OSWAP_OracleSigned extends _Contract{
    static _abi: any = Bin.abi;
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
        this.assign()
    }
    deploy(signer:string, options?: TransactionOptions): Promise<string>{
        return this.__deploy([signer], options);
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
    sequenceNumber: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    signer: {
        (options?: TransactionOptions): Promise<string>;
    }
    updateSequenceNumber: {
        (params: IUpdateSequenceNumberParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IUpdateSequenceNumberParams, options?: TransactionOptions) => Promise<void>;
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
        let isSupportedParams = (params: IIsSupportedParams) => [params.param1,params.param2];
        let isSupported_call = async (params: IIsSupportedParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('isSupported',isSupportedParams(params),options);
            return result;
        }
        this.isSupported = isSupported_call
        let sequenceNumber_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('sequenceNumber',[],options);
            return new BigNumber(result);
        }
        this.sequenceNumber = sequenceNumber_call
        let signer_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('signer',[],options);
            return result;
        }
        this.signer = signer_call
        let updateSequenceNumberParams = (params: IUpdateSequenceNumberParams) => [params.from,params.to,this.wallet.utils.stringToBytes(params.payload)];
        let updateSequenceNumber_send = async (params: IUpdateSequenceNumberParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('updateSequenceNumber',updateSequenceNumberParams(params),options);
            return result;
        }
        let updateSequenceNumber_call = async (params: IUpdateSequenceNumberParams, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('updateSequenceNumber',updateSequenceNumberParams(params),options);
            return;
        }
        this.updateSequenceNumber = Object.assign(updateSequenceNumber_send, {
            call:updateSequenceNumber_call
        });
    }
}