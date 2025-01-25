import { Styles, Module, Panel, Button, Label, VStack, Container, ControlElement, application, customModule, Input, HStack, customElements, moment } from '@ijstech/components';
import { BigNumber, IERC20ApprovalAction, Wallet } from '@ijstech/eth-wallet';
import { formatNumber, formatDate, limitInputNumber, IBuybackCampaign, ICommissionInfo, INetworkConfig } from './global/index';
import { State, fallBackUrl, isClientWalletConnected } from './store/index';
import { ProviderGroupQueueInfo } from './buyback-utils/index';
import { getHybridRouterAddress } from './swap-utils/index';
import Assets from './assets';
import ScomDappContainer from '@scom/scom-dapp-container';
import configData from './data.json';
import { ChainNativeTokenByChainId, tokenStore, assets as tokenAssets, ITokenObject } from '@scom/scom-token-list';
import { buybackComponent, buybackDappContainer } from './index.css';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import { ConfigModel, BuybackModel } from './model/index';
import translations from './translations.json';

const Theme = Styles.Theme.ThemeVars;
const ROUNDING_NUMBER = 1;

interface ScomBuybackElement extends ControlElement {
	lazyLoad?: boolean;
	chainId: number;
	title?: string;
	logo?: string;
	offerIndex: number;
	tokenIn: string;
	customTokenIn?: string;
	tokenOut: string;
	customTokenOut?: string;
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
	tag: any = {};
	defaultEdit: boolean = true;

	private infoStack: VStack;
	private emptyStack: VStack;
	private loadingElm: Panel;
	private txStatusModal: ScomTxStatusModal;
	private noCampaignSection: Panel;
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
	private isSubmitting: boolean;
	private detailWrapper: HStack;
	private btnDetail: Button;

	private dappContainer: ScomDappContainer;
	private contractAddress: string;
	private buybackModel: BuybackModel;
	private configModel: ConfigModel;

	static async create(options?: ScomBuybackElement, parent?: Container) {
		let self = new this(parent, options);
		await self.ready();
		return self;
	}

	private get data() {
		return this.configModel.getData();
	}

	onHide() {
		this.dappContainer.onHide();
		this.removeRpcWalletEvents();
	}

	removeRpcWalletEvents() {
		this.configModel.removeRpcWalletEvents();
	}

	getConfigurators() {
		this.initModels();
		return this.configModel.getConfigurators();
	}

	initModels() {
		if (!this.state) {
			this.state = new State(configData);
		}
		if (!this.buybackModel) {
			this.buybackModel = new BuybackModel(this, this.state);
		}
		if (!this.configModel) {
			this.configModel = new ConfigModel(this.state, this, {
				refreshWidget: this.refreshWidget.bind(this),
				getContainer: this.getContainer.bind(this)
			});
		}
	}

	async getData() {
		return this.configModel.getData();
	}

	async setData(data: IBuybackCampaign) {
		this.configModel.setData(data);
	}

	async getTag() {
		return this.tag;
	}

	async setTag(value: any) {
		this.configModel.setTag(value);
	}

	private get chainId() {
		return this.state.getChainId();
	}

	private get rpcWallet() {
		return this.state.getRpcWallet();
	}

	get defaultChainId() {
		return this.configModel.defaultChainId;
	}

	set defaultChainId(value: number) {
		this.configModel.defaultChainId = value;
	}

	get wallets() {
		return this.configModel.wallets;
	}

	set wallets(value: IWalletPlugin[]) {
		this.configModel.wallets = value;
	}

	get networks() {
		return this.configModel.networks;
	}

	set networks(value: INetworkConfig[]) {
		this.configModel.networks = value;
	}

	get showHeader() {
		return this.configModel.showHeader;
	}

	set showHeader(value: boolean) {
		this.configModel.showHeader = value;
	}

	get commissions() {
		const chainId = this.state?.getChainId();
		const isZksync = chainId === 300 || chainId === 324;
		return isZksync ? [] : this.configModel.commissions;
	}

	set commissions(value: ICommissionInfo[]) {
		this.configModel.commissions = value;
	}

	constructor(parent?: Container, options?: ControlElement) {
		super(parent, options);
	}

	private updateContractAddress = () => {
		const hasCommission = this.state.getCurrentCommissions(this.commissions).length;
		if (hasCommission) {
			this.contractAddress = this.state.getProxyAddress();
		} else {
			const chainId = this.state.getChainId();
			const isZksync = chainId === 300 || chainId === 324;
			this.contractAddress = getHybridRouterAddress(this.state, isZksync);
		}
		if (this.state?.approvalModel && this.approvalModelAction) {
			this.state.approvalModel.spenderAddress = this.contractAddress;
			this.updateCommissionInfo();
		}
	}

	private getContainer = () => {
		return this.dappContainer;
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
			if (!isClientWalletConnected() || !this.data || this.data.chainId !== chainId) {
				this.renderEmpty();
				return;
			}
			try {
				this.infoStack.visible = true;
				this.emptyStack.visible = false;
				tokenStore.updateTokenMapData(chainId);
				if (rpcWallet.address) {
					tokenStore.updateTokenBalancesByChainId(chainId);
				}
				await this.configModel.initWallet();
				await this.buybackModel.fetchGuaranteedBuyBackInfo(this.data);
				this.updateCommissionInfo();
				await this.renderBuybackCampaign();
				const firstToken = this.buybackModel.firstTokenObject;
				if (firstToken && firstToken.symbol !== ChainNativeTokenByChainId[chainId]?.symbol && this.state.isRpcWalletConnected()) {
					await this.initApprovalModelAction();
				} else if ((this.buybackModel.isExpired || this.buybackModel.isUpcoming) && this.btnSwap) {
					this.updateBtnSwap();
				}
			} catch {
				this.renderEmpty();
			}
			if (!hideLoading && this.loadingElm) {
				this.loadingElm.visible = false;
			}
		});
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
			const { firstTokenObject, secondTokenObject } = this.buybackModel;
			if (firstTokenObject && secondTokenObject) {
				const amount = new BigNumber(this.firstInput?.value || 0);
				const commissionAmount = this.state.getCommissionAmount(this.commissions, amount);
				this.lbCommissionFee.caption = `${formatNumber(commissionAmount, 6)} ${firstTokenObject?.symbol || ''}`;
				this.hStackCommission.visible = true;
			} else {
				this.hStackCommission.visible = false;
			}
		} else {
			this.hStackCommission.visible = false;
		}
	}

	private firstInputChange = () => {
		const { firstTokenObject, secondTokenObject } = this.buybackModel;
		limitInputNumber(this.firstInput, firstTokenObject?.decimals || 18);
		if (!this.buybackModel.buybackInfo) return;
		const { offerPrice, tradeFee } = this.buybackModel.buybackInfo.queueInfo || {} as ProviderGroupQueueInfo;
		const firstSymbol = firstTokenObject?.symbol || '';
		const inputVal = new BigNumber(this.firstInput.value).dividedBy(offerPrice).times(tradeFee);
		if (inputVal.isNaN()) {
			this.lbFee.caption = `0 ${firstSymbol}`;
			this.secondInput.value = '';
		} else {
			this.lbFee.caption = `${formatNumber(new BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstSymbol}`;
			this.secondInput.value = inputVal.dp(secondTokenObject?.decimals || 18, ROUNDING_NUMBER).toFixed();
		}
		this.updateCommissionInfo();
		this.updateBtnSwap();
	}

	private secondInputChange = () => {
		const { firstTokenObject, secondTokenObject } = this.buybackModel;
		limitInputNumber(this.secondInput, secondTokenObject?.decimals || 18);
		if (!this.buybackModel.buybackInfo) return;
		const { offerPrice, tradeFee } = this.buybackModel.buybackInfo.queueInfo || {} as ProviderGroupQueueInfo;
		const firstSymbol = firstTokenObject?.symbol || '';
		const inputVal = new BigNumber(this.secondInput.value).multipliedBy(offerPrice).dividedBy(tradeFee);
		if (inputVal.isNaN()) {
			this.firstInput.value = '';
			this.lbFee.caption = `0 ${firstSymbol}`;
		} else {
			this.firstInput.value = inputVal.dp(firstTokenObject?.decimals || 18, ROUNDING_NUMBER).toFixed();
			this.lbFee.caption = `${formatNumber(new BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstSymbol}`;
		}
		this.updateCommissionInfo();
		this.updateBtnSwap();
	}

	private onSetMaxBalance = async () => {
		const { tradeFee, offerPrice } = this.buybackModel.buybackInfo.queueInfo || {} as ProviderGroupQueueInfo;
		const { firstTokenObject, secondTokenObject } = this.buybackModel;
		const firstInputValue = this.buybackModel.getAvailable(this.commissions);
		this.firstInput.value = new BigNumber(firstInputValue).dp(firstTokenObject?.decimals || 18, ROUNDING_NUMBER).toFixed();
		const inputVal = new BigNumber(this.firstInput.value).dividedBy(offerPrice).times(tradeFee);
		this.secondInput.value = inputVal.dp(secondTokenObject?.decimals || 18, ROUNDING_NUMBER).toFixed();
		this.lbFee.caption = `${formatNumber(new BigNumber(1).minus(tradeFee).times(this.firstInput.value), 6)} ${firstTokenObject?.symbol || ''}`;
		this.updateCommissionInfo();
		this.updateBtnSwap();
	}

	private updateBtnSwap = () => {
		if (!this.state.isRpcWalletConnected()) {
			this.btnSwap.enabled = true;
			this.btnSwap.caption = this.submitButtonText;
			return;
		}
		if (!this.buybackModel.buybackInfo) return;
		if (this.buybackModel.isSwapDisabled) {
			this.btnSwap.enabled = false;
			this.btnSwap.caption = this.submitButtonText;
			return;
		}
		const firstVal = new BigNumber(this.firstInput.value);
		const secondVal = new BigNumber(this.secondInput.value);
		const firstAvailable = this.buybackModel.firstAvailableBalance;
		const secondAvailable = this.buybackModel.secondAvailableBalance;

		const commissionAmount = this.state.getCommissionAmount(this.commissions, firstVal);
		const balance = new BigNumber(this.buybackModel.secondTokenBalance);
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
		if (this.buybackModel.buybackInfo && this.isApproveButtonShown) {
			const info = this.buybackModel.buybackInfo.queueInfo;
			this.approvalModelAction.doApproveAction(this.buybackModel.firstTokenObject, info.tokenInAvailable);
		} else {
			this.approvalModelAction.doPayAction();
		}
	}

	private onSubmit = async () => {
		if (!this.buybackModel.buybackInfo || !this.buybackModel.buybackInfo.queueInfo) return;
		const { firstTokenObject, secondTokenObject } = this.buybackModel;
		const fromAmount = new BigNumber(this.firstInput?.value || 0);
		const toAmount = new BigNumber(this.secondInput?.value || 0);
		const commissionAmount = this.state.getCommissionAmount(this.commissions, fromAmount);
		this.showResultMessage('warning', this.i18n.get('$swapping_to', { from: `${formatNumber(fromAmount.plus(commissionAmount))} ${firstTokenObject?.symbol}`, to: `${formatNumber(this.secondInput.value)} ${secondTokenObject?.symbol}`}));
		const { error } = await this.buybackModel.executeSwap(fromAmount, toAmount, this.commissions);
		if (error) {
			this.isSubmitting = false;
			this.showResultMessage('error', error as any);
		}
	}

	private updateInput = (enabled: boolean) => {
		this.firstInput.enabled = enabled;
		this.secondInput.enabled = enabled;
	}

	private get submitButtonText() {
		return this.buybackModel.getSubmitButtonText(this.isApproveButtonShown, this.isSubmitting, this.firstInput.value, this.secondInput.value, this.commissions);
	}

	private initApprovalModelAction = async () => {
		if (!this.state.isRpcWalletConnected()) return;
		if ((this.buybackModel.isExpired || this.buybackModel.isUpcoming) && this.btnSwap) {
			this.updateBtnSwap();
			return;
		}
		this.approvalModelAction = await this.state.setApprovalModelAction({
			sender: this,
			payAction: this.onSubmit,
			onToBeApproved: async (token: ITokenObject) => {
				this.isApproveButtonShown = true;
				this.btnSwap.enabled = true;
				this.btnSwap.caption = this.i18n.get(this.state.isRpcWalletConnected() ? '$approve' : '$switch_network');
			},
			onToBePaid: async (token: ITokenObject) => {
				this.updateBtnSwap();
				this.isApproveButtonShown = false;
				this.btnSwap.caption = this.submitButtonText;
			},
			onApproving: async (token: ITokenObject, receipt?: string, data?: any) => {
				this.showResultMessage('success', receipt || '');
				this.isSubmitting = true;
				this.btnSwap.rightIcon.visible = true;
				this.btnSwap.caption = this.i18n.get('$approving');
				this.updateInput(false);
			},
			onApproved: async (token: ITokenObject, data?: any) => {
				this.isSubmitting = false;
				this.isApproveButtonShown = false;
				this.btnSwap.rightIcon.visible = false;
				this.btnSwap.caption = this.submitButtonText;
				this.updateInput(true);
				this.updateBtnSwap();
			},
			onApprovingError: async (token: ITokenObject, err: Error) => {
				this.showResultMessage('error', err);
				this.updateInput(true);
				this.isSubmitting = false;
				this.btnSwap.caption = this.i18n.get('$approve');
				this.btnSwap.rightIcon.visible = false;
			},
			onPaying: async (receipt?: string, data?: any) => {
				this.showResultMessage('success', receipt || '');
				this.isSubmitting = true;
				this.btnSwap.rightIcon.visible = true;
				this.btnSwap.caption = this.submitButtonText;
				this.updateInput(false);
			},
			onPaid: async (data?: any) => {
				await this.initializeWidgetConfig(true);
				this.isSubmitting = false;
				this.firstInput.value = '';
				this.secondInput.value = '';
				this.btnSwap.rightIcon.visible = false;
				this.btnSwap.caption = this.submitButtonText;
			},
			onPayingError: async (err: Error) => {
				this.showResultMessage('error', err);
				this.isSubmitting = false;
				this.btnSwap.rightIcon.visible = false;
				this.btnSwap.enabled = true;
				this.btnSwap.caption = this.submitButtonText;
			}
		});
		this.state.approvalModel.spenderAddress = this.contractAddress;
		const { firstTokenObject, firstAvailableBalance } = this.buybackModel;
		await this.approvalModelAction.checkAllowance(firstTokenObject, firstAvailableBalance);
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
					<i-label caption={isClientConnected ? '$no_buybacks' : '$please_connect_with_your_wallet'} />
				</i-vstack>
				{!isClientConnected ? <i-button
					caption="$connect_wallet"
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

	private onToggleDetail = () => {
		const isExpanding = this.detailWrapper.visible;
		this.detailWrapper.visible = !isExpanding;
		this.btnDetail.caption = this.i18n.get(isExpanding ? '$more_information' : '$hide_information');
		this.btnDetail.rightIcon.name = isExpanding ? 'caret-down' : 'caret-up';
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
		if (this.buybackModel.buybackInfo) {
			this.infoStack.clearInnerHTML();
			const chainId = this.chainId;
			const isRpcConnected = this.state.isRpcWalletConnected();
			const { firstTokenObject, firstTokenBalance, secondTokenObject, firstAvailableBalance, secondAvailableBalance, buybackInfo } = this.buybackModel;
			const { amount, allowAll, tradeFee, available, offerPrice, startDate, endDate } = buybackInfo?.queueInfo || {} as ProviderGroupQueueInfo;
			const firstSymbol = firstTokenObject?.symbol || '';
			const secondSymbol = secondTokenObject?.symbol || '';
			const rate = `1 ${firstSymbol} : ${formatNumber(new BigNumber(1).dividedBy(offerPrice))} ${secondSymbol}`;
			const reverseRate = `1 ${secondSymbol} : ${offerPrice} ${firstSymbol}`;
			const hStackEndTime = await HStack.create({ gap: 4, verticalAlignment: 'center' });
			const lbEndTime = await Label.create({ caption: this.i18n.get('$end_time'), font: { size: '0.875rem', bold: true } });
			hStackEndTime.appendChild(lbEndTime);
			hStackEndTime.appendChild(<i-label caption={formatDate(endDate)} font={{ size: '0.875rem', bold: true, color: Theme.colors.primary.main }} margin={{ left: 'auto' }} />);

			const balance = firstTokenBalance;
			const commissionFee = this.state.embedderCommissionFee;
			const hasCommission = !!this.state.getCurrentCommissions(this.commissions).length;
			const lbRate = new Label(undefined, {
				caption: rate,
				font: { bold: true, color: Theme.colors.primary.main },
			});
			let isToggled = false;
			const onToggleRate = () => {
				isToggled = !isToggled;
				lbRate.caption = isToggled ? reverseRate : rate;
			}
			this.infoStack.clearInnerHTML();
			this.infoStack.appendChild(
				<i-panel padding={{ bottom: '0.5rem', top: '0.5rem', right: '1rem', left: '1rem' }} height="auto">
					<i-vstack gap={10} width="100%">
						<i-vstack id="detailWrapper" gap={10} width="100%" visible={false}>
							{hStackEndTime}
							<i-hstack gap={4} verticalAlignment="center" wrap="wrap">
								<i-label caption="$group_queue_balance" />
								<i-label caption={`${formatNumber(amount || 0)} ${secondSymbol}`} margin={{ left: 'auto' }} />
							</i-hstack>
							<i-hstack gap={4} verticalAlignment="center" wrap="wrap">
								<i-label caption="$your_allocation" />
								<i-label caption={allowAll ? '$unlimited' : `${formatNumber(available || 0)} ${secondSymbol}`} margin={{ left: 'auto' }} />
							</i-hstack>
							<i-hstack gap={4} verticalAlignment="center" wrap="wrap">
								<i-label caption="$your_balance" />
								<i-label caption={`${formatNumber(balance || 0)} ${firstSymbol}`} margin={{ left: 'auto' }} />
							</i-hstack>
						</i-vstack>
						<i-button
							id="btnDetail"
							caption="$more_information"
							rightIcon={{ width: 10, height: 16, margin: { left: 5 }, fill: Theme.text.primary, name: 'caret-down' }}
							background={{ color: 'transparent' }}
							border={{ width: 1, style: 'solid', color: Theme.text.primary, radius: 8 }}
							width={300}
							maxWidth="100%"
							height={36}
							margin={{ top: 4, bottom: 16, left: 'auto', right: 'auto' }}
							onClick={this.onToggleDetail}
						/>
						<i-hstack gap={4} verticalAlignment="center" horizontalAlignment="space-between" wrap="wrap">
							<i-label caption="$buyback_price" font={{ bold: true }} />
							<i-hstack gap="0.5rem" verticalAlignment="center" horizontalAlignment="end">
								{lbRate}
								<i-icon
									name="exchange-alt"
									width={14}
									height={14}
									fill={Theme.text.primary}
									opacity={0.9}
									cursor="pointer"
									onClick={onToggleRate}
								/>
							</i-hstack>
						</i-hstack>
						<i-hstack gap={4} wrap="wrap">
							<i-label caption="$swap_available" />
							<i-vstack gap={4} margin={{ left: 'auto' }} horizontalAlignment="end">
								<i-label caption={`${formatNumber(firstAvailableBalance)} ${firstSymbol}`} font={{ color: Theme.colors.primary.main }} />
								<i-label caption={`(${formatNumber(secondAvailableBalance)} ${secondSymbol})`} font={{ color: Theme.colors.primary.main }} />
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
									caption="$max"
									enabled={isRpcConnected && new BigNumber(firstAvailableBalance).gt(0)}
									padding={{ top: 3, bottom: 3, left: 6, right: 6 }}
									border={{ radius: 6 }}
									font={{ size: '14px' }}
									class="btn-os"
									onClick={this.onSetMaxBalance}
								/>
								<i-image width={24} height={24} url={tokenAssets.tokenPath(firstTokenObject, chainId)} fallbackUrl={fallBackUrl} />
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
									caption="$max"
									enabled={isRpcConnected && new BigNumber(secondAvailableBalance).gt(0)}
									padding={{ top: 3, bottom: 3, left: 6, right: 6 }}
									border={{ radius: 6 }}
									font={{ size: '14px' }}
									class="btn-os"
									onClick={this.onSetMaxBalance}
								/>
								<i-image width={24} height={24} url={tokenAssets.tokenPath(secondTokenObject, chainId)} fallbackUrl={fallBackUrl} />
								<i-label caption={secondSymbol} font={{ color: Theme.input.fontColor, bold: true }} />
							</i-hstack>
						</i-hstack>
					</i-vstack>
					<i-hstack gap={10} margin={{ top: 6 }} verticalAlignment="center" horizontalAlignment="space-between">
						<i-label caption={this.i18n.get('$trade_fee_value', { value: isNaN(Number(tradeFee)) ? '' : `(${new BigNumber(1).minus(tradeFee).multipliedBy(100).toFixed()}%)`})} font={{ size: '0.75rem' }} />
						<i-label id="lbFee" caption={`0 ${firstSymbol}`} font={{ size: '0.75rem' }} />
					</i-hstack>
					<i-hstack id="hStackCommission" visible={hasCommission} gap={10} margin={{ top: 6 }} verticalAlignment="center" horizontalAlignment="space-between">
						<i-hstack gap={4} verticalAlignment="center">
							<i-label caption="$commission_fee" font={{ size: '0.75rem' }} />
							<i-icon tooltip={{ content: this.i18n.get('$a_commission_fee_of_value_will_be_applied_to_the_amount_you_input', { value : new BigNumber(commissionFee).times(100).toFixed() })}} name="question-circle" width={14} height={14} />
						</i-hstack>
						<i-label id="lbCommissionFee" caption={`0 ${firstSymbol}`} font={{ size: '0.75rem' }} />
					</i-hstack>
					<i-vstack margin={{ top: 15 }} verticalAlignment="center" horizontalAlignment="center">
						<i-panel>
							<i-button
								id="btnSwap"
								minWidth={150}
								minHeight={36}
								caption={this.state.isRpcWalletConnected() ? '$swap' : '$switch_network'}
								border={{ radius: 12 }}
								rightIcon={{ spin: true, visible: false, fill: '#fff' }}
								padding={{ top: 4, bottom: 4, left: 16, right: 16 }}
								class="btn-os"
								onClick={this.onSwap.bind(this)}
							/>
						</i-panel>
					</i-vstack>
				</i-panel>
			);
			const currentTime = moment().valueOf();
			if (this.buybackModel.isUpcoming) {
				const startTime = moment(startDate).valueOf();
				setTimeout(() => {
					this.updateBtnSwap();
				}, currentTime - startTime);
			}
			if (!this.buybackModel.isExpired) {
				const endTime = moment(endDate).valueOf();
				setTimeout(() => {
					this.updateBtnSwap();
				}, endTime - currentTime);
			}
		} else {
			this.renderEmpty();
		}
	}

	async init() {
		this.i18n.init({ ...translations });
		this.initModels();
		super.init();
		const lazyLoad = this.getAttribute('lazyLoad', true, false);
		if (!lazyLoad) {
			const defaultChainId = this.getAttribute('defaultChainId', true);
			const chainId = this.getAttribute('chainId', true, defaultChainId || 0);
			const logo = this.getAttribute('logo', true);
			const title = this.getAttribute('title', true);
			const offerIndex = this.getAttribute('offerIndex', true, 0);
			const tokenIn = this.getAttribute('tokenIn', true, '');
			const customTokenIn = this.getAttribute('customTokenIn', true, '');
			const tokenOut = this.getAttribute('tokenOut', true, '');
			const customTokenOut = this.getAttribute('customTokenOut', true, '');
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
				customTokenIn,
				tokenOut,
				customTokenOut,
				// commissions,
				defaultChainId,
				networks,
				wallets,
				showHeader
			};
			if (!this.buybackModel.isEmptyData(data)) {
				await this.configModel.setData(data);
			} else {
				await this.renderEmpty();
			}
		}
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
							gap="0.5rem"
							width="100%"
							minWidth={320}
							maxWidth={500}
							height="100%"
							margin={{ left: 'auto', right: 'auto' }}
							horizontalAlignment="center"
							padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
							background={{ color: Theme.background.main }}
						/>
					</i-panel>
					<i-scom-tx-status-modal id="txStatusModal" />
					<i-scom-wallet-modal id="mdWallet" wallets={[]} />
				</i-panel>
			</i-scom-dapp-container>
		)
	}
}
