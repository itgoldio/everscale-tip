pragma ton-solidity >= 0.58.0;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import 'interfaces/ITIP4_4Storage.sol';
import 'interfaces/ITIP4_4NFT.sol';


contract Storage is ITIP4_4Storage {
    address static _nft;
    
    address _uploader;
    address _collection;
    string _mimeType;
    uint128 _chunksNum;
    bool _active;

    uint128 _chunksUploaded;
    mapping(uint8 => bytes) _chunks;

    /// @dev по сути рекваер на sender не нужен т.к. collection мы любой в параметр можем передать. Может static сделать?
    constructor(
        address uploader,
        address collection,
        string mimeType,
        uint128 chunksNum
    ) public {
        require(msg.sender == collection);
        tvm.accept();
        
        _uploader = uploader;
        _collection = collection;
        _mimeType = mimeType;
        _chunksNum = chunksNum;
    }

    function fill(uint8 id, bytes chunk) external override onlyUploader {
        require(!_active, 103, "All chunks are filled");
        require(id < _chunksNum);
        require(!_chunks.exists(id));
        require(_chunksUploaded < _chunksNum);
        tvm.rawReserve(0, msg.value);
        
        _chunks[id] = chunk;
        _chunksUploaded++;

        if (_chunksUploaded == _chunksNum) {
            _active = true;
            ITIP4_4NFT(_nft).onStorageFillComplete{value: 0, flag: 128}(msg.sender);
        } else {
            msg.sender.transfer({value: 0, flag: 64 + 2});
        }
    }

    function getInfo() external view responsible override returns (
        address nft,
        address collection,
        string mimeType,
        mapping(uint8 => bytes) content
    ) {
        return {value: 0, flag: 64} (
            _nft, 
            _collection,
            _mimeType,
            _chunks
        );
    }

    function destruct(address gasReceiver) public {
        require(_active, 103, "Not all chunks are filled");
        require(msg.sender == _nft, 101, "Method for nft only");
        selfdestruct(gasReceiver);
    }

    modifier onlyUploader() {
        require(msg.sender == _uploader, 101, "Method for uploader only");
        _;
    }

}