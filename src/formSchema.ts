import { ComboBox, IComboItem } from '@ijstech/components';
import ScomNetworkPicker from '@scom/scom-network-picker';
import ScomTokenInput from '@scom/scom-token-input';
import { ChainNativeTokenByChainId, tokenStore } from "@scom/scom-token-list";
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

const themeUISchema = {
    type: 'Category',
    label: 'Theme',
    elements: [
        {
            type: 'VerticalLayout',
            elements: [
                {
                    type: 'Group',
                    label: 'Dark',
                    elements: [
                        {
                            type: 'HorizontalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    scope: '#/properties/dark/properties/backgroundColor'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/dark/properties/fontColor'
                                }
                            ]
                        },
                        {
                            type: 'HorizontalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    scope: '#/properties/dark/properties/inputBackgroundColor'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/dark/properties/inputFontColor'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'Group',
                    label: 'Light',
                    elements: [
                        {
                            type: 'HorizontalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    scope: '#/properties/light/properties/backgroundColor'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/light/properties/fontColor'
                                }
                            ]
                        },
                        {
                            type: 'HorizontalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    scope: '#/properties/light/properties/inputBackgroundColor'
                                },
                                {
                                    type: 'Control',
                                    scope: '#/properties/light/properties/inputFontColor'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
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
                themeUISchema
            ]
        },
        customControls() {
            return getCustomControls()
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
        customControls(getData: Function) {
            return getCustomControls(state, getData, true);
        }
    }
}

const getCustomControls = (state?: State, getData?: Function, isOwner?: boolean) => {
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
    const setTokenData = (control: ScomTokenInput, value: string, rowData: any) => {
        if (rowData) control.chainId = rowData.chainId;
        if (!control.chainId) control.chainId = networkPicker?.selectedNetwork?.chainId;
        if (isOwner && !value) {
            const tokens = tokenStore.getTokenList(control.chainId);
            let token = tokens.find(token => !token.address);
            control.token = token;
        } else {
            control.address = value;
        }
    }
    const setTokenByChainId = (control: ScomTokenInput, chainId: number) => {
        if (control && chainId !== control.chainId) {
            const noChainId = !control.chainId;
            control.chainId = chainId;
            if (noChainId && control.address) {
                control.address = control.address;
                control.onSelectToken(control.token);
            } else {
                control.token = undefined;
            }
        }
    }
    let controls = {
        '#/properties/chainId': {
            render: () => {
                networkPicker = new ScomNetworkPicker(undefined, {
                    type: 'combobox',
                    networks: [1, 56, 137, 250, 97, 80001, 43113, 43114, 42161, 421613].map(v => { return { chainId: v } }),
                    onCustomNetworkSelected: () => {
                        const chainId = networkPicker.selectedNetwork?.chainId;
                        if (firstTokenInput.chainId != chainId) {
                            firstTokenInput.token = null;
                            secondTokenInput.token = null;
                            firstTokenInput.chainId = chainId;
                            secondTokenInput.chainId = chainId;
                            if (isOwner) {
                                comboOfferIndex.items = offerIndexes = [];
                                comboOfferIndex.clear();
                            }
                        }
                    }
                });
                return networkPicker;
            },
            getData: (control: ScomNetworkPicker) => {
                return control.selectedNetwork?.chainId;
            },
            setData: (control: ScomNetworkPicker, value: number) => {
                control.setNetworkByChainId(value);
                setTokenByChainId(firstTokenInput, value);
                setTokenByChainId(secondTokenInput, value);
            }
        },
        '#/properties/tokenIn': {
            render: () => {
                firstTokenInput = new ScomTokenInput(undefined, {
                    type: 'combobox',
                    isBalanceShown: false,
                    isBtnMaxShown: false,
                    isInputShown: false
                });
                const chainId = networkPicker?.selectedNetwork?.chainId;
                if (chainId && firstTokenInput.chainId !== chainId) {
                    firstTokenInput.chainId = chainId;
                }
                if (isOwner) {
                    firstTokenInput.onSelectToken = onSelectToken;
                }
                return firstTokenInput;
            },
            getData: (control: ScomTokenInput) => {
                return (control.token?.address || control.token?.symbol);
            },
            setData: setTokenData
        },
        '#/properties/tokenOut': {
            render: () => {
                secondTokenInput = new ScomTokenInput(undefined, {
                    type: 'combobox',
                    isBalanceShown: false,
                    isBtnMaxShown: false,
                    isInputShown: false
                });
                const chainId = networkPicker?.selectedNetwork?.chainId;
                if (chainId && secondTokenInput.chainId !== chainId) {
                    secondTokenInput.chainId = chainId;
                }
                if (isOwner) {
                    secondTokenInput.onSelectToken = onSelectToken;
                }
                return secondTokenInput;
            },
            getData: (control: ScomTokenInput) => {
                return (control.token?.address || control.token?.symbol);
            },
            setData: setTokenData
        }
    }
    if (isOwner) {
        controls['#/properties/offerIndex'] = {
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
                    const nativeToken = ChainNativeTokenByChainId[data.chainId];
                    let tokenIn = data.tokenIn === nativeToken?.symbol ? nativeToken : tokens.find(token => (token.address ?? "") == data.tokenIn);
                    let tokenOut = data.tokenOut === nativeToken?.symbol ? nativeToken : tokens.find(token => (token.address ?? "") == data.tokenOut);
                    const indexes = await getOffers(state, data.chainId, tokenIn, tokenOut);
                    comboOfferIndex.items = offerIndexes = indexes.map(index => ({ label: index.toString(), value: index.toString() }));
                }
                control.selectedItem = offerIndexes.find(offer => offer.value === value.toString()) || null;
            },
        }
    }
    return controls;
}