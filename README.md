# everscale-tip


# What is needed for development?

- Install [TON Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler.git)
- Install [TVM linker](https://github.com/tonlabs/TVM-linker/releases/tag/0.14.2)
- Install [nmp](https://www.npmjs.com/)

# Initialize project

1. Create empty folder and move to it
1. Init npm project. ```npm init -y```
1. Install itgold library for development NFT. ```npm i @itgold/everscale-tip```

# How to use library

1. Create ```Nft.sol``` file and fill it.

```solidity
pragma ton-solidity = 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import '@itgold/everscale-tip/contracts/TIP4_1/TIP4_1Nft.sol';

contract Nft is TIP4_1Nft {

    constructor(
        address owner,
        address sendGasTo,
        uint128 remainOnNft
    ) TIP4_1Nft(
        owner,
        sendGasTo,
        remainOnNft
    ) public {}

}
```

2. Create ```Collection.sol``` file and fill it.

```solidity
pragma ton-solidity = 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import '@itgold/everscale-tip/contracts/TIP4_1/TIP4_1Collection.sol';
import '@itgold/everscale-tip/contracts/access/OwnableExternal.sol';
import './Nft.sol';

contract Collection is TIP4_1Collection, OwnableExternal {

    /**
    * Errors
    **/
    uint8 constant sender_is_not_owner = 100;
    uint8 constant value_is_less_than_required = 101;

    /// _remainOnNft - the number of crystals that will remain after the entire mint 
    /// process is completed on the Nft contract
    uint128 _remainOnNft = 0.3 ton;

    constructor(
        TvmCell codeNft, 
        uint256 ownerPubkey
    ) OwnableExternal(
        ownerPubkey
    ) TIP4_1Collection (
        codeNft
    ) public {
        tvm.accept();
    }

    function mintNft() external virtual {
        require(msg.value > _remainOnNft + 0.1 ton, value_is_less_than_required);
        tvm.rawReserve(0, 4);

        uint256 id = uint256(_totalSupply);
        _totalSupply++;

        TvmCell codeNft = _buildNftCode(address(this));
        TvmCell stateNft = _buildNftState(codeNft, id);
        address nftAddr = new Nft{
            stateInit: stateNft,
            value: 0,
            flag: 128
        }(
            msg.sender,
            msg.sender,
            _remainOnNft
        ); 

        emit NftCreated(
            id, 
            nftAddr,
            msg.sender,
            msg.sender, 
            msg.sender
        );
    
    }

    function setRemainOnNft(uint128 remainOnNft) external virtual {
        require(TIP4_1Collection._isOwner(), sender_is_not_owner);
        _remainOnNft = remainOnNft;
    } 

    function _isOwner() internal override onlyOwner returns(bool){
        return true;
    }

    function _buildNftState(
        TvmCell code,
        uint256 id
    ) internal virtual override pure returns (TvmCell) {
        return tvm.buildStateInit({
            contr: Nft,
            varInit: {_id: id},
            code: code
        });
    }

}
```

> TIP: You can use another samples from [everscale-tip-samples](https://github.com/itgoldio/everscale-tip-samples/tree/main/demo)

# Build project

1. build ```Nft.sol``` file to use [TON Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler.git)
   1. ```solc Nft.sol --include-path node_modules```
1. build ```Collection.sol``` file to use [TON Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler.git)
   1. ```solc Collection.sol --include-path node_modules```
1. compile ```Nft.code``` file to use  [TVM linker](https://github.com/tonlabs/TVM-linker/releases/tag/0.14.2) 
   1. ```tvm_linker compile --abi-json Nft.abi.json Nft.code --lib stdlib_sol.tvm -o Nft.tvc```
1. compile ```Collection.code``` file to use  [TVM linker](https://github.com/tonlabs/TVM-linker/releases/tag/0.14.2) 
   1. ```tvm_linker compile --abi-json Collection.abi.json Collection.code --lib stdlib_sol.tvm -o Collection.tvc```

# Deploy NFT

Deploy ```Collection.tvc``` use [ever-sdk](https://github.com/tonlabs/ever-sdk) or [cli](https://github.com/tonlabs/tonos-cli)

