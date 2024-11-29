
import { Module } from "@ijstech/components";
import { IBuybackCampaign, ICommissionInfo } from "../global/index";
import { getProxySelectors } from "../swap-utils/index";
import { State } from "../store/index";
import { Constants, IEventBusRegistry, Wallet } from "@ijstech/eth-wallet";
import { INetworkConfig } from "@scom/scom-network-picker";
import { IWalletPlugin } from "@scom/scom-wallet-modal";
import { getSchema } from '../formSchema';
import ScomCommissionFeeSetup from "@scom/scom-commission-fee-setup";
import configData from "../data.json";

interface IConfigOptions {
  refreshWidget: () => Promise<void>;
  refreshDappContainer: () => void;
  setContaiterTag: (value: any) => void;
  updateTheme: () => void;
}

export class ConfigModel {
  private state: State;
  private module: Module;
  private options: IConfigOptions = {
    refreshWidget: async () => { },
    refreshDappContainer: () => { },
    setContaiterTag: (value: any) => { },
    updateTheme: () => { }
  };
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
  private rpcWalletEvents: IEventBusRegistry[] = [];

  constructor(state: State, module: Module, options: IConfigOptions) {
    this.state = state;
    this.module = module;
    this.options = options;
  }

  get chainId() {
    return this.state.getChainId();
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

  private get rpcWallet() {
    return this.state.getRpcWallet();
  }

  private _getActions(category?: string) {
    const formSchema = getSchema();
    const actions: any[] = [];

    if (category !== 'offers') {
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
                customTokenIn,
                tokenOut,
                customTokenOut,
                ...themeSettings
              } = userInputData;

              const generalSettings = {
                title,
                logo,
                offerIndex,
                chainId,
                tokenIn,
                customTokenIn,
								tokenOut,
								customTokenOut
              };

              this._data.chainId = generalSettings.chainId;
              this._data.title = generalSettings.title;
              this._data.logo = generalSettings.logo;
              this._data.offerIndex = generalSettings.offerIndex;
              this._data.tokenIn = generalSettings.tokenIn;
              this._data.customTokenIn = generalSettings.customTokenIn;
              this._data.tokenOut = generalSettings.tokenOut;
              this._data.customTokenOut = generalSettings.customTokenOut;
              await this.resetRpcWallet();
              this.refreshData(builder);

              oldTag = JSON.parse(JSON.stringify(this.module.tag));
              if (builder?.setTag) builder.setTag(themeSettings);
              else this.setTag(themeSettings);
              this.options.setContaiterTag(themeSettings);
            },
            undo: async () => {
              this._data = JSON.parse(JSON.stringify(oldData));
              this.refreshData(builder);

              const tag = JSON.parse(JSON.stringify(oldTag));
              this.module.tag = tag;
              if (builder?.setTag) builder.setTag(tag);
              else this.setTag(tag);
              this.options.setContaiterTag(tag);
            },
            redo: () => { }
          }
        },
        userInputDataSchema: formSchema.dataSchema,
        userInputUISchema: formSchema.uiSchema,
        customControls: formSchema.customControls()
      });
    }

    return actions;
  }

  private getProjectOwnerActions() {
    const formSchema = getSchema(this.state, true);
    const actions: any[] = [
      {
        name: 'Settings',
        userInputDataSchema: formSchema.dataSchema,
        userInputUISchema: formSchema.uiSchema,
        customControls: formSchema.customControls(this.getData.bind(this))
      }
    ];
    return actions;
  }

  getConfigurators() {
    const self = this;
    return [
      {
        name: 'Project Owner Configurator',
        target: 'Project Owners',
        getProxySelectors: async (chainId: number) => {
          const selectors = await getProxySelectors(this.state, chainId);
          return selectors;
        },
        getActions: () => {
          return this.getProjectOwnerActions();
        },
        getData: this.getData.bind(this),
        setData: async (data: any) => {
          await this.setData(data);
        },
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      },
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
      },
      {
        name: 'Editor',
        target: 'Editor',
        getActions: (category?: string) => {
          const actions = this._getActions(category);
          const editAction = actions.find(action => action.name === 'Edit');
          return editAction ? [editAction] : [];
        },
        getData: this.getData.bind(this),
        setData: async (data: any) => {
          const defaultData = configData.defaultBuilderData;
          await this.setData({ ...defaultData, ...data });
        },
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      }
    ]
  }

  getData() {
    return this._data;
  }

  async setData(data: IBuybackCampaign) {
    this._data = data;
    await this.resetRpcWallet();
    await this.options.refreshWidget();
  }

  async getTag() {
    return this.module.tag;
  }

  setTag(value: any) {
    const newValue = value || {};
    for (let prop in newValue) {
      if (newValue.hasOwnProperty(prop)) {
        if (prop === 'light' || prop === 'dark')
          this.updateTag(prop, newValue[prop]);
        else
          this.module.tag[prop] = newValue[prop];
      }
    }
    this.options.setContaiterTag(this.module.tag);
    this.options.updateTheme();
  }

  private updateTag(type: 'light' | 'dark', value: any) {
    this.module.tag[type] = this.module.tag[type] ?? {};
    for (let prop in value) {
      if (value.hasOwnProperty(prop))
        this.module.tag[type][prop] = value[prop];
    }
  }

  private refreshData = (builder: any) => {
    this.options.refreshDappContainer();
    this.options.refreshWidget();
    if (builder?.setData) {
      builder.setData(this._data);
    }
  }

  removeRpcWalletEvents = () => {
    const rpcWallet = this.rpcWallet;
    for (let event of this.rpcWalletEvents) {
      rpcWallet.unregisterWalletEvent(event);
    }
    this.rpcWalletEvents = [];
  }

  resetRpcWallet = async () => {
    this.removeRpcWalletEvents();
    const rpcWalletId = await this.state.initRpcWallet(this.defaultChainId);
    const rpcWallet = this.rpcWallet;
    const chainChangedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.ChainChanged, async (chainId: number) => {
      this.options.refreshWidget();
    });
    const connectedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
      this.options.refreshWidget();
    });
    this.rpcWalletEvents.push(chainChangedEvent, connectedEvent);
    this.options.refreshDappContainer();
  }

  initWallet = async () => {
    try {
      await Wallet.getClientInstance().init();
      await this.rpcWallet.init();
    } catch (err) {
      console.log(err);
    }
  }
}