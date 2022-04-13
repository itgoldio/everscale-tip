# everscale-tip


# What is needed for development?

- Install [TON Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler.git)
- Install [TVM linker](https://github.com/tonlabs/TVM-linker/releases/tag/0.14.2)
- Install [nmp](https://www.npmjs.com/)
- Install  [TON locklift](https://github.com/broxus/ton-locklift)
- Install [tonos-cli](https://github.com/tonlabs/tonos-cli)

# Initialize project

```It will be easy soon```

1. Create empty folder and move to it
1. Initialize new [TON locklift](https://github.com/broxus/ton-locklift) project 
   - Run: ```locklift init``` You can do it only in empty folder. 
1. Init npm project. Run: ```npm init -y```
1. Install itgold library for development NFT. Run: ```npm i @itgold/everscale-tip```
1. Install [TON locklift](https://github.com/broxus/ton-locklift) directly for compile and deploy contracts. Run: ```npm i locklift```
1. Delete ```contracts/Sample.sol``` file
1. Create ```contracts/Nft.sol``` file

```
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
    ) public {
        tvm.accept();
    }
}
```
8. Create ```contracts/Collection.sol``` file

```
pragma ton-solidity = 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import '@itgold/everscale-tip/contracts/TIP4_1/TIP4_1Collection.sol';
import '@itgold/everscale-tip/contracts/access/OwnableExternal.sol';
import './Nft.sol';

contract Collection is TIP4_1Collection, OwnableExternal {

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
        require(msg.value > _remainOnNft + 0.1 ton, CollectionErrors.value_is_less_than_required);
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

    function setRemainOnNft(uint128 remainOnNft) external virtual onlyOwner {
        _remainOnNft = remainOnNft;
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

1. Change [locklift.config.js](locklift.config.js)
   1. update paths for ``compiler``, ``linker`` 
   1. Run: ``export TVM_LINKER_LIB_PATH=path to stdlib_sol.tvm``
1. Change ``package.json`` file
   1. add ``"build": "locklift build --config locklift.config.js"`` to ``scripts`` section
1. Build contracts. Run ```npm run build```

Build result in ``build`` folder.