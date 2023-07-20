import { Styles, Module, Panel, Button, Label, VStack, Container, ControlElement, IEventBus, application, customModule, Input, moment, HStack, customElements, IDataSchema } from '@ijstech/components';
import { BigNumber, Constants, IEventBusRegistry, Wallet } from '@ijstech/eth-wallet';
import '@ijstech/eth-contract';
import { formatNumber, formatDate, EventId, limitInputNumber, limitDecimals, IERC20ApprovalAction, QueueType, IBuybackCampaign, ICommissionInfo, INetworkConfig } from './global/index';
import { getChainId, fallBackUrl, getProxyAddress, setDataFromConfig, getCurrentCommissions, getCommissionAmount, getEmbedderCommissionFee, getRpcWallet, initRpcWallet, isClientWalletConnected, isRpcWalletConnected } from './store/index';
import { getGuaranteedBuyBackInfo, GuaranteedBuyBackInfo, ProviderGroupQueueInfo } from './buyback-utils/index';
import { executeSwap, getApprovalModelAction, getHybridRouterAddress, setApprovalModalSpenderAddress } from './swap-utils/index';
import Alert from './alert/index';
import Assets from './assets';
import ScomDappContainer from '@scom/scom-dapp-container';
import configData from './data.json';
import formSchema from './formSchema.json';
import { ChainNativeTokenByChainId, tokenStore, assets as tokenAssets, ITokenObject } from '@scom/scom-token-list';
import { buybackComponent, buybackDappContainer } from './index.css';
import ScomCommissionFeeSetup from '@scom/scom-commission-fee-setup';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';

const Theme = Styles.Theme.ThemeVars;

interface ScomBuybackElement extends ControlElement {
	lazyLoad?: boolean;
	chainId: number;
	projectName: string;
	offerIndex: number;
	description?: string;
	tokenIn: string;
	tokenOut: string;
	detailUrl?: string;
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
	private _data: IBuybackCampaign = {
		chainId: 0,
		projectName: '',
		offerIndex: 0,
		tokenIn: '',
		tokenOut: '',
		wallets: [],
		networks: []
	};
	tag: any = {};
	defaultEdit: boolean = true;

	private infoStack: HStack;
	private leftStack: VStack;
	private emptyStack: VStack;

	private $eventBus: IEventBus;
	private loadingElm: Panel;
	private buybackComponent: Panel;
	private buybackElm: Panel;
	private buybackAlert: Alert;
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
	private clientEvents: any[] = [];

	static async create(options?: ScomBuybackElement, parent?: Container) {
		let self = new this(parent, options);
		await self.ready();
		return self;
	}

