pragma ton-solidity >= 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import "../../../contracts/TIP4_1/TIP4_1Nft.sol";
import "../../../contracts/TIP4_2/TIP4_2Nft.sol";


contract TIP4_2NftCon is TIP4_1Nft, TIP4_2Nft {

    constructor(
        address owner,
        address sendGasTo,
        uint128 remainOnNft,
        string json
    ) TIP4_1Nft(
        owner,
        sendGasTo,
        remainOnNft
    ) TIP4_2Nft (
        json
    ) public {
        tvm.accept();
    }

}