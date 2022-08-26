pragma ton-solidity >= 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import "../../../contracts/TIP4_1/TIP4_1Collection.sol";
import "./TIP4_1NftCon.sol";


contract TIP4_1CollectionCon is TIP4_1Collection {
    
    constructor(TvmCell codeNft) TIP4_1Collection(codeNft) public {
        tvm.accept();
    }

    function mintNft(
        uint128 id,
        address owner
    ) external returns(address nftAddr) {
        tvm.accept();

        TvmCell codeNft = _buildNftCode(address(this));
        TvmCell stateNft = _buildNftState(codeNft, uint256(id));
        nftAddr = new TIP4_1NftCon{
            stateInit: stateNft,
            value: 0.5 ever,
            flag: 1
        }(
            owner,
            address(this),
            0.3 ever
        ); 

        _totalSupply++;
    }

    function nftCodeWithoutSalt() external view responsible returns (TvmCell nftCode) {
        return {value: 0, flag: 64, bounce: false} (_codeNft);
    }

    function _buildNftState(
        TvmCell code,
        uint256 id
    ) internal virtual override pure returns (TvmCell) {
        return tvm.buildStateInit({
            contr: TIP4_1NftCon,
            varInit: {_id: id},
            code: code
        });
    }
}