	onHide() {
		this.dappContainer.onHide();
		const rpcWallet = getRpcWallet();
		for (let event of this.rpcWalletEvents) {
			rpcWallet.unregisterWalletEvent(event);
		}
		this.rpcWalletEvents = [];
		for (let event of this.clientEvents) {
			event.unregister();
		}
		this.clientEvents = [];
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
				name: 'Settings',
				icon: 'cog',
				command: (builder: any, userInputData: any) => {
					let _oldData: IBuybackCampaign = {
						chainId: 0,
						projectName: '',
						offerIndex: 0,
						tokenIn: '',
						tokenOut: '',
						wallets: [],
						networks: []
					};
					return {
						execute: async () => {
							_oldData = { ...this._data };
							this._data.chainId = userInputData.chainId;
							this._data.projectName = userInputData.projectName;
							this._data.description = userInputData.description;
							this._data.offerIndex = userInputData.offerIndex;
							this._data.tokenIn = userInputData.tokenIn;
							this._data.tokenOut = userInputData.tokenOut;
							this._data.detailUrl = userInputData.detailUrl;
							this.refreshData(builder);
						},
						undo: async () => {
							this._data = { ..._oldData };
							this.refreshData(builder);
						},
						redo: () => { }
					}
				},
				userInputDataSchema: formSchema.general.dataSchema
			});

			actions.push({
				name: 'Theme Settings',
				icon: 'palette',
				command: (builder: any, userInputData: any) => {
					let oldTag = {};
					return {
						execute: async () => {
							if (!userInputData) return;
							oldTag = JSON.parse(JSON.stringify(this.tag));
							if (builder) builder.setTag(userInputData);
							else this.setTag(userInputData);
							if (this.dappContainer) this.dappContainer.setTag(userInputData);
						},
						undo: () => {
							if (!userInputData) return;
							this.tag = JSON.parse(JSON.stringify(oldTag));
							if (builder) builder.setTag(this.tag);
							else this.setTag(this.tag);
							if (this.dappContainer) this.dappContainer.setTag(userInputData);
						},
						redo: () => { }
					}
				},
				userInputDataSchema: formSchema.theme.dataSchema
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
				setLinkParams: async (params: any) => {
					if (params.data) {
						const decodedString = window.atob(params.data);
						const commissions = JSON.parse(decodedString);
						let resultingData = {
							...self._data,
							commissions
						};
						await this.setData(resultingData);
					}
				},
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
					const fee = getEmbedderCommissionFee();
					return { ...this.getData(), fee }
				},
				setData: this.setData.bind(this),
				getTag: this.getTag.bind(this),
				setTag: this.setTag.bind(this)
			}
		]
	}

	private async getData() {
		return this._data;
	}

	private async setData(data: IBuybackCampaign) {
		this._data = data;

		const rpcWalletId = initRpcWallet(this.defaultChainId);
		const rpcWallet = getRpcWallet();
		const event = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
			this.refreshWidget();
		});
		this.rpcWalletEvents.push(event);

		this.refreshDappContainer();
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
		this.updateStyle('--colors-secondary-main', this.tag[themeVar]?.secondaryColor);
		this.updateStyle('--colors-secondary-contrast_text', this.tag[themeVar]?.secondaryFontColor);
		this.updateStyle('--input-font_color', this.tag[themeVar]?.inputFontColor);
		this.updateStyle('--input-background', this.tag[themeVar]?.inputBackgroundColor);
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
		if (configData) setDataFromConfig(configData);
		this.$eventBus = application.EventBus;
		this.registerEvent();
	}

	private registerEvent = () => {
		this.clientEvents.push(this.$eventBus.register(this, EventId.chainChanged, this.refreshWidget));
	}

	private updateContractAddress = () => {
		const hasCommission = getCurrentCommissions(this.commissions).length;
		if (hasCommission) {
			this.contractAddress = getProxyAddress();
		} else {
			this.contractAddress = getHybridRouterAddress();
		}
		if (this.approvalModelAction) {
			setApprovalModalSpenderAddress(this.contractAddress);
			this.updateCommissionInfo();
		}
	}

	private refreshData = (builder: any) => {
		this.refreshDappContainer();
		this.refreshWidget();
		if (builder?.setData) builder.setData(this._data);
	}

	private refreshDappContainer = () => {
		const rpcWallet = getRpcWallet();
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
			const rpcWallet = getRpcWallet();
			if (!hideLoading && this.loadingElm) {
				this.loadingElm.visible = true;
			}
			if (!isClientWalletConnected() || !this._data || this._data.chainId !== getChainId()) {
				this.renderEmpty();
				return;
			}
			try {
				this.infoStack.visible = true;
				this.emptyStack.visible = false;
				const currentChainId = getChainId();
				tokenStore.updateTokenMapData(currentChainId);
				if (rpcWallet.address) {
					tokenStore.updateAllTokenBalances(rpcWallet);
				}
				await Wallet.getClientInstance().init();
				this.buybackInfo = await getGuaranteedBuyBackInfo(this._data);
				this.updateCommissionInfo();
				await this.renderBuybackCampaign();
				this.renderLeftPart();
				const firstToken = this.getTokenObject('toTokenAddress');
				if (firstToken && firstToken.symbol !== ChainNativeTokenByChainId[getChainId()]?.symbol && isRpcWalletConnected()) {
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

	private get isSellDisabled() {
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
		if (!this.buybackInfo || this.isSellDisabled || !tokenBalances) {
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
		if (getCurrentCommissions(this.commissions).length) {
			this.hStackCommission.visible = true;
			const firstToken = this.getTokenObject('toTokenAddress');
			const secondToken = this.getTokenObject('fromTokenAddress');
			if (firstToken && secondToken) {
				const amount = new BigNumber(this.firstInput?.value || 0);
				const commissionAmount = getCommissionAmount(this.commissions, amount);
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

	private updateBtnSwap = () => {
		if (!isRpcWalletConnected()) {
			this.btnSwap.enabled = true;
			return;
		}
		if (!this.buybackInfo) return;
		if (this.isSellDisabled) {
			this.btnSwap.enabled = false;
			return;
		}
		const firstVal = new BigNumber(this.firstInput.value);
		const secondVal = new BigNumber(this.secondInput.value);
		const firstAvailable = this.getFirstAvailableBalance();
		const secondAvailable = this.getSecondAvailableBalance();

		const commissionAmount = getCommissionAmount(this.commissions, firstVal);
		const tokenBalances = tokenStore.tokenBalances;
		const balance = new BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
		const tradeFee = (this.buybackInfo.queueInfo || {}).tradeFee || '0';
		const fee = new BigNumber(1).minus(tradeFee).times(this.firstInput.value);
		const total = firstVal.plus(commissionAmount).plus(fee);

		if (firstVal.isNaN() || firstVal.lte(0) || firstVal.gt(firstAvailable) || secondVal.isNaN() || secondVal.lte(0) || secondVal.gt(secondAvailable) || total.gt(balance)) {
			this.btnSwap.enabled = false;
		} else {
			this.btnSwap.enabled = true;
		}
		this.btnSwap.caption = this.submitButtonText;
	}

	private onSwap = () => {
		if (!isRpcWalletConnected()) {
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
		const commissionAmount = getCommissionAmount(this.commissions, amount);
		this.showResultMessage(this.buybackAlert, 'warning', `Swapping ${formatNumber(amount.plus(commissionAmount))} ${firstToken?.symbol} to ${formatNumber(this.secondInput.value)} ${secondToken?.symbol}`);
		const params = {
			provider: "RestrictedOracle",
			queueType: QueueType.GROUP_QUEUE,
			routeTokens: [firstToken, secondToken],
			bestSmartRoute: [firstToken, secondToken],
			pairs: [pairAddress],
			fromAmount: new BigNumber(this.firstInput.value),
			toAmount: new BigNumber(this.secondInput.value),
			isFromEstimated: false,
			groupQueueOfferIndex: offerIndex,
			commissions: this.commissions
		}
		const { error } = await executeSwap(params);
		if (error) {
			this.showResultMessage(this.buybackAlert, 'error', error as any);
		}
	}

	private updateInput = (enabled: boolean) => {
		this.firstInput.enabled = enabled;
		this.secondInput.enabled = enabled;
	}

	private get submitButtonText() {
		if (!isRpcWalletConnected()) {
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

			const commissionAmount = getCommissionAmount(this.commissions, firstVal);
			const tokenBalances = tokenStore.tokenBalances;
			const balance = new BigNumber(tokenBalances ? tokenBalances[this.getValueByKey('toTokenAddress')] : 0);
			const tradeFee = (this.buybackInfo.queueInfo || {}).tradeFee || '0';
			const fee = new BigNumber(1).minus(tradeFee).times(this.firstInput.value);
			const total = firstVal.plus(commissionAmount).plus(fee);

			if (firstVal.gt(firstMaxVal) || secondVal.gt(secondMaxVal) || total.gt(balance)) {
				return 'Insufficient amount available';
			}
		}
		if (this.btnSwap?.rightIcon.visible) {
			return 'Selling';
		}
		return 'Sell';
	};

	private initApprovalModelAction = async () => {
		if (!isRpcWalletConnected()) return;
		this.approvalModelAction = await getApprovalModelAction(
			{
				sender: this,
				payAction: this.onSubmit,
				onToBeApproved: async (token: ITokenObject) => {
					this.isApproveButtonShown = true
					this.btnSwap.enabled = true;
					this.btnSwap.caption = isRpcWalletConnected() ? 'Approve' : 'Switch Network';
				},
				onToBePaid: async (token: ITokenObject) => {
					this.updateBtnSwap();
					this.btnSwap.caption = this.submitButtonText;
					this.isApproveButtonShown = false
				},
				onApproving: async (token: ITokenObject, receipt?: string, data?: any) => {
					this.showResultMessage(this.buybackAlert, 'success', receipt || '');
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
					this.showResultMessage(this.buybackAlert, 'error', err);
					this.updateInput(true);
					this.btnSwap.caption = 'Approve';
					this.btnSwap.rightIcon.visible = false;
				},
				onPaying: async (receipt?: string, data?: any) => {
					this.showResultMessage(this.buybackAlert, 'success', receipt || '');
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
					this.showResultMessage(this.buybackAlert, 'error', err);
					this.btnSwap.rightIcon.visible = false;
					this.btnSwap.enabled = true;
					this.btnSwap.caption = this.submitButtonText;
				}
			});
		setApprovalModalSpenderAddress(this.contractAddress);
		const firstToken = this.getTokenObject('toTokenAddress') as ITokenObject;
		await this.approvalModelAction.checkAllowance(firstToken, this.getFirstAvailableBalance());
	}

	getValueByKey = (key: string) => {
		const item = this.buybackInfo;
		if (!item) return null;
		if (item.queueInfo) {
			return item.queueInfo[key];
		}
		return null;
	}

	private showResultMessage = (alert: Alert, status: 'warning' | 'success' | 'error', content?: string | Error) => {
		if (!alert) return;
		let params: any = { status };
		if (status === 'success') {
			params.txtHash = content;
		} else {
			params.content = content;
		}
		alert.message = { ...params };
		alert.showModal();
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
		if (!isRpcWalletConnected()) {
			const chainId = getChainId();
			const clientWallet = Wallet.getClientInstance();
			await clientWallet.switchNetwork(chainId);
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
			this.buybackElm.clearInnerHTML();
			const { queueInfo, pairAddress } = this.buybackInfo;
			const info = queueInfo || {} as ProviderGroupQueueInfo;
			const { startDate, endDate } = info;
			const firstTokenObj = tokenStore.tokenMap[this.getValueByKey('toTokenAddress')];
			const secondTokenObj = tokenStore.tokenMap[this.getValueByKey('fromTokenAddress')];
			const firstSymbol = firstTokenObj?.symbol ?? '';
			const secondSymbol = secondTokenObj?.symbol ?? '';

			// const optionTimer = { background: { color: Theme.colors.secondary.main }, font: { color: Theme.colors.secondary.contrastText } };
			// const vStackTimer = await VStack.create({ gap: 4, verticalAlignment: 'center' });
			// const lbTimer = await Label.create({ caption: 'Starts In: ', font: { size: '12px' } });
			// const endHour = await Label.create(optionTimer);
			// const endDay = await Label.create(optionTimer);
			// const endMin = await Label.create(optionTimer);
			// endHour.classList.add('timer-value');
			// endDay.classList.add('timer-value');
			// endMin.classList.add('timer-value');
			// vStackTimer.appendChild(lbTimer);
			// vStackTimer.appendChild(
			// 	<i-vstack>
			// 		<i-hstack gap={4} verticalAlignment="center" class="custom-timer">
			// 			{endDay}
			// 			<i-label caption="D" class="timer-unit" />
			// 			{endHour}
			// 			<i-label caption="H" class="timer-unit" />
			// 			{endMin}
			// 			<i-label caption="M" class="timer-unit" />
			// 		</i-hstack>
			// 	</i-vstack>
			// );

			const vStackEndTime = await HStack.create({ gap: 4, verticalAlignment: 'center', margin: { top: '0.75rem' } });
			const lbEndTime = await Label.create({ caption: 'Estimated End Time: ', font: { size: '0.875rem', bold: true } });
			vStackEndTime.appendChild(lbEndTime);
			vStackEndTime.appendChild(<i-label caption={formatDate(endDate)} font={{ size: '0.875rem' }} />);
			// let interval: any;
			// const setTimer = () => {
			// 	let days = 0;
			// 	let hours = 0;
			// 	let mins = 0;
			// 	if (moment().isBefore(moment(startDate))) {
			// 		lbTimer.caption = 'Starts In: ';
			// 		lbEndTime.caption = 'Estimated End Time: ';
			// 		days = moment(startDate).diff(moment(), 'days');
			// 		hours = moment(startDate).diff(moment(), 'hours') - days * 24;
			// 		mins = moment(startDate).diff(moment(), 'minutes') - days * 24 * 60 - hours * 60;
			// 	} else if (moment(moment()).isBefore(endDate)) {
			// 		lbTimer.caption = 'Ends In';
			// 		vStackEndTime.visible = false;
			// 		days = moment(endDate).diff(moment(), 'days');
			// 		hours = moment(endDate).diff(moment(), 'hours') - days * 24;
			// 		mins = moment(endDate).diff(moment(), 'minutes') - days * 24 * 60 - hours * 60;
			// 	} else {
			// 		vStackTimer.visible = false;
			// 		vStackEndTime.visible = true;
			// 		lbEndTime.caption = 'Ended On: ';
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
			const commissionFee = getEmbedderCommissionFee();
			const hasCommission = !!getCurrentCommissions(this.commissions).length;
			this.buybackElm.clearInnerHTML();
			this.buybackElm.appendChild(
				<i-panel padding={{ bottom: 15, top: 15, right: 15, left: 15 }} height="auto">
					<i-vstack gap="0.5rem" width="100%" verticalAlignment="center" margin={{ bottom: '1rem' }}>
						<i-vstack>
							<i-hstack gap={4} verticalAlignment="center">
								<i-label caption="Buyback Price: " font={{ bold: true }} />
								<i-label
									caption={`${1 / this.getValueByKey('offerPrice')} ${secondSymbol}`}
									font={{ bold: true }}
								/>
							</i-hstack>
							<i-label caption="I don't have a digital wallet" font={{ size: '0.8125rem' }} link={{ href: 'https://metamask.io/' }}></i-label>
						</i-vstack>
						{/* { vStackTimer } */}
						{vStackEndTime}
					</i-vstack>
					<i-hstack gap={20} margin={{ top: 15 }} verticalAlignment="center">
						<i-vstack gap={4} width="100%" verticalAlignment="space-between">
							<i-hstack gap={4} horizontalAlignment="end">
								<i-label
									id="lbBalance"
									caption={`Balance Available: ${formatNumber(this.getFirstAvailableBalance())} ${firstSymbol}`}
									font={{ size: '0.75rem' }}
								/>
							</i-hstack>
							<i-hstack id="firstInputBox" gap={8} width="100%" height={50} verticalAlignment="center" background={{ color: Theme.input.background }} border={{ radius: 5, width: 2, style: 'solid', color: 'transparent' }} padding={{ left: 7, right: 7 }}>
								<i-hstack gap={4} width={100} verticalAlignment="center">
									<i-image width={20} height={20} url={tokenAssets.tokenPath(firstTokenObj, getChainId())} fallbackUrl={fallBackUrl} />
									<i-label caption={firstSymbol} font={{ color: Theme.input.fontColor }} />
								</i-hstack>
								<i-input
									id="firstInput"
									inputType="number"
									placeholder="0.0"
									class="input-amount"
									width="100%"
									height="100%"
									onChanged={this.firstInputChange}
									onFocus={() => this.handleFocusInput(true, true)}
									onBlur={() => this.handleFocusInput(true, false)}
								/>
							</i-hstack>
							<i-hstack id="secondInputBox" visible={false} width="100%" height={40} position="relative" verticalAlignment="center" background={{ color: Theme.input.background }} border={{ radius: 5, width: 2, style: 'solid', color: 'transparent' }} padding={{ left: 7, right: 7 }}>
								<i-hstack gap={4} margin={{ right: 8 }} width={100} verticalAlignment="center">
									<i-image width={20} height={20} url={tokenAssets.tokenPath(secondTokenObj, getChainId())} fallbackUrl={fallBackUrl} />
									<i-label caption={secondSymbol} font={{ color: Theme.input.fontColor }} />
								</i-hstack>
								<i-input
									id="secondInput"
									inputType="number"
									placeholder="0.0"
									class="input-amount"
									width="100%"
									height="100%"
									onChanged={this.secondInputChange}
									onFocus={() => this.handleFocusInput(false, true)}
									onBlur={() => this.handleFocusInput(false, false)}
								/>
							</i-hstack>
						</i-vstack>
					</i-hstack>
					<i-hstack gap={10} margin={{ top: 6 }} verticalAlignment="center" horizontalAlignment="space-between">
						<i-label caption="Trade Fee" font={{ size: '0.75rem' }} />
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
								caption={isRpcWalletConnected() ? 'Sell' : 'Switch Network'}
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
					<i-vstack gap="0.5rem" margin={{ top: 8 }}>
						<i-vstack gap="0.25rem">
							<i-label caption="Smart contract" font={{ size: '0.75rem' }} />
							<i-label caption={pairAddress} font={{ size: '0.75rem' }} overflowWrap="anywhere" />
						</i-vstack>
						<i-label caption="Terms & Condition" font={{ size: '0.75rem' }} link={{ href: 'https://docs.scom.dev/' }} />
					</i-vstack>
				</i-panel>
			)
		} else {
			this.renderEmpty();
		}
	}

	private renderLeftPart = async () => {
		if (this.buybackInfo) {
			this.leftStack.clearInnerHTML();
			const { tokenOut, tokenIn, projectName, description, detailUrl } = this.buybackInfo;
			const firstToken = tokenOut?.startsWith('0x') ? tokenOut.toLowerCase() : tokenOut;
			const secondToken = tokenIn?.startsWith('0x') ? tokenIn.toLowerCase() : tokenIn;
			const firstTokenObj = tokenStore.tokenMap[firstToken];
			const secondTokenObj = tokenStore.tokenMap[secondToken];
			this.leftStack.clearInnerHTML();
			this.leftStack.appendChild(
				<i-panel padding={{ bottom: 15, top: 15, right: 15, left: 15 }} height="auto">
					<i-vstack gap="1rem" margin={{ bottom: 15 }} width="100%">
						<i-hstack horizontalAlignment="center">
							<i-hstack position="relative" verticalAlignment="center" horizontalAlignment="center" margin={{ bottom: '1.25rem' }}>
								<i-image
									width={80}
									height={80}
									url={tokenAssets.tokenPath(firstTokenObj, getChainId())}
									fallbackUrl={fallBackUrl}
								/>
								<i-image
									width={50}
									height={50}
									url={tokenAssets.tokenPath(secondTokenObj, getChainId())}
									fallbackUrl={fallBackUrl}
									position="absolute"
									bottom={-15}
									right={-10}
								/>
							</i-hstack>
						</i-hstack>
						<i-label
							caption={projectName || ''} margin={{ top: '0.5em', bottom: '1em' }}
							font={{ weight: 600 }}
						/>
						<i-label caption={description || ''} font={{ size: '0.875rem' }} />
						<i-hstack visible={!!detailUrl} verticalAlignment="center" gap="0.25rem" wrap="wrap">
							<i-label caption="Details here: " font={{ size: '0.875rem' }} />
							<i-label
								font={{ size: '0.875rem' }} caption={detailUrl}
								link={{ href: detailUrl }}
							/>
						</i-hstack>
					</i-vstack>
				</i-panel>
			)
		}
	}

	private isEmptyData(value: IBuybackCampaign) {
		return !value || !value.tokenIn || !value.tokenOut || !value.networks || value.networks.length === 0;
	}

	async init() {
		this.isReadyCallbackQueued = true;
		super.init();
		this.buybackAlert = new Alert();
		this.buybackComponent.appendChild(this.buybackAlert);
		const lazyLoad = this.getAttribute('lazyLoad', true, false);
		if (!lazyLoad) {
			const defaultChainId = this.getAttribute('defaultChainId', true);
			const chainId = this.getAttribute('chainId', true, defaultChainId || 0);
			const projectName = this.getAttribute('projectName', true, '');
			const description = this.getAttribute('description', true, '');
			const offerIndex = this.getAttribute('offerIndex', true, 0);
			const tokenIn = this.getAttribute('tokenIn', true, '');
			const tokenOut = this.getAttribute('tokenOut', true, '');
			const detailUrl = this.getAttribute('detailUrl', true, '');
			// const commissions = this.getAttribute('commissions', true, []);
			const networks = this.getAttribute('networks', true);
			const wallets = this.getAttribute('wallets', true);
			const showHeader = this.getAttribute('showHeader', true);
			const data: IBuybackCampaign = {
				chainId,
				projectName,
				description,
				offerIndex,
				tokenIn,
				tokenOut,
				detailUrl,
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
				<i-panel id="buybackComponent" class={buybackComponent} minHeight={340}>
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
						<i-hstack
							id="infoStack"
							width="100%"
							height="100%"
							horizontalAlignment="center"
							wrap="wrap"
							gap={20}
						>
							<i-vstack id="leftStack" minWidth={300} maxWidth="50%" padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }} />
							<i-vstack id="buybackElm" minWidth={300} gap="0.5rem" padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }} background={{ color: Theme.background.main }} verticalAlignment="space-between" />
						</i-hstack>
					</i-panel>
					<i-scom-commission-fee-setup id="configDApp" visible={false} />
					<i-scom-wallet-modal id="mdWallet" wallets={[]} />
				</i-panel>
			</i-scom-dapp-container>
		)
	}
}
