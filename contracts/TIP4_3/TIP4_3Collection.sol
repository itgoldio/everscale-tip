/// We recommend using the compiler version 0.58.1. 
/// You can use other versions, but we do not guarantee compatibility of the compiler version.
pragma ton-solidity = 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import '../TIP4_1/TIP4_1Collection.sol';
import '../access/OwnableExternal.sol';
import './interfaces/ITIP4_3Collection.sol';
import './TIP4_3Nft.sol';
import './Index.sol';
import './IndexBasis.sol';


/// This contract implement TIP4_1Collection, ITIP4_3Collection (add indexes) and OwnableExternal for add owner role
abstract contract TIP4_3Collection is TIP4_1Collection, ITIP4_3Collection, OwnableExternal {
    
    /// TvmCell object code of Index contract
    TvmCell _codeIndex;

    /// TvmCell object code of IndexBasis contract
    TvmCell _codeIndexBasis;

    /// Values for deploy/destroy
    uint128 _indexDeployValue = 0.4 ton;
    uint128 _indexDestroyValue = 0.1 ton;
    uint128 _deployIndexBasisValue = 0.4 ton;

    constructor(
        TvmCell codeIndex,
        TvmCell codeIndexBasis,
        uint256 ownerPubkey
    ) OwnableExternal(
        ownerPubkey
    ) public {
        TvmCell empty;
        require(codeIndex != empty, CollectionErrors.value_is_empty);
        tvm.accept();

        _codeIndex = codeIndex;
        _codeIndexBasis = codeIndexBasis;

        _supportedInterfaces[
            bytes4(tvm.functionId(ITIP4_3Collection.indexBasisCode)) ^
            bytes4(tvm.functionId(ITIP4_3Collection.indexBasisCodeHash)) ^
            bytes4(tvm.functionId(ITIP4_3Collection.indexCode)) ^
            bytes4(tvm.functionId(ITIP4_3Collection.indexCodeHash)) ^
            bytes4(tvm.functionId(ITIP4_3Collection.resolveIndexBasis))
        ] = true;

    }

    /// @return indexBasis - Address of the deployed IndexBasis contract
    /// Can be called only by owner pubkey
    /// _codeIndexBasis can't be empty
    /// Balance value must be greater than _indexDeployValue
    function deployIndexBasis() external view responsible onlyOwner returns (address indexBasis) {
        TvmCell empty;
        require(_codeIndexBasis != empty, CollectionErrors.value_is_empty);
        require(address(this).balance > _deployIndexBasisValue);

        TvmCell code = _buildIndexBasisCode();
        TvmCell state = _buildIndexBasisState(code, address(this));
        indexBasis = new IndexBasis{stateInit: state, value: _deployIndexBasisValue}();
        return {value: 0, flag: 64} (indexBasis);
    }

    /// @param codeIndexBasis - code of IndexBasis contract
    function setIndexBasisCode(TvmCell codeIndexBasis) external virtual onlyOwner {
        _codeIndexBasis = codeIndexBasis;
    }

    /// @return code - code of IndexBasis contract
    function indexBasisCode() external view override responsible returns (TvmCell code) {
        return {value: 0, flag: 64} (_codeIndexBasis);
    }   

    /// @return hash - calculated hash based on the IndexBasis code
    function indexBasisCodeHash() external view override responsible returns (uint256 hash) {
        return {value: 0, flag: 64} tvm.hash(_buildIndexBasisCode());
    }

    /// @return indexBasis - address of IndexBasisCode
    function resolveIndexBasis() external view override responsible returns (address indexBasis) {
        TvmCell code = _buildIndexBasisCode();
        TvmCell state = _buildIndexBasisState(code, address(this));
        uint256 hashState = tvm.hash(state);
        indexBasis = address.makeAddrStd(0, hashState);
        return {value: 0, flag: 64} indexBasis;
    }

    /// @notice build IndexBasis code used TvmCell indexBasis code & salt (string stamp)
    /// @return TvmCell indexBasisCode 
    /// about salt read more here (https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#tvmcodesalt)
    function _buildIndexBasisCode() internal virtual view returns (TvmCell) {
        string stamp = "nft";
        TvmBuilder salt;
        salt.store(stamp);
        return tvm.setCodeSalt(_codeIndexBasis, salt.toCell());
    }

    /// @notice Generates a StateInit from code and data
    /// @param code TvmCell code - generated via the _buildIndexBasisCode method
    /// @param collection address of token collection contract
    /// @return TvmCell object - stateInit
    /// about tvm.buildStateInit read more here (https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#tvmbuildstateinit)
    function _buildIndexBasisState(
        TvmCell code,
        address collection
    ) internal virtual pure returns (TvmCell) {
        return tvm.buildStateInit({
            contr: IndexBasis,
            varInit: {_collection: collection},
            code: code
        });
    }

    /// @return code - code of Index contract
    function indexCode() external view override responsible returns (TvmCell code) {
        return {value: 0, flag: 64} (_codeIndex);
    }

    /// @return hash - calculated hash based on the Index code
    function indexCodeHash() external view override responsible returns (uint256 hash) {
        return {value: 0, flag: 64} tvm.hash(_codeIndex);
    }

    /// @notice build Index code used TvmCell index code & salt (string stamp, address collection, address owner)
    /// @return TvmCell indexBasisCode 
    /// about salt read more here (https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#tvmcodesalt)
    function _buildIndexCode(
        address collection,
        address owner
    ) internal virtual view returns (TvmCell) {
        TvmBuilder salt;
        salt.store("nft");
        salt.store(collection);
        salt.store(owner);
        return tvm.setCodeSalt(_codeIndex, salt.toCell());
    }

    /// @notice Generates a StateInit from code and data
    /// @param code TvmCell code - generated via the _buildIndexCode method
    /// @param nft address of Nft contract
    /// @return TvmCell object - stateInit
    /// about tvm.buildStateInit read more here (https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#tvmbuildstateinit)
    function _buildIndexState(
        TvmCell code,
        address nft
    ) internal virtual pure returns (TvmCell) {
        return tvm.buildStateInit({
            contr: Index,
            varInit: {_nft: nft},
            code: code
        });
    }

    /// Overrides standard method, because Nft contract is changed
    function _buildNftState(
        TvmCell code,
        uint256 id
    ) internal virtual override pure returns (TvmCell) {
        return tvm.buildStateInit({
            contr: TIP4_3Nft,
            varInit: {_id: id},
            code: code
        });
    }

}