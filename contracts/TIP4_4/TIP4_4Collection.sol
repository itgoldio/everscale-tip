pragma ton-solidity = 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import '../TIP4_1/TIP4_1Collection.sol';
import './interfaces/ITIP4_4Collection.sol';
import './Storage.sol';
import './TIP4_4Nft.sol';


abstract contract TIP4_4Collection is TIP4_1Collection, ITIP4_4Collection {
    
    TvmCell _codeStorage;

    uint128 _storageDeployValue = 0.5 ever;

    constructor(
        TvmCell codeStorage
    ) public {
        TvmCell empty;
        require(codeStorage != empty, CollectionErrors.value_is_empty);
        tvm.accept();

        _codeStorage = codeStorage;

        _supportedInterfaces[
            bytes4(tvm.functionId(ITIP4_4Collection.storageCode)) ^
            bytes4(tvm.functionId(ITIP4_4Collection.storageCodeHash)) ^
            bytes4(tvm.functionId(ITIP4_4Collection.resolveStorage))
        ] = true;

    }

    function storageCode() external override view responsible returns (TvmCell code) {
        return {value: 0, flag: 64, bounce: false} (_codeStorage);
    }

    function storageCodeHash() external override view responsible returns (uint256 codeHash) {
        return {value: 0, flag: 64, bounce: false} (tvm.hash(_codeStorage)); 
    }

    function resolveStorage(address nft) external override view responsible returns (address storage) {
        TvmCell stateInit = tvm.buildStateInit({
            code : _codeStorage,
            varInit : {
                _nft : nft
            },
            contr : Storage
        });

        return {value: 0, flag: 64, bounce: false} (address(tvm.hash(stateInit)));         
    }

    function _deployStorage(
        address uploader,
        string mimeType,
        uint128 chunksNum
    ) internal virtual returns(address newStorage) {
        address nft = _resolveNft(uint256(_totalSupply));
        newStorage = new Storage{
            code : _codeStorage,
            value : _storageDeployValue,
            varInit : {
                _nft : nft
            }
        } (
            uploader,
            address(this),
            mimeType,
            chunksNum
        );
    }

    function _buildNftState(
        TvmCell code,
        uint256 id
    ) internal virtual override pure returns (TvmCell) {
        return tvm.buildStateInit({
            contr: TIP4_4Nft,
            varInit: {_id: id},
            code: code
        });
    }

}