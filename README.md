# TIP4 NFT

# Prerequisites

- Install [npm](https://www.npmjs.com/)
- Install [Locklift](https://github.com/broxus/locklift.git)


# Initialize project

1. Create empty folder and move to it
2. Init locklift project. ```locklift init -y```
3. Install library for NFT. ```npm i tip4```
4. Add NFT contracts to `externalContracts` and `precompiled` sections of your `locklift.config.ts`

# How to run tests
```npm run test```

# How to use library

1. Create ```Nft.tsol``` file and fill it.

```solidity
pragma ton-solidity >= 0.62.0;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import 'tip4/contracts/NftBase.tsol';

contract Nft is NftBase {

    constructor(
        address owner,
        address sendGasTo,
        uint128 remainOnNft
    ) NftBase(
        owner,
        sendGasTo,
        remainOnNft
    ) public {}

}
```

2. Create ```Collection.tsol``` file and fill it.

```solidity
pragma ton-solidity >= 0.62.0;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import 'tip4/contracts/CollectionBase.tsol';
import './Nft.tsol';

contract Collection is CollectionBase {

    /**
    * Errors
    **/
    uint8 constant value_is_less_than_required = 100;

    /// _remainOnNft - the number of coins that will remain after mint
    uint128 _remainOnNft = 3_000_000_00;

    constructor(
        TvmCell codeNft
    ) CollectionBase (
        codeNft
    ) public {
        tvm.accept();
    }

    function mintNft() external virtual {
        require(msg.value > _remainOnNft + 1_000_000_00, value_is_less_than_required);
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

# Build

```shell
npx locklift build
```

