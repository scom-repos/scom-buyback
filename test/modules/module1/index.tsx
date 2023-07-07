import { Module, customModule, Container } from '@ijstech/components';
import ScomBuyback from '@scom/scom-buyback';

@customModule
export default class Module1 extends Module {

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        super.init();
    }

    render() {
        return <i-panel>
            <i-hstack id="mainStack" margin={{ top: '1rem', left: '1rem' }} gap="2rem">
                <i-scom-buyback
                    defaultChainId={97}
                    chainId={97}
                    projectName="OSwap IDO Buyback"
                    description="This is the second IDO Buyback of OSWAP with a buyback price at 20% of the IDO Price. 90% of the IDO Amount will be covered on a prorated basis."
                    offerIndex={35}
                    tokenIn="0x45eee762aaeA4e5ce317471BDa8782724972Ee19"
                    tokenOut="0xDe9334C157968320f26e449331D6544b89bbD00F"
                    networks={[
                        {
                            chainId: 43113
                        },
                        {
                            chainId: 97
                        }
                    ]}
                    wallets={[
                        {
                            name: "metamask"
                        }
                    ]}
                />
            </i-hstack>
        </i-panel>
    }
}