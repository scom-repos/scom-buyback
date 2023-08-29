import { Styles, Module, Panel, Button, Label, VStack, Container, ControlElement, application, customModule, Input, moment, HStack, customElements } from '@ijstech/components';
import { BigNumber, Constants, IERC20ApprovalAction, IEventBusRegistry, Wallet } from '@ijstech/eth-wallet';
import { formatNumber, formatDate, limitInputNumber, limitDecimals, IBuybackCampaign, ICommissionInfo, INetworkConfig } from './global/index';
import { State, fallBackUrl, isClientWalletConnected } from './store/index';
import { getGuaranteedBuyBackInfo, GuaranteedBuyBackInfo, ProviderGroupQueueInfo } from './buyback-utils/index';
import { executeSwap, getHybridRouterAddress } from './swap-utils/index';
import Assets from './assets';
import ScomDappContainer from '@scom/scom-dapp-container';
import configData from './data.json';
import formSchema from './formSchema';
import { ChainNativeTokenByChainId, tokenStore, assets as tokenAssets, ITokenObject } from '@scom/scom-token-list';
import { buybackComponent, buybackDappContainer } from './index.css';
import ScomCommissionFeeSetup from '@scom/scom-commission-fee-setup';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';

const Theme = Styles.Theme.ThemeVars;

interface ScomBuybackElement extends ControlElement {
	lazyLoad?: boolean;
	chainId: number;
	title?: string;
	logo?: string;
	offerIndex: number;
	tokenIn: string;
	tokenOut: string;
	commissions?: ICommissionInfo[];
	defaultChainId: number;
	networks: INetworkConfig[];
	wallets: IWalletPlugin[];
	showHeader?: boolean;
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			['i-scom-buyback']: ScomBuybackElement;
		}
	}
}

@customModule
@customElements('i-scom-buyback')
export default class ScomBuyback extends Module {
	private state: State;
	private _data: IBuybackCampaign = {
		chainId: 0,
		title: '',
		logo: '',
		offerIndex: 0,
		tokenIn: '',
		tokenOut: '',
		wallets: [],
		networks: []
	};
	tag: any = {};
	defaultEdit: boolean = true;

	private infoStack: VStack;
	private topStack: VStack;
	private bottomStack: VStack;
	private emptyStack: VStack;

	private loadingElm: Panel;
	private txStatusModal: ScomTxStatusModal;
	private noCampaignSection: Panel;
	private buybackInfo: GuaranteedBuyBackInfo | null;
	private firstInputBox: VStack;
	private secondInputBox: VStack;
	private firstInput: Input;
	private secondInput: Input;
	private lbFee: Label;
	private hStackCommission: HStack;
	private lbCommissionFee: Label;
	private btnSwap: Button;
	private mdWallet: ScomWalletModal;
	private approvalModelAction: IERC20ApprovalAction;
	private isApproveButtonShown: boolean;

	private dappContainer: ScomDappContainer;
	private contractAddress: string;
	private rpcWalletEvents: IEventBusRegistry[] = [];

	static async create(options?: ScomBuybackElement, parent?: Container) {
		let self = new this(parent, options);
		await self.ready();
		return self;
	}

	onHide() {
		this.dappContainer.onHide();
		this.removeRpcWalletEvents();
	}

	removeRpcWalletEvents() {
		const rpcWallet = this.rpcWallet;
		for (let event of this.rpcWalletEvents) {
			rpcWallet.unregisterWalletEvent(event);
		}
		this.rpcWalletEvents = [];
	}

	private _getActions(category?: string) {
		const self = this;
		const actions: any = [
			// {
			// 	name: 'Commissions',
			// 	icon: 'dollar-sign',
			// 	command: (builder: any, userInputData: any) => {
			// 		let _oldData: IBuybackCampaign = {
			// 			chainId: 0,
			// 			projectName: '',
			// 			offerIndex: 0,
			// 			tokenIn: '',
			// 			tokenOut: '',
			// 			wallets: [],
			// 			networks: []
			// 		}
			// 		return {
			// 			execute: async () => {
			// 				_oldData = { ...this._data };
			// 				if (userInputData.commissions) this._data.commissions = userInputData.commissions;
			// 				this.refreshWidget();
			// 				if (builder?.setData) builder.setData(this._data);
			// 			},
			// 			undo: () => {
			// 				this._data = { ..._oldData };
			// 				this.refreshWidget();
			// 				if (builder?.setData) builder.setData(this._data);
			// 			},
			// 			redo: () => { }
			// 		}
			// 	},
			// 	customUI: {
			// 		render: (data?: any, onConfirm?: (result: boolean, data: any) => void) => {
			// 			const vstack = new VStack();
			// 			const config = new ScomCommissionFeeSetup(null, {
			//         commissions: self._data.commissions,
			//         fee: getEmbedderCommissionFee(),
			//         networks: self._data.networks
			//       });
			//       const button = new Button(null, {
			//         caption: 'Confirm',
			//       });
			//       vstack.append(config);
			//       vstack.append(button);
			//       button.onClick = async () => {
			//         const commissions = config.commissions;
			//         if (onConfirm) onConfirm(true, {commissions});
			//       }
			//       return vstack;
			// 		}
			// 	}
			// },
		];

		if (category && category !== 'offers') {
			actions.push({
				name: 'Edit',
				icon: 'edit',
				command: (builder: any, userInputData: any) => {
					let oldData: IBuybackCampaign = {
						chainId: 0,
						title: '',
						logo: '',
						offerIndex: 0,
						tokenIn: '',
						tokenOut: '',
						wallets: [],
						networks: []
					};
					let oldTag = {};
					return {
						execute: async () => {
							oldData = JSON.parse(JSON.stringify(this._data));
							const {
								title,
								logo,
								offerIndex,
								chainId,
								tokenIn,
								tokenOut,
								...themeSettings
							} = userInputData;

							const generalSettings = {
								title,
								logo,
								offerIndex,
								chainId,
								tokenIn,
								tokenOut
							};

							this._data.chainId = generalSettings.chainId;
							this._data.title = generalSettings.title;
							this._data.logo = generalSettings.logo;
							this._data.offerIndex = generalSettings.offerIndex;
							this._data.tokenIn = generalSettings.tokenIn;
							this._data.tokenOut = generalSettings.tokenOut;
							await this.resetRpcWallet();
							this.refreshData(builder);

							oldTag = JSON.parse(JSON.stringify(this.tag));
							if (builder?.setTag) builder.setTag(themeSettings);
							else this.setTag(themeSettings);
							if (this.dappContainer) this.dappContainer.setTag(themeSettings);
						},
						undo: async () => {
							this._data = JSON.parse(JSON.stringify(oldData));
							this.refreshData(builder);

							this.tag = JSON.parse(JSON.stringify(oldTag));
							if (builder?.setTag) builder.setTag(this.tag);
							else this.setTag(this.tag);
							if (this.dappContainer) this.dappContainer.setTag(this.tag);
						},
						redo: () => { }
					}
				},
				userInputDataSchema: formSchema.dataSchema,
				userInputUISchema: formSchema.uiSchema,
				customControls: formSchema.customControls(this.rpcWallet?.instanceId)
			});
		}

		return actions;
	}

	getConfigurators() {
		let self = this;
		return [
			{
				name: 'Builder Configurator',
				target: 'Builders',
				getActions: (category?: string) => {
					return this._getActions(category);
				},
				getData: this.getData.bind(this),
				setData: async (data: any) => {
					const defaultData = configData.defaultBuilderData;
					await this.setData({ ...defaultData, ...data });
				},
				getTag: this.getTag.bind(this),
				setTag: this.setTag.bind(this)
			},
			{
				name: 'Emdedder Configurator',
				target: 'Embedders',
				elementName: 'i-scom-commission-fee-setup',
				getLinkParams: () => {
					const commissions = this._data.commissions || [];
					return {
						data: window.btoa(JSON.stringify(commissions))
					}
				},
				// setLinkParams: async (params: any) => {
				// 	if (params.data) {
				// 		const decodedString = window.atob(params.data);
				// 		const commissions = JSON.parse(decodedString);
				// 		let resultingData = {
				// 			...self._data,
				// 			commissions
				// 		};
				// 		await this.setData(resultingData);
				// 	}
				// },
				bindOnChanged: (element: ScomCommissionFeeSetup, callback: (data: any) => Promise<void>) => {
					element.onChanged = async (data: any) => {
						let resultingData = {
							...self._data,
							...data
						};
						await this.setData(resultingData);
						await callback(data);
					}
				},
				getData: () => {
					const fee = this.state.embedderCommissionFee;
					const data = this.getData();
					return { ...data, fee }
				},
				setData: async (properties: IBuybackCampaign, linkParams?: Record<string, any>) => {
					let resultingData = {
						...properties
					}
					if (linkParams?.data) {
						const decodedString = window.atob(linkParams.data);
						const commissions = JSON.parse(decodedString);
						resultingData.commissions = commissions;
					}
					await this.setData(resultingData);
				},
				getTag: this.getTag.bind(this),
				setTag: this.setTag.bind(this)
			}
		]
	}

	private getData() {
		return this._data;
	}

	private async resetRpcWallet() {
		this.removeRpcWalletEvents();
		const rpcWalletId = await this.state.initRpcWallet(this.defaultChainId);
		const rpcWallet = this.rpcWallet;
		const chainChangedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.ChainChanged, async (chainId: number) => {
			this.refreshWidget();
		});
		const connectedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
			this.refreshWidget();
		});
		this.rpcWalletEvents.push(chainChangedEvent, connectedEvent);
		this.refreshDappContainer();
	}

	private async setData(data: IBuybackCampaign) {
		this._data = data;
		await this.resetRpcWallet();
		await this.refreshWidget();
	}

	async getTag() {
		return this.tag;
	}

	private updateTag(type: 'light' | 'dark', value: any) {
		this.tag[type] = this.tag[type] ?? {};
		for (let prop in value) {
			if (value.hasOwnProperty(prop))
				this.tag[type][prop] = value[prop];
		}
	}

	private async setTag(value: any) {
		const newValue = value || {};
		for (let prop in newValue) {
			if (newValue.hasOwnProperty(prop)) {
				if (prop === 'light' || prop === 'dark')
					this.updateTag(prop, newValue[prop]);
				else
					this.tag[prop] = newValue[prop];
			}
		}
		if (this.dappContainer)
			this.dappContainer.setTag(this.tag);
		this.updateTheme();
	}

	private updateStyle(name: string, value: any) {
		value ?
			this.style.setProperty(name, value) :
			this.style.removeProperty(name);
	}

	private updateTheme() {
		const themeVar = this.dappContainer?.theme || 'light';
		this.updateStyle('--text-primary', this.tag[themeVar]?.fontColor);
		this.updateStyle('--background-main', this.tag[themeVar]?.backgroundColor);
		// this.updateStyle('--colors-primary-main', this.tag[themeVar]?.buttonBackgroundColor);
		// this.updateStyle('--colors-primary-contrast_text', this.tag[themeVar]?.buttonFontColor);
		// this.updateStyle('--colors-secondary-main', this.tag[themeVar]?.secondaryColor);
		// this.updateStyle('--colors-secondary-contrast_text', this.tag[themeVar]?.secondaryFontColor);
		this.updateStyle('--input-font_color', this.tag[themeVar]?.inputFontColor);
		this.updateStyle('--input-background', this.tag[themeVar]?.inputBackgroundColor);
	}

	private get chainId() {
		return this.state.getChainId();
	}

	private get rpcWallet() {
		return this.state.getRpcWallet();
	}

	get defaultChainId() {
		return this._data.defaultChainId;
	}

	set defaultChainId(value: number) {
		this._data.defaultChainId = value;
	}

	get wallets() {
		return this._data.wallets ?? [];
	}

	set wallets(value: IWalletPlugin[]) {
		this._data.wallets = value;
	}

	get networks() {
		const { chainId, networks } = this._data;
		if (chainId && networks) {
			const matchNetwork = networks.find(v => v.chainId == chainId);
			return matchNetwork ? [matchNetwork] : [{ chainId }];
		}
		return networks ?? [];
	}

	set networks(value: INetworkConfig[]) {
		this._data.networks = value;
	}

	get showHeader() {
		return this._data.showHeader ?? true;
	}

	set showHeader(value: boolean) {
		this._data.showHeader = value;
	}

	get commissions() {
		return this._data.commissions ?? [];
	}

	set commissions(value: ICommissionInfo[]) {
		this._data.commissions = value;
	}

	constructor(parent?: Container, options?: ControlElement) {
		super(parent, options);
	}

	private updateContractAddress = () => {
		const hasCommission = this.state.getCurrentCommissions(this.commissions).length;
		if (hasCommission) {
			this.contractAddress = this.state.getProxyAddress();
		} else {
			this.contractAddress = getHybridRouterAddress(this.state);
		}
		if (this.state?.approvalModel && this.approvalModelAction) {
			this.state.approvalModel.spenderAddress = this.contractAddress;
			this.updateCommissionInfo();
		}
	}

	private refreshData = (builder: any) => {
		this.refreshDappContainer();
		this.refreshWidget();
		if (builder?.setData) {
			builder.setData(this._data);
		}
	}

	private refreshDappContainer = () => {
		const rpcWallet = this.rpcWallet;
		const containerData = {
			defaultChainId: this._data.chainId || this.defaultChainId,
			wallets: this.wallets,
			networks: this.networks,
			showHeader: this.showHeader,
			rpcWalletId: rpcWallet.instanceId
		}
		if (this.dappContainer?.setData) this.dappContainer.setData(containerData);
	}

	private refreshWidget = async () => {
		this.updateContractAddress();
		await this.initializeWidgetConfig();
	}

	private initializeWidgetConfig = async (hideLoading?: boolean) => {
		setTimeout(async () => {
			const rpcWallet = this.rpcWallet;
			const chainId = this.chainId;
			if (!hideLoading && this.loadingElm) {
				this.loadingElm.visible = true;
			}
			if (!isClientWalletConnected() || !this._data || this._data.chainId !== chainId) {
				this.renderEmpty();
				return;
			}
			try {
				this.infoStack.visible = true;
				this.emptyStack.visible = false;
				tokenStore.updateTokenMapData(chainId);
				if (rpcWallet.address) {
					tokenStore.updateAllTokenBalances(rpcWallet);
				}
				await this.initWallet();
				this.buybackInfo = await getGuaranteedBuyBackInfo(this.state, { ...this._data });
				this.updateCommissionInfo();
				await this.renderBuybackCampaign();
				await this.renderLeftPart();
				const firstToken = this.getTokenObject('toTokenAddress');
				if (firstToken && firstToken.symbol !== ChainNativeTokenByChainId[chainId]?.symbol && this.state.isRpcWalletConnected()) {
					await this.initApprovalModelAction();
				}
			} catch {
				this.renderEmpty();
			}
			if (!hideLoading && this.loadingElm) {
				this.loadingElm.visible = false;
			}
		});
	}

	private initWallet = async () => {
		try {
			await Wallet.getClientInstance().init();
			await this.rpcWallet.init();
		} catch (err) {
			console.log(err);
		}
	}

	private get isSwapDisabled() {
		if (!this.buybackInfo) return true;
		const info = this.buybackInfo.queueInfo;
		if (!info) return true;
		const { startDate, endDate, allowAll, addresses } = info;
		const isUpcoming = moment().isBefore(moment(startDate));
		const isEnded = moment().isAfter(moment(endDate));
		if (isUpcoming || isEnded) {
			return true;
		}
		if (!allowAll) {
			const address = Wallet.getClientInstance().address;
			const isWhitelisted = addresses.some((item: any) => item.address === address);
			return !isWhitelisted;
		}
		return false;
	}

	private getFirstAvailableBalance = () => {
		const tokenBalances = tokenStore.tokenBalances;
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

	private getSecondAvailableBalance = () => {
		if (!this.buybackInfo || !this.buybackInfo.queueInfo) {
			return '0';
		}
		const { queueInfo } = this.buybackInfo;
		const { offerPrice, tradeFee } = queueInfo;
		return new BigNumber(this.getFirstAvailableBalance()).dividedBy(offerPrice).times(tradeFee).toFixed();
	}

	private getTokenObject = (key: string) => {
		const tokenMap = tokenStore.tokenMap;
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

	private handleFocusInput = (first: boolean, isFocus: boolean) => {
		const elm = first ? this.firstInputBox : this.secondInputBox;
		if (isFocus) {
			elm.classList.add('highlight-box');
		} else {
			elm.classList.remove('highlight-box');
		}
	}

	private updateCommissionInfo = () => {
		if (!this.hStackCommission) return;
		if (this.state.getCurrentCommissions(this.commissions).length) {
			this.hStackCommission.visible = true;
			const firstToken = this.getTokenObject('toTokenAddress');
			const secondToken = this.getTokenObject('fromTokenAddress');
			if (firstToken && secondToken) {
				const amount = new BigNumber(this.firstInput?.value || 0);
				const commissionAmount = this.state.getCommissionAmount(this.commissions, amount);
				this.lbCommissionFee.caption = `${formatNumber(commissionAmount, 6)} ${firstToken?.symbol || ''}`;
				this.hStackCommission.visible = true;
			} else {
				this.hStackCommission.visible = false;
			}
		} else {
			this.hStackCommission.visible = false;
		}
	}

	private firstInputChange = () => {
		const firstToken = this.getTokenObject('toTokenAddress');
		const secondToken = this.getTokenObject('fromTokenAddress');
		limitInputNumber(this.firstInput, firstToken?.decimals || 18);
		if (!this.buybackInfo) return;
		const info = this.buybackInfo.queueInfo || {} as any;
		const { offerPrice, tradeFee } = info;
		const firstSymbol = firstToken?.symbol || '';
		const inputVal = new BigNumber(this.firstInput.value).dividedBy(offerPrice).times(tradeFee);
		if (inputVal.isNaN()) {
			this.lbFee.caption = `0 ${firstSymbol}`;
			this.secondInput.value = '';
		} else {
			this.lbFee.caption = `${formatNumber(new BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstSymbol}`;
			this.secondInput.value = limitDecimals(inputVal, secondToken?.decimals || 18);
		}
		this.updateCommissionInfo();
		this.updateBtnSwap();
	}

	private secondInputChange = () => {
		const firstToken = this.getTokenObject('toTokenAddress');
		const secondToken = this.getTokenObject('fromTokenAddress');
		limitInputNumber(this.secondInput, secondToken?.decimals || 18);
		if (!this.buybackInfo) return;
		const info = this.buybackInfo.queueInfo || {} as any;
		const { offerPrice, tradeFee } = info;
		const firstSymbol = firstToken?.symbol || '';
		const inputVal = new BigNumber(this.secondInput.value).multipliedBy(offerPrice).dividedBy(tradeFee);
		if (inputVal.isNaN()) {
			this.firstInput.value = '';
			this.lbFee.caption = `0 ${firstSymbol}`;
		} else {
			this.firstInput.value = limitDecimals(inputVal, firstToken?.decimals || 18);
			this.lbFee.caption = `${formatNumber(new BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstSymbol}`;
		}
		this.updateCommissionInfo();
		this.updateBtnSwap();
	}

	private onSetMaxBalance = async () => {
		const { tradeFee, offerPrice } = this.buybackInfo.queueInfo || {};
		const firstAvailable = this.getFirstAvailableBalance();
		const firstToken = this.getTokenObject('toTokenAddress');
		const secondToken = this.getTokenObject('fromTokenAddress');

		const tokenBalances = tokenStore.tokenBalances || {};
		let totalAmount = new BigNumber(tokenBalances[this.getValueByKey('toTokenAddress')] || 0);
		const commissionAmount = this.state.getCommissionAmount(this.commissions, totalAmount);
		if (commissionAmount.gt(0)) {
			const totalFee = totalAmount.plus(commissionAmount).dividedBy(totalAmount);
			totalAmount = totalAmount.dividedBy(totalFee);
		}
		this.firstInput.value = limitDecimals(totalAmount.gt(firstAvailable) ? firstAvailable : totalAmount, firstToken?.decimals || 18);
		const inputVal = new BigNumber(this.firstInput.value).dividedBy(offerPrice).times(tradeFee);
		this.secondInput.value = limitDecimals(inputVal, secondToken?.decimals || 18);
		this.lbFee.caption = `${formatNumber(new BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstToken?.symbol || ''}`;
		this.updateCommissionInfo();
		this.updateBtnSwap();
	}

	private updateBtnSwap = () => {
		if (!this.state.isRpcWalletConnected()) {
			this.btnSwap.enabled = true;
			return;
		}
		if (!this.buybackInfo) return;
		if (this.isSwapDisabled) {
			this.btnSwap.enabled = false;
			return;
		}
		const firstVal = new BigNumber(this.firstInput.value);
		const secondVal = new BigNumber(this.secondInput.value);
		const firstAvailable = this.getFirstAvailableBalance();
		const secondAvailable = this.getSecondAvailableBalance();

		const commissionAmount = this.state.getCommissionAmount(this.commissions, firstVal);
		const tokenBalances = tokenStore.tokenBalances;
		const balance = new BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
		// const tradeFee = (this.buybackInfo.queueInfo || {}).tradeFee || '0';
		// const fee = new BigNumber(1).minus(tradeFee).times(this.firstInput.value);
		const total = firstVal.plus(commissionAmount);

		if (firstVal.isNaN() || firstVal.lte(0) || firstVal.gt(firstAvailable) || secondVal.isNaN() || secondVal.lte(0) || secondVal.gt(secondAvailable) || total.gt(balance)) {
			this.btnSwap.enabled = false;
		} else {
			this.btnSwap.enabled = true;
		}
		this.btnSwap.caption = this.submitButtonText;
	}

	private onSwap = () => {
		if (!this.state.isRpcWalletConnected()) {
			this.connectWallet();
			return;
		}
		if (this.buybackInfo && this.isApproveButtonShown) {
			const info = this.buybackInfo.queueInfo;
			this.approvalModelAction.doApproveAction(this.getTokenObject('toTokenAddress') as ITokenObject, info.tokenInAvailable);
		} else {
			this.approvalModelAction.doPayAction();
		}
	}

	private onSubmit = async () => {
		if (!this.buybackInfo || !this.buybackInfo.queueInfo) return;
		const firstToken = this.getTokenObject('toTokenAddress');
		const secondToken = this.getTokenObject('fromTokenAddress');
		const { pairAddress, offerIndex } = this.buybackInfo.queueInfo;
		const amount = new BigNumber(this.firstInput?.value || 0);
		const commissionAmount = this.state.getCommissionAmount(this.commissions, amount);
		this.showResultMessage('warning', `Swapping ${formatNumber(amount.plus(commissionAmount))} ${firstToken?.symbol} to ${formatNumber(this.secondInput.value)} ${secondToken?.symbol}`);
		const params = {
			provider: "RestrictedOracle",
			routeTokens: [firstToken, secondToken],
			bestSmartRoute: [firstToken, secondToken],
			pairs: [pairAddress],
			fromAmount: new BigNumber(this.firstInput.value),
			toAmount: new BigNumber(this.secondInput.value),
			isFromEstimated: false,
			groupQueueOfferIndex: offerIndex,
			commissions: this.commissions
		}
		const { error } = await executeSwap(this.state, params);
		if (error) {
			this.showResultMessage('error', error as any);
		}
	}

	private updateInput = (enabled: boolean) => {
		this.firstInput.enabled = enabled;
		this.secondInput.enabled = enabled;
	}

	private get submitButtonText() {
		if (!this.state.isRpcWalletConnected()) {
			return 'Switch Network';
		}
		if (this.isApproveButtonShown) {
			return this.btnSwap?.rightIcon.visible ? 'Approving' : 'Approve';
		}
		const firstVal = new BigNumber(this.firstInput.value);
		const secondVal = new BigNumber(this.secondInput.value);
		if (firstVal.lt(0) || secondVal.lt(0)) {
			return 'Amount must be greater than 0';
		}
		if (this.buybackInfo) {
			const firstMaxVal = new BigNumber(this.getFirstAvailableBalance());
			const secondMaxVal = new BigNumber(this.getSecondAvailableBalance());

			const commissionAmount = this.state.getCommissionAmount(this.commissions, firstVal);
			const tokenBalances = tokenStore.tokenBalances;
			const balance = new BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
			// const tradeFee = (this.buybackInfo.queueInfo || {}).tradeFee || '0';
			// const fee = new BigNumber(1).minus(tradeFee).times(this.firstInput.value);
			const total = firstVal.plus(commissionAmount);

			if (firstVal.gt(firstMaxVal) || secondVal.gt(secondMaxVal) || total.gt(balance)) {
				return 'Insufficient amount available';
			}
		}
		if (this.btnSwap?.rightIcon.visible) {
			return 'Swapping';
		}
		return 'Swap';
	};

	private initApprovalModelAction = async () => {
		if (!this.state.isRpcWalletConnected()) return;
		this.approvalModelAction = await this.state.setApprovalModelAction({
			sender: this,
			payAction: this.onSubmit,
			onToBeApproved: async (token: ITokenObject) => {
				this.isApproveButtonShown = true
				this.btnSwap.enabled = true;
				this.btnSwap.caption = this.state.isRpcWalletConnected() ? 'Approve' : 'Switch Network';
			},
			onToBePaid: async (token: ITokenObject) => {
				this.updateBtnSwap();
				this.btnSwap.caption = this.submitButtonText;
				this.isApproveButtonShown = false
			},
			onApproving: async (token: ITokenObject, receipt?: string, data?: any) => {
				this.showResultMessage('success', receipt || '');
				this.btnSwap.rightIcon.visible = true;
				this.btnSwap.caption = 'Approving';
				this.updateInput(false);
			},
			onApproved: async (token: ITokenObject, data?: any) => {
				this.isApproveButtonShown = false;
				this.btnSwap.rightIcon.visible = false;
				this.btnSwap.caption = this.submitButtonText;
				this.updateInput(true);
				this.updateBtnSwap();
			},
			onApprovingError: async (token: ITokenObject, err: Error) => {
				this.showResultMessage('error', err);
				this.updateInput(true);
				this.btnSwap.caption = 'Approve';
				this.btnSwap.rightIcon.visible = false;
			},
			onPaying: async (receipt?: string, data?: any) => {
				this.showResultMessage('success', receipt || '');
				this.btnSwap.rightIcon.visible = true;
				this.btnSwap.caption = this.submitButtonText;
				this.updateInput(false);
			},
			onPaid: async (data?: any) => {
				await this.initializeWidgetConfig(true);
				this.firstInput.value = '';
				this.secondInput.value = '';
				this.btnSwap.rightIcon.visible = false;
				this.btnSwap.caption = this.submitButtonText;
			},
			onPayingError: async (err: Error) => {
				this.showResultMessage('error', err);
				this.btnSwap.rightIcon.visible = false;
				this.btnSwap.enabled = true;
				this.btnSwap.caption = this.submitButtonText;
			}
		});
		this.state.approvalModel.spenderAddress = this.contractAddress;
		const firstToken = this.getTokenObject('toTokenAddress') as ITokenObject;
		await this.approvalModelAction.checkAllowance(firstToken, this.getFirstAvailableBalance());
	}

	private getValueByKey = (key: string) => {
		const item = this.buybackInfo;
		if (!item?.queueInfo) return null;
		return item.queueInfo[key];
	}

	private showResultMessage = (status: 'warning' | 'success' | 'error', content?: string | Error) => {
		if (!this.txStatusModal) return;
		let params: any = { status };
		if (status === 'success') {
			params.txtHash = content;
		} else {
			params.content = content;
		}
		this.txStatusModal.message = { ...params };
		this.txStatusModal.showModal();
	}

	private connectWallet = async () => {
		if (!isClientWalletConnected()) {
			if (this.mdWallet) {
				await application.loadPackage('@scom/scom-wallet-modal', '*');
				this.mdWallet.networks = this.networks;
				this.mdWallet.wallets = this.wallets;
				this.mdWallet.showModal();
			}
			return;
		}
		if (!this.state.isRpcWalletConnected()) {
			const clientWallet = Wallet.getClientInstance();
			await clientWallet.switchNetwork(this.chainId);
		}
	}

	private initEmptyUI = async () => {
		if (!this.noCampaignSection) {
			this.noCampaignSection = await Panel.create({ width: '100%', height: '100%' });
		}
		const isClientConnected = isClientWalletConnected();
		this.noCampaignSection.clearInnerHTML();
		this.noCampaignSection.appendChild(
			<i-vstack class="no-buyback" height="100%" background={{ color: Theme.background.main }} verticalAlignment="center">
				<i-vstack gap={10} verticalAlignment="center" horizontalAlignment="center">
					<i-image url={Assets.fullPath('img/TrollTrooper.svg')} />
					<i-label caption={isClientConnected ? 'No Buybacks' : 'Please connect with your wallet!'} />
				</i-vstack>
				{!isClientConnected ? <i-button
					caption="Connect Wallet"
					class="btn-os"
					minHeight={43}
					width={300}
					maxWidth="90%"
					margin={{ top: 10, left: 'auto', right: 'auto' }}
					onClick={this.connectWallet} /> : []
				}
			</i-vstack>
		);
		this.noCampaignSection.visible = true;
	}

	private renderEmpty = async () => {
		this.infoStack.visible = false;
		this.emptyStack.visible = true;
		await this.initEmptyUI();
		if (this.emptyStack) {
			this.emptyStack.clearInnerHTML();
			this.emptyStack.appendChild(this.noCampaignSection);
		}
		if (this.loadingElm) {
			this.loadingElm.visible = false;
		}
	}

	private renderBuybackCampaign = async () => {
		if (this.buybackInfo) {
			this.bottomStack.clearInnerHTML();
			const chainId = this.chainId;
			const isRpcConnected = this.state.isRpcWalletConnected();
			const { queueInfo } = this.buybackInfo;
			const { amount, allowAll, allocation, tradeFee } = queueInfo || {};
			const firstTokenObj = tokenStore.tokenMap[this.getValueByKey('toTokenAddress')];
			const secondTokenObj = tokenStore.tokenMap[this.getValueByKey('fromTokenAddress')];
			const firstSymbol = firstTokenObj?.symbol ?? '';
			const secondSymbol = secondTokenObj?.symbol ?? '';

			const commissionFee = this.state.embedderCommissionFee;
			const hasCommission = !!this.state.getCurrentCommissions(this.commissions).length;
			this.bottomStack.clearInnerHTML();
			this.bottomStack.appendChild(
				<i-panel padding={{ bottom: '0.5rem', top: '0.5rem', right: '1rem', left: '1rem' }} height="auto">
					<i-vstack gap={10} width="100%">
						<i-hstack gap={4} verticalAlignment="center" wrap="wrap">
							<i-label caption="Group Queue Balance" />
							<i-label caption={`${formatNumber(amount || 0)} ${secondSymbol}`} margin={{ left: 'auto' }} />
						</i-hstack>
						<i-hstack gap={4} verticalAlignment="center" wrap="wrap">
							<i-label caption="Your Allocation" />
							<i-label caption={allowAll ? 'Unlimited' : `${formatNumber(allocation || 0)} ${secondSymbol}`} margin={{ left: 'auto' }} />
						</i-hstack>
						<i-hstack gap={4} verticalAlignment="center" wrap="wrap">
							<i-label caption="Your Balance" />
							<i-label caption={`${formatNumber(tokenStore.getTokenBalance(firstTokenObj) || 0)} ${firstSymbol}`} margin={{ left: 'auto' }} />
						</i-hstack>
						<i-panel width="100%" height={2} background={{ color: Theme.input.background }} margin={{ top: 8, bottom: 8 }} />
						<i-hstack gap={4} wrap="wrap">
							<i-label caption="Swap Available" />
							<i-vstack gap={4} margin={{ left: 'auto' }} horizontalAlignment="end">
								<i-label caption={`${formatNumber(this.getFirstAvailableBalance())} ${firstSymbol}`} font={{ color: Theme.colors.primary.main }} />
								<i-label caption={`(${formatNumber(this.getSecondAvailableBalance())} ${secondSymbol})`} font={{ color: Theme.colors.primary.main }} />
							</i-vstack>
						</i-hstack>
						<i-hstack
							id="firstInputBox"
							gap={8}
							width="100%"
							height={50}
							verticalAlignment="center"
							background={{ color: Theme.input.background }}
							border={{ radius: 5, width: 2, style: 'solid', color: 'transparent' }}
							padding={{ left: 7, right: 7 }}
						>
							<i-input
								id="firstInput"
								inputType="number"
								placeholder="0.0"
								class="input-amount"
								width="100%"
								height="100%"
								enabled={isRpcConnected}
								onChanged={this.firstInputChange}
								onFocus={() => this.handleFocusInput(true, true)}
								onBlur={() => this.handleFocusInput(true, false)}
							/>
							<i-hstack gap={4} width={130} verticalAlignment="center">
								<i-button
									caption="Max"
									enabled={isRpcConnected && new BigNumber(this.getFirstAvailableBalance()).gt(0)}
									padding={{ top: 3, bottom: 3, left: 6, right: 6 }}
									border={{ radius: 6 }}
									font={{ size: '14px' }}
									class="btn-os"
									onClick={this.onSetMaxBalance}
								/>
								<i-image width={24} height={24} url={tokenAssets.tokenPath(firstTokenObj, chainId)} fallbackUrl={fallBackUrl} />
								<i-label caption={firstSymbol} font={{ color: Theme.input.fontColor, bold: true }} />
							</i-hstack>
						</i-hstack>
						<i-vstack width="100%" margin={{ top: 4, bottom: 4 }} horizontalAlignment="center">
							<i-icon name="arrow-down" width={20} height={20} fill={Theme.text.primary} />
						</i-vstack>
						<i-hstack
							id="secondInputBox"
							gap={8}
							width="100%"
							height={50}
							verticalAlignment="center"
							background={{ color: Theme.input.background }}
							border={{ radius: 5, width: 2, style: 'solid', color: 'transparent' }}
							padding={{ left: 7, right: 7 }}
						>
							<i-input
								id="secondInput"
								inputType="number"
								placeholder="0.0"
								class="input-amount"
								width="100%"
								height="100%"
								enabled={isRpcConnected}
								onChanged={this.secondInputChange}
								onFocus={() => this.handleFocusInput(false, true)}
								onBlur={() => this.handleFocusInput(false, false)}
							/>
							<i-hstack gap={4} margin={{ right: 8 }} width={130} verticalAlignment="center">
								<i-button
									caption="Max"
									enabled={isRpcConnected && new BigNumber(this.getSecondAvailableBalance()).gt(0)}
									padding={{ top: 3, bottom: 3, left: 6, right: 6 }}
									border={{ radius: 6 }}
									font={{ size: '14px' }}
									class="btn-os"
									onClick={this.onSetMaxBalance}
								/>
								<i-image width={24} height={24} url={tokenAssets.tokenPath(secondTokenObj, chainId)} fallbackUrl={fallBackUrl} />
								<i-label caption={secondSymbol} font={{ color: Theme.input.fontColor, bold: true }} />
							</i-hstack>
						</i-hstack>
					</i-vstack>
					<i-hstack gap={10} margin={{ top: 6 }} verticalAlignment="center" horizontalAlignment="space-between">
						<i-label caption={`Trade Fee ${isNaN(Number(tradeFee)) ? '' : `(${new BigNumber(1).minus(tradeFee).multipliedBy(100).toFixed()}%)`}`} font={{ size: '0.75rem' }} />
						<i-label id="lbFee" caption={`0 ${firstSymbol}`} font={{ size: '0.75rem' }} />
					</i-hstack>
					<i-hstack id="hStackCommission" visible={hasCommission} gap={10} margin={{ top: 6 }} verticalAlignment="center" horizontalAlignment="space-between">
						<i-hstack gap={4} verticalAlignment="center">
							<i-label caption="Commission Fee" font={{ size: '0.75rem' }} />
							<i-icon tooltip={{ content: `A commission fee of ${new BigNumber(commissionFee).times(100)}% will be applied to the amount you input.` }} name="question-circle" width={14} height={14} />
						</i-hstack>
						<i-label id="lbCommissionFee" caption={`0 ${firstSymbol}`} font={{ size: '0.75rem' }} />
					</i-hstack>
					<i-vstack margin={{ top: 15 }} verticalAlignment="center" horizontalAlignment="center">
						<i-panel>
							<i-button
								id="btnSwap"
								minWidth={150}
								minHeight={36}
								caption={this.state.isRpcWalletConnected() ? 'Swap' : 'Switch Network'}
								border={{ radius: 12 }}
								rightIcon={{ spin: true, visible: false, fill: '#fff' }}
								padding={{ top: 4, bottom: 4, left: 16, right: 16 }}
								// font={{ size: '0.875rem', color: Theme.colors.primary.contrastText }}
								// rightIcon={{ visible: false, fill: Theme.colors.primary.contrastText }}
								class="btn-os"
								onClick={this.onSwap.bind(this)}
							/>
						</i-panel>
					</i-vstack>
				</i-panel>
			)
		} else {
			this.renderEmpty();
		}
	}

	private renderLeftPart = async () => {
		if (this.buybackInfo) {
			this.topStack.clearInnerHTML();
			const { tokenIn, queueInfo } = this.buybackInfo;
			const info = queueInfo || {} as ProviderGroupQueueInfo;
			const { startDate, endDate } = info;
			const secondToken = tokenIn?.startsWith('0x') ? tokenIn.toLowerCase() : tokenIn;
			const secondTokenObj = tokenStore.tokenMap[secondToken];
			const secondSymbol = secondTokenObj?.symbol ?? '';
			const { title, logo } = this._data;
			const hasBranch = !!title || !!logo;
			let imgLogo: string;
			if (logo?.startsWith('ipfs://')) {
				imgLogo = logo.replace('ipfs://', '/ipfs/');
			} else {
				imgLogo = logo;
			}

			const hStackEndTime = await HStack.create({ gap: 4, verticalAlignment: 'center' });
			const lbEndTime = await Label.create({ caption: 'End Time', font: { size: '0.875rem', bold: true } });
			hStackEndTime.appendChild(lbEndTime);
			hStackEndTime.appendChild(<i-label caption={formatDate(endDate)} font={{ size: '0.875rem', bold: true, color: Theme.colors.primary.main }} margin={{ left: 'auto' }} />);

			// const optionTimer = { background: { color: Theme.colors.secondary.main }, font: { color: Theme.colors.secondary.contrastText } };
			// const hStackTimer = await HStack.create({ gap: 4, verticalAlignment: 'center' });
			// const lbTimer = await Label.create({ caption: 'Starts In', font: { size: '0.875rem', bold: true } });
			// const endHour = await Label.create(optionTimer);
			// const endDay = await Label.create(optionTimer);
			// const endMin = await Label.create(optionTimer);
			// endHour.classList.add('timer-value');
			// endDay.classList.add('timer-value');
			// endMin.classList.add('timer-value');
			// hStackTimer.appendChild(lbTimer);
			// hStackTimer.appendChild(
			// 	<i-hstack gap={4} margin={{ left: 'auto' }} verticalAlignment="center" class="custom-timer">
			// 		{endDay}
			// 		<i-label caption="D" class="timer-unit" />
			// 		{endHour}
			// 		<i-label caption="H" class="timer-unit" />
			// 		{endMin}
			// 		<i-label caption="M" class="timer-unit" />
			// 	</i-hstack>
			// );

			// let interval: any;
			// const setTimer = () => {
			// 	let days = 0;
			// 	let hours = 0;
			// 	let mins = 0;
			// 	if (moment().isBefore(moment(startDate))) {
			// 		lbTimer.caption = 'Starts In';
			// 		lbEndTime.caption = 'End Time';
			// 		days = moment(startDate).diff(moment(), 'days');
			// 		hours = moment(startDate).diff(moment(), 'hours') - days * 24;
			// 		mins = moment(startDate).diff(moment(), 'minutes') - days * 24 * 60 - hours * 60;
			// 	} else if (moment(moment()).isBefore(endDate)) {
			// 		lbTimer.caption = 'Ends In';
			// 		hStackEndTime.visible = false;
			// 		days = moment(endDate).diff(moment(), 'days');
			// 		hours = moment(endDate).diff(moment(), 'hours') - days * 24;
			// 		mins = moment(endDate).diff(moment(), 'minutes') - days * 24 * 60 - hours * 60;
			// 	} else {
			// 		hStackTimer.visible = false;
			// 		hStackEndTime.visible = true;
			// 		lbEndTime.caption = 'Ended On';
			// 		days = hours = mins = 0;
			// 		clearInterval(interval);
			// 	}
			// 	endDay.caption = `${days}`;
			// 	endHour.caption = `${hours}`;
			// 	endMin.caption = `${mins}`;
			// }
			// setTimer();
			// interval = setInterval(() => {
			// 	setTimer();
			// }, 1000);

			this.topStack.clearInnerHTML();
			this.topStack.appendChild(
				<i-vstack gap={10} width="100%" padding={{ bottom: '0.5rem', top: '0.5rem', right: '1rem', left: '1rem' }}>
					{
						hasBranch ? <i-vstack gap="0.25rem" margin={{ bottom: '0.25rem' }} horizontalAlignment="center">
							<i-label visible={!!title} caption={title} margin={{ top: '0.5em', bottom: '1em' }} font={{ weight: 600 }} />
							<i-image visible={!!imgLogo} url={imgLogo} height={100} />
						</i-vstack> : []
					}
					<i-hstack gap="0.25rem" verticalAlignment="center">
						<i-label caption="Buyback Price" font={{ bold: true }} />
						<i-label
							caption={`${1 / this.getValueByKey('offerPrice')} ${secondSymbol}`}
							font={{ bold: true, color: Theme.colors.primary.main }}
							margin={{ left: 'auto' }}
						/>
					</i-hstack>
					{/* {hStackTimer} */}
					{hStackEndTime}
				</i-vstack>
			)
		}
	}

	private isEmptyData(value: IBuybackCampaign) {
		return !value || !value.tokenIn || !value.tokenOut || !value.networks || value.networks.length === 0;
	}

	async init() {
		this.isReadyCallbackQueued = true;
		super.init();
		this.state = new State(configData);
		const lazyLoad = this.getAttribute('lazyLoad', true, false);
		if (!lazyLoad) {
			const defaultChainId = this.getAttribute('defaultChainId', true);
			const chainId = this.getAttribute('chainId', true, defaultChainId || 0);
			const logo = this.getAttribute('logo', true);
			const title = this.getAttribute('title', true);
			const offerIndex = this.getAttribute('offerIndex', true, 0);
			const tokenIn = this.getAttribute('tokenIn', true, '');
			const tokenOut = this.getAttribute('tokenOut', true, '');
			// const commissions = this.getAttribute('commissions', true, []);
			const networks = this.getAttribute('networks', true);
			const wallets = this.getAttribute('wallets', true);
			const showHeader = this.getAttribute('showHeader', true);
			const data: IBuybackCampaign = {
				chainId,
				title,
				logo,
				offerIndex,
				tokenIn,
				tokenOut,
				// commissions,
				defaultChainId,
				networks,
				wallets,
				showHeader
			};
			if (!this.isEmptyData(data)) {
				await this.setData(data);
			} else {
				await this.renderEmpty();
			}
		}
		this.isReadyCallbackQueued = false;
		this.executeReadyCallback();
	}

	render() {
		return (
			<i-scom-dapp-container id="dappContainer" class={buybackDappContainer}>
				<i-panel class={buybackComponent} minHeight={340}>
					<i-panel id="buybackLayout" class="buyback-layout" margin={{ left: 'auto', right: 'auto' }}>
						<i-vstack id="loadingElm" class="i-loading-overlay">
							<i-vstack class="i-loading-spinner" horizontalAlignment="center" verticalAlignment="center">
								<i-icon
									class="i-loading-spinner_icon"
									image={{ url: Assets.fullPath('img/loading.svg'), width: 36, height: 36 }}
								/>
								<i-label
									caption="Loading..." font={{ color: '#FD4A4C', size: '1.5em' }}
									class="i-loading-spinner_text"
								/>
							</i-vstack>
						</i-vstack>
						<i-vstack id="emptyStack" visible={false} minHeight={320} margin={{ top: 10, bottom: 10 }} verticalAlignment="center" horizontalAlignment="center" />
						<i-vstack
							id="infoStack"
							width="100%"
							minWidth={320}
							maxWidth={500}
							height="100%"
							margin={{ left: 'auto', right: 'auto' }}
							horizontalAlignment="center"
						>
							<i-vstack id="topStack" width="inherit" padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }} />
							<i-panel width="calc(100% - 4rem)" height={2} background={{ color: Theme.input.background }} />
							<i-vstack id="bottomStack" gap="0.5rem" width="inherit" padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }} background={{ color: Theme.background.main }} verticalAlignment="space-between" />
						</i-vstack>
					</i-panel>
					<i-scom-tx-status-modal id="txStatusModal" />
					<i-scom-wallet-modal id="mdWallet" wallets={[]} />
				</i-panel>
			</i-scom-dapp-container>
		)
	}
}
