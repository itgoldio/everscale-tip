pragma ton-solidity >= 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;

import "../../../contracts/TIP4_1/TIP4_1Nft.sol";

contract TIP4_1NftCon is TIP4_1Nft {

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