pragma ton-solidity >= 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import "../../../contracts/TIP4_2/TIP4_2Collection.sol";
import "./TIP4_2NftCon.sol";


contract Collection is TIP4_2Collection {

    constructor(
        TvmCell codeNft, 
        string json
    ) TIP4_1Collection (
        codeNft
    ) TIP4_2Collection (
        json
    ) public {
        tvm.accept();
    }

    function mintNft(
        uint128 id,
        address owner,
        string json
    ) external virtual {
        tvm.accept();

        _totalSupply++;

        TvmCell codeNft = _buildNftCode(address(this));
        TvmCell stateNft = _buildNftState(codeNft, uint256(id));
        address nftAddr = new TIP4_2NftCon{
            stateInit: stateNft,
            value: 0.2 ever,
            flag: 1
        }(
            owner,
            address(this),
            0.1 ever,
            json
        ); 
    }

    function nftCodeWithoutSalt() external view responsible returns (TvmCell nftCode) {
        return {value: 0, flag: 64, bounce: false} (_codeNft);
    }

    function _buildNftState(
        TvmCell code,
        uint256 id
    ) internal virtual override pure returns (TvmCell) {
        return tvm.buildStateInit({
            contr: TIP4_2NftCon,
            varInit: {_id: id},
            code: code
        });
    }

}