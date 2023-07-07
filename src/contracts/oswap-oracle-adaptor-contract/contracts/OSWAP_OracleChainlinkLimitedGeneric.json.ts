export default {
"abi":[
{"inputs":[{"internalType":"address","name":"factory","type":"address"},{"internalType":"address","name":"_weth","type":"address"},{"internalType":"address[]","name":"token","type":"address[]"},{"internalType":"address[]","name":"_pricefeeds","type":"address[]"}],"stateMutability":"nonpayable","type":"constructor"},
{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"chainlinkDeicmals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"payload","type":"bytes"}],"name":"getLatestPrice","outputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"fromAmount","type":"uint256"},{"internalType":"uint256","name":"toAmount","type":"uint256"},{"internalType":"bytes","name":"payload","type":"bytes"}],"name":"getRatio","outputs":[{"internalType":"uint256","name":"numerator","type":"uint256"},{"internalType":"uint256","name":"denominator","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"}],"name":"isSupported","outputs":[{"internalType":"bool","name":"supported","type":"bool"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"priceFeedAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
],
"bytecode":"60c06040526001805460ff191660121790553480156200001e57600080fd5b50604051620011dd380380620011dd833981810160405260808110156200004457600080fd5b815160208301516040808501805191519395929483019291846401000000008211156200007057600080fd5b9083019060208201858111156200008657600080fd5b8251866020820283011164010000000082111715620000a457600080fd5b82525081516020918201928201910280838360005b83811015620000d3578181015183820152602001620000b9565b5050505090500160405260200180516040519392919084640100000000821115620000fd57600080fd5b9083019060208201858111156200011357600080fd5b82518660208202830111640100000000821117156200013157600080fd5b82525081516020918201928201910280838360005b838110156200016057818101518382015260200162000146565b50505050919091016040525050506001600160601b0319606085811b821660805286901b1660a052508051825114620001e0576040805162461bcd60e51b815260206004820152601660248201527f4172726179206c656e677468206e6f74206d6174636800000000000000000000604482015290519081900360640190fd5b60005b8251811015620002ed5760006001600160a01b03166000808584815181106200020857fe5b6020908102919091018101516001600160a01b0390811683529082019290925260400160002054161462000283576040805162461bcd60e51b815260206004820152601960248201527f7072696365206665656420616c72656164792065786973747300000000000000604482015290519081900360640190fd5b8181815181106200029057fe5b6020026020010151600080858481518110620002a857fe5b6020908102919091018101516001600160a01b0390811683529082019290925260400160002080546001600160a01b03191692909116919091179055600101620001e3565b505050505060805160601c60a05160601c610ea36200033a600039806104e75280610515528061066152508061034e52806103d252806104c35280610904528061099d5250610ea36000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80638e9e56ef1161005b5780638e9e56ef146101fe578063ad5c464814610206578063c45a01551461020e578063d9da4fe61461021657610088565b8063313ce5671461008d578063495e4348146100ab57806375aa41741461015357806388462c8d146101af575b600080fd5b6100956102d1565b6040805160ff9092168252519081900360200190f35b610141600480360360608110156100c157600080fd5b73ffffffffffffffffffffffffffffffffffffffff823581169260208101359091169181019060608101604082013564010000000081111561010257600080fd5b82018360208201111561011457600080fd5b8035906020019184600183028401116401000000008311171561013657600080fd5b5090925090506102d6565b60408051918252519081900360200190f35b6101866004803603602081101561016957600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16610322565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b6101ea600480360360408110156101c557600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135811691602001351661034a565b604080519115158252519081900360200190f35b6100956104b8565b6101866104c1565b6101866104e5565b6102b8600480360360a081101561022c57600080fd5b73ffffffffffffffffffffffffffffffffffffffff823581169260208101359091169160408201359160608101359181019060a08101608082013564010000000081111561027957600080fd5b82018360208201111561028b57600080fd5b803590602001918460018302840111640100000000831117156102ad57600080fd5b509092509050610509565b6040805192835260208301919091528051918290030190f35b601290565b60008060006102ea87876000808989610509565b90925090506103178161030b84670de0b6b3a764000063ffffffff6107be16565b9063ffffffff61083816565b979650505050505050565b60006020819052908152604090205473ffffffffffffffffffffffffffffffffffffffff1681565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156103d0575073ffffffffffffffffffffffffffffffffffffffff8082166000908152602081905260409020541615156104b2565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610454575073ffffffffffffffffffffffffffffffffffffffff8083166000908152602081905260409020541615156104b2565b73ffffffffffffffffffffffffffffffffffffffff808416600090815260208190526040808220548584168352912054908216911681158015906104ad575073ffffffffffffffffffffffffffffffffffffffff811615155b925050505b92915050565b60015460ff1681565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000081565b600080856106585760007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663f98126f9896040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156105b057600080fd5b505afa1580156105c4573d6000803e3d6000fd5b505050506040513d60208110156105da57600080fd5b5051905080156106525780861061065257604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f4f535741503a204f766572204c696d6974000000000000000000000000000000604482015290519081900360640190fd5b506107a0565b846107a05760007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663f98126f98a6040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156106fc57600080fd5b505afa158015610710573d6000803e3d6000fd5b505050506040513d602081101561072657600080fd5b50519050801561079e5780871061079e57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f4f535741503a204f766572204c696d6974000000000000000000000000000000604482015290519081900360640190fd5b505b6107ae88888888888861087a565b915091505b965096945050505050565b6000826107cd575060006104b2565b828202828482816107da57fe5b0414610831576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180610e206021913960400191505060405180910390fd5b9392505050565b600061083183836040518060400160405280601a81526020017f536166654d6174683a206469766973696f6e206279207a65726f000000000000815250610b22565b6000808673ffffffffffffffffffffffffffffffffffffffff168873ffffffffffffffffffffffffffffffffffffffff161415610902576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180610df76029913960400191505060405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168873ffffffffffffffffffffffffffffffffffffffff16141561099b5773ffffffffffffffffffffffffffffffffffffffff80881660009081526020819052604081205490911661098981610bde565b60ff16600a0a945092506107b3915050565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff161415610a355773ffffffffffffffffffffffffffffffffffffffff808916600090815260208190526040812054909116610a2281610bde565b90945060ff16600a0a92506107b3915050565b73ffffffffffffffffffffffffffffffffffffffff80891660009081526020819052604081205490911690610a6982610bde565b73ffffffffffffffffffffffffffffffffffffffff808c166000908152602081905260408120549397509193509190911690610aa482610bde565b909550905060ff8084169082161115610ae757610ae0610ad060ff83811690861663ffffffff610d4516565b8790600a0a63ffffffff6107be16565b9550610b13565b610b10610b0060ff85811690841663ffffffff610d4516565b8690600a0a63ffffffff6107be16565b94505b50505050965096945050505050565b60008183610bc8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610b8d578181015183820152602001610b75565b50505050905090810190601f168015610bba5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b506000838581610bd457fe5b0495945050505050565b60008073ffffffffffffffffffffffffffffffffffffffff8316610c6357604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601b60248201527f4f535741503a2070726963652066656564206e6f7420666f756e640000000000604482015290519081900360640190fd5b60008373ffffffffffffffffffffffffffffffffffffffff1663feaf968c6040518163ffffffff1660e01b815260040160a06040518083038186803b158015610cab57600080fd5b505afa158015610cbf573d6000803e3d6000fd5b505050506040513d60a0811015610cd557600080fd5b506020015160015460ff169250905060008113610d3d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602d815260200180610e41602d913960400191505060405180910390fd5b939092509050565b600061083183836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060008184841115610dee576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201818152835160248401528351909283926044909101919085019080838360008315610b8d578181015183820152602001610b75565b50505090039056fe4f535741503a2066726f6d20616e6420746f2061646472657373657320617265207468652073616d65536166654d6174683a206d756c7469706c69636174696f6e206f766572666c6f774f535741505f4f7261636c65436861696e6c696e6b3a204e65676174697665206f72207a65726f207072696365a2646970667358221220d693beb71c699eade3bab904441fe50d4c9b451b63784ee50da7ff6f8de0f3c764736f6c634300060b0033"
}