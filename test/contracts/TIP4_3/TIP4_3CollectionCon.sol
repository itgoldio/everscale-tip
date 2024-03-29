pragma ton-solidity >= 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import "../../../contracts/TIP4_3/TIP4_3Collection.sol";
import './TIP4_3NftCon.sol';


contract Collection is TIP4_3Collection {

    /// _remainOnNft - the number of crystals that will remain after the entire mint 
    /// process is completed on the Nft contract
    uint128 _remainOnNft = 0.3 ever;

    constructor(
        TvmCell codeNft, 
        TvmCell codeIndex,
        TvmCell codeIndexBasis
    ) TIP4_1Collection (
        codeNft
    ) TIP4_3Collection (
        codeIndex,
        codeIndexBasis
    ) public {
        tvm.accept();
    }

    function mintNft(
        uint128 id,
        address owner
    ) external virtual {
        tvm.accept();

        _totalSupply++;

        TvmCell codeNft = _buildNftCode(address(this));
        TvmCell stateNft = _buildNftState(codeNft, uint256(id));
        address nftAddr = new TIP4_3NftCon{
            stateInit: stateNft,
            value: 0.7 ever,
            flag: 1
        }(
            owner,
            owner,
            _remainOnNft,
            _indexDeployValue,
            _indexDestroyValue,
            _codeIndex
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
            contr: TIP4_3NftCon,
            varInit: {_id: id},
            code: code
        });
    }

}