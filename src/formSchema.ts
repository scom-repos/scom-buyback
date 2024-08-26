import { ComboBox, IComboItem, Input } from '@ijstech/components';
import ScomNetworkPicker from '@scom/scom-network-picker';
import ScomTokenInput, { CUSTOM_TOKEN } from '@scom/scom-token-input';
import { ChainNativeTokenByChainId, ITokenObject, tokenStore } from "@scom/scom-token-list";
import { getOffers } from './buyback-utils/index';
import { IBuybackCampaign } from './global/index';
import { comboBoxStyle, formInputStyle } from './index.css';
import { State, SupportedERC20Tokens } from './store/index';
import { nullAddress } from '@ijstech/eth-contract';

const getSupportedTokens = (chainId: number) => {
    return SupportedERC20Tokens[chainId] || [];
}


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

export function getSchema(state?: State, isOwner?: boolean) {
    const elements = [
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
            scope: '#/properties/customTokenIn',
            rule: {
                effect: 'ENABLE',
                condition: {
                    scope: '#/properties/tokenIn',
                    schema: {
                        const: CUSTOM_TOKEN.address
                    }
                }
            }
        },
        {
            type: 'Control',
            scope: '#/properties/tokenOut'
        },
        {
            type: 'Control',
            scope: '#/properties/customTokenOut',
            rule: {
                effect: 'ENABLE',
                condition: {
                    scope: '#/properties/tokenOut',
                    schema: {
                        const: CUSTOM_TOKEN.address
                    }
                }
            }
        }
    ]
    if (isOwner) {
        elements.push({
            type: 'Control',
            scope: '#/properties/offerIndex'
        })
    } else {
        elements.unshift({
            type: 'Control',
            scope: '#/properties/offerIndex'
        })
    }
    return {
        dataSchema: {
            type: 'object',
            properties: {
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
                customTokenIn: {
                    type: 'string',
                    title: 'Token In Address',
                    required: true
                },
                tokenOut: {
                    type: 'string',
                    required: true
                },
                customTokenOut: {
                    type: 'string',
                    title: 'Token Out Address',
                    required: true
                }
            }
        },
        uiSchema: {
            type: 'VerticalLayout',
            elements
        },
        customControls(getData?: Function) {
            return getCustomControls(state, getData, isOwner);
        }
    }
}

const getCustomControls = (state?: State, getData?: Function, isOwner?: boolean) => {
    let networkPicker: ScomNetworkPicker;
    let tokenInInput: ScomTokenInput;
    let customTokenInInput: Input;
    let tokenOutInput: ScomTokenInput;
    let customTokenOutInput: Input;
    let comboOfferIndex: ComboBox;
    let offerIndexes: IComboItem[] = [];
    const selectToken = async (token: ITokenObject, tokenInput: ScomTokenInput, customInput: Input) => {
        if (!token) {
            if (customInput) customInput.value = '';
        } else if (customInput) {
            const { address } = token;
            const isCustomToken = address?.toLowerCase() === CUSTOM_TOKEN.address.toLowerCase();
            if (!isCustomToken) {
                customInput.value = (address && address !== nullAddress) ? address : 'Native Token';
                if (customInput.value) (customInput as any).onChanged();
            } else {
                customInput.value = '';
            }
        }
        if (tokenInput.onChanged) {
            tokenInput.onChanged(tokenInput.token);
        }
        if (isOwner) {
            const chainId = networkPicker?.selectedNetwork?.chainId;
            if (chainId && tokenInInput.token && tokenOutInput.token) {
                const indexes = await getOffers(state, chainId, tokenInInput.token, tokenOutInput.token);
                comboOfferIndex.items = offerIndexes = indexes.map(index => ({ label: index.toString(), value: index.toString() }));
            }
        }
    }
    const setTokenData = async (tokenInput: ScomTokenInput, value: string, chainId: number, customInput: Input) => {
        await tokenInput.ready();
        tokenInput.chainId = chainId;
        tokenInput.address = value;
        if (tokenInput.onChanged) {
            tokenInput.onChanged(tokenInput.token);
        }
        if (customInput) {
            const isCustomToken = value?.toLowerCase() === CUSTOM_TOKEN.address.toLowerCase();
            if (!isCustomToken) {
                customInput.value = (value && value !== nullAddress) ? value : 'Native Token';
                if (customInput.value) (customInput as any).onChanged();
            }
        }
    }
    const setTokenByChainId = (chainId: number, tokenInput: ScomTokenInput, customInput: Input) => {
        if (tokenInput && chainId !== tokenInput.chainId) {
            const noChainId = !tokenInput.chainId;
            tokenInput.chainId = chainId;
            tokenInput.tokenDataListProp = getSupportedTokens(chainId);
            if (noChainId && tokenInput.address) {
                tokenInput.address = tokenInput.address;
                tokenInput.onSelectToken(tokenInput.token);
            } else {
                tokenInput.token = undefined;
                customInput.value = '';
                customInput.enabled = false;
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
                        if (tokenInInput.chainId != chainId) {
                            tokenInInput.token = null;
                            tokenOutInput.token = null;
                            tokenInInput.chainId = chainId;
                            tokenOutInput.chainId = chainId;
                            tokenInInput.tokenDataListProp = getSupportedTokens(chainId);
                            tokenOutInput.tokenDataListProp = getSupportedTokens(chainId);
                            customTokenInInput.value = '';
                            customTokenInInput.enabled = false;
                            customTokenOutInput.value = '';
                            customTokenOutInput.enabled = false;
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
                setTokenByChainId(value, tokenInInput, customTokenInInput);
                setTokenByChainId(value, tokenOutInput, customTokenOutInput);
            }
        },
        '#/properties/tokenIn': {
            render: () => {
                tokenInInput = new ScomTokenInput(undefined, {
                    type: 'combobox',
                    isBalanceShown: false,
                    isBtnMaxShown: false,
                    isInputShown: false,
                    isCustomTokenShown: true,
                    supportValidAddress: true
                });
                const chainId = networkPicker?.selectedNetwork?.chainId;
                tokenInInput.chainId = chainId;
                tokenInInput.tokenDataListProp = getSupportedTokens(chainId);
                tokenInInput.onSelectToken = (token: ITokenObject) => {
                    selectToken(token, tokenInInput, customTokenInInput);
                }
                return tokenInInput;
            },
            getData: (control: ScomTokenInput) => {
                return (control.token?.address || control.token?.symbol);
            },
            setData: async (control: ScomTokenInput, value: string, rowData: any) => {
                await setTokenData(control, value, rowData?.chainId, customTokenInInput);
            }
        },
        '#/properties/customTokenIn': {
            render: () => {
                customTokenInInput = new Input(undefined, {
                    inputType: 'text',
                    height: '42px',
                    width: '100%'
                });
                customTokenInInput.classList.add(formInputStyle);
                return customTokenInInput;
            },
            getData: (control: Input) => {
                return control.value;
            },
            setData: async (control: Input, value: string) => {
                await control.ready();
                control.value = value;
                if (!value && tokenInInput?.token) {
                    const address = tokenInInput.address;
                    const isCustomToken = address?.toLowerCase() === CUSTOM_TOKEN.address.toLowerCase();
                    if (!isCustomToken) {
                        control.value = (address && address !== nullAddress) ? address : 'Native Token';
                    }
                }
            }
        },
        '#/properties/tokenOut': {
            render: () => {
                tokenOutInput = new ScomTokenInput(undefined, {
                    type: 'combobox',
                    isBalanceShown: false,
                    isBtnMaxShown: false,
                    isInputShown: false,
                    isCustomTokenShown: true,
                    supportValidAddress: true
                });
                const chainId = networkPicker?.selectedNetwork?.chainId;
                tokenOutInput.chainId = chainId;
                tokenOutInput.tokenDataListProp = getSupportedTokens(chainId);
                tokenOutInput.onSelectToken = (token: ITokenObject) => {
                    selectToken(token, tokenOutInput, customTokenOutInput);
                }
                return tokenOutInput;
            },
            getData: (control: ScomTokenInput) => {
                return (control.token?.address || control.token?.symbol);
            },
            setData: async (control: ScomTokenInput, value: string, rowData: any) => {
                await setTokenData(control, value, rowData?.chainId, customTokenOutInput);
            }
        },
        '#/properties/customTokenOut': {
            render: () => {
                customTokenOutInput = new Input(undefined, {
                    inputType: 'text',
                    height: '42px',
                    width: '100%'
                });
                customTokenOutInput.classList.add(formInputStyle);
                return customTokenOutInput;
            },
            getData: (control: Input) => {
                return control.value;
            },
            setData: async (control: Input, value: string) => {
                await control.ready();
                control.value = value;
                if (!value && tokenOutInput?.token) {
                    const address = tokenOutInput.address;
                    const isCustomToken = address?.toLowerCase() === CUSTOM_TOKEN.address.toLowerCase();
                    if (!isCustomToken) {
                        control.value = (address && address !== nullAddress) ? address : 'Native Token';
                    }
                }
            }
        },
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