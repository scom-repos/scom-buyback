import { ComboBox, IComboItem } from '@ijstech/components';
import ScomNetworkPicker from '@scom/scom-network-picker';
import ScomTokenInput from '@scom/scom-token-input';
import { tokenStore } from "@scom/scom-token-list";
import { getOffers } from './buyback-utils/index';
import { IBuybackCampaign } from './global/index';
import { comboBoxStyle } from './index.css';
import { State } from './store/index';


const theme = {
    type: 'object',
    properties: {
        backgroundColor: {
            type: 'string',
            format: 'color'
        },
        fontColor: {
            type: 'string',
            format: 'color'
        },
        inputBackgroundColor: {
            type: 'string',
            format: 'color'
        },
        inputFontColor: {
            type: 'string',
            format: 'color'
        }
    }
}

export function getBuilderSchema() {
    return {
        dataSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string'
                },
                logo: {
                    type: 'string',
                    format: 'data-url'
                },
                offerIndex: {
                    type: 'number',
                    required: true
                },
                chainId: {
                    type: 'number',
                    required: true
                },
                tokenIn: {
                    type: 'string',
                    required: true
                },
                tokenOut: {
                    type: 'string',
                    required: true
                },
                dark: theme,
                light: theme
            }
        },
        uiSchema: {
            type: 'Categorization',
            elements: [
                {
                    type: 'Category',
                    label: 'General',
                    elements: [
                        {
                            type: 'VerticalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    scope: '#/properties/title'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/logo'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/offerIndex'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/chainId'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/tokenIn'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/tokenOut'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'Category',
                    label: 'Theme',
                    elements: [
                        {
                            type: 'VerticalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    label: 'Dark',
                                    scope: '#/properties/dark'
                                },
                                {
                                    type: 'Control',
                                    label: 'Light',
                                    scope: '#/properties/light'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        customControls(rpcWalletId: string) {
            let networkPicker: ScomNetworkPicker;
            let firstTokenInput: ScomTokenInput;
            let secondTokenInput: ScomTokenInput;
            return {
                "#/properties/chainId": {
                    render: () => {
                        networkPicker = new ScomNetworkPicker(undefined, {
                            type: 'combobox',
                            networks: [1, 56, 137, 250, 97, 80001, 43113, 43114].map(v => { return { chainId: v } }),
                            onCustomNetworkSelected: () => {
                                const chainId = networkPicker.selectedNetwork?.chainId;
                                firstTokenInput.chainId = chainId;
                                secondTokenInput.chainId = chainId;
                            }
                        });
                        return networkPicker;
                    },
                    getData: (control: ScomNetworkPicker) => {
                        return control.selectedNetwork?.chainId;
                    },
                    setData: (control: ScomNetworkPicker, value: number) => {
                        control.setNetworkByChainId(value);
                        if (firstTokenInput) firstTokenInput.chainId = value;
                        if (secondTokenInput) secondTokenInput.chainId = value;
                    }
                },
                "#/properties/tokenIn": {
                    render: () => {
                        firstTokenInput = new ScomTokenInput(undefined, {
                            type: 'combobox',
                            isBalanceShown: false,
                            isBtnMaxShown: false,
                            isInputShown: false,
                            maxWidth: 300
                        });
                        firstTokenInput.rpcWalletId = rpcWalletId;
                        const chainId = networkPicker?.selectedNetwork?.chainId;
                        if (chainId && firstTokenInput.chainId !== chainId) {
                            firstTokenInput.chainId = chainId;
                        }
                        return firstTokenInput;
                    },
                    getData: (control: ScomTokenInput) => {
                        return control.token?.address || control.token?.symbol;
                    },
                    setData: (control: ScomTokenInput, value: string) => {
                        control.address = value;
                    }
                },
                "#/properties/tokenOut": {
                    render: () => {
                        secondTokenInput = new ScomTokenInput(undefined, {
                            type: 'combobox',
                            isBalanceShown: false,
                            isBtnMaxShown: false,
                            isInputShown: false,
                            maxWidth: 300
                        });
                        secondTokenInput.rpcWalletId = rpcWalletId;
                        const chainId = networkPicker?.selectedNetwork?.chainId;
                        if (chainId && secondTokenInput.chainId !== chainId) {
                            secondTokenInput.chainId = chainId;
                        }
                        return secondTokenInput;
                    },
                    getData: (control: ScomTokenInput) => {
                        return control.token?.address || control.token?.symbol;
                    },
                    setData: (control: ScomTokenInput, value: string) => {
                        control.address = value;
                    }
                }
            }

        }
    }
}

export function getProjectOwnerSchema(state: State) {
    return {
        dataSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string'
                },
                logo: {
                    type: 'string',
                    format: 'data-url'
                },
                chainId: {
                    type: 'number',
                    required: true
                },
                offerIndex: {
                    type: 'number',
                    required: true
                },
                tokenIn: {
                    type: 'string',
                },
                tokenOut: {
                    type: 'string',
                }
            }
        },
        uiSchema: {
            type: 'VerticalLayout',
            elements: [
                {
                    type: 'Control',
                    scope: '#/properties/title'
                },
                {
                    type: 'Control',
                    scope: '#/properties/logo'
                },
                {
                    type: 'Control',
                    scope: '#/properties/chainId'
                },
                {
                    type: 'Control',
                    scope: '#/properties/tokenIn'
                },
                {
                    type: 'Control',
                    scope: '#/properties/tokenOut'
                },
                {
                    type: 'Control',
                    scope: '#/properties/offerIndex'
                },
            ]
        },
        customControls(rpcWalletId: string, getData: Function) {
            let networkPicker: ScomNetworkPicker;
            let firstTokenInput: ScomTokenInput;
            let secondTokenInput: ScomTokenInput;
            let comboOfferIndex: ComboBox;
            let offerIndexes: IComboItem[] = [];
            const onSelectToken = async () => {
                const chainId = networkPicker?.selectedNetwork?.chainId;
                if (chainId && firstTokenInput.token && secondTokenInput.token) {
                    const indexes = await getOffers(state, chainId, firstTokenInput.token, secondTokenInput.token);
                    comboOfferIndex.items = offerIndexes = indexes.map(index => ({ label: index.toString(), value: index.toString() }));
                }
            }
            const setTokenData = (control: ScomTokenInput, value: string) => {
                if (!value) {
                    const chainId = networkPicker?.selectedNetwork?.chainId;
                    const tokens = tokenStore.getTokenList(chainId);
                    let token = tokens.find(token => !token.address);
                    control.token = token;
                } else {
                    control.address = value;
                }
            };
            return {
                "#/properties/chainId": {
                    render: () => {
                        networkPicker = new ScomNetworkPicker(undefined, {
                            type: 'combobox',
                            networks: [1, 56, 137, 250, 97, 80001, 43113, 43114].map(v => { return { chainId: v } }),
                            onCustomNetworkSelected: () => {
                                const chainId = networkPicker.selectedNetwork?.chainId;
                                if (firstTokenInput.chainId != chainId) {
                                    firstTokenInput.token = null;
                                    secondTokenInput.token = null;
                                    comboOfferIndex.items = offerIndexes = [];
                                    comboOfferIndex.clear();
                                }
                                firstTokenInput.chainId = chainId;
                                secondTokenInput.chainId = chainId;
                            }
                        });
                        return networkPicker;
                    },
                    getData: (control: ScomNetworkPicker) => {
                        return control.selectedNetwork?.chainId;
                    },
                    setData: (control: ScomNetworkPicker, value: number) => {
                        control.setNetworkByChainId(value);
                        if (firstTokenInput) firstTokenInput.chainId = value;
                        if (secondTokenInput) secondTokenInput.chainId = value;
                    }
                },
                "#/properties/tokenIn": {
                    render: () => {
                        firstTokenInput = new ScomTokenInput(undefined, {
                            type: 'combobox',
                            isBalanceShown: false,
                            isBtnMaxShown: false,
                            isInputShown: false
                        });
                        firstTokenInput.rpcWalletId = rpcWalletId;
                        const chainId = networkPicker?.selectedNetwork?.chainId;
                        if (chainId && firstTokenInput.chainId !== chainId) {
                            firstTokenInput.chainId = chainId;
                        }
                        firstTokenInput.onSelectToken = onSelectToken;
                        return firstTokenInput;
                    },
                    getData: (control: ScomTokenInput) => {
                        return control.token?.address || "";
                    },
                    setData: setTokenData
                },
                "#/properties/tokenOut": {
                    render: () => {
                        secondTokenInput = new ScomTokenInput(undefined, {
                            type: 'combobox',
                            isBalanceShown: false,
                            isBtnMaxShown: false,
                            isInputShown: false
                        });
                        secondTokenInput.rpcWalletId = rpcWalletId;
                        const chainId = networkPicker?.selectedNetwork?.chainId;
                        if (chainId && secondTokenInput.chainId !== chainId) {
                            secondTokenInput.chainId = chainId;
                        }
                        secondTokenInput.onSelectToken = onSelectToken;
                        return secondTokenInput;
                    },
                    getData: (control: ScomTokenInput) => {
                        return control.token?.address || "";
                    },
                    setData: setTokenData
                },
                "#/properties/offerIndex": {
                    render: () => {
                        comboOfferIndex = new ComboBox(undefined, {
                            height: '42px',
                            icon: {
                                name: 'caret-down'
                            },
                            items: offerIndexes
                        });
                        comboOfferIndex.classList.add(comboBoxStyle);
                        return comboOfferIndex;
                    },
                    getData: (control: ComboBox) => {
                        return Number((control.selectedItem as IComboItem)?.value);
                    },
                    setData: async (control: ComboBox, value: number) => {
                        const data: IBuybackCampaign = getData();
                        if (data.chainId && data.tokenIn != null && data.tokenOut != null) {
                            const tokens = tokenStore.getTokenList(data.chainId);
                            let tokenIn = tokens.find(token => (token.address ?? "") == data.tokenIn);
                            let tokenOut = tokens.find(token => (token.address ?? "") == data.tokenOut);
                            const indexes = await getOffers(state, data.chainId, tokenIn, tokenOut);
                            comboOfferIndex.items = offerIndexes = indexes.map(index => ({ label: index.toString(), value: index.toString() }));
                        }
                        control.selectedItem = offerIndexes.find(offer => offer.value === value.toString()) || null;
                    },
                }
            }
    
        }
    }
}