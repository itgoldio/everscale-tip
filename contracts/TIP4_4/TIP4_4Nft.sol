// ItGold.io Contracts (v1.0.0) 
pragma ton-solidity = 0.58.1;

pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;


import '../TIP4_1/TIP4_1Nft.sol';
import './interfaces/ITIP4_4NFT.sol';


/// @title One of the required contracts of an TIP4-1(Non-Fungible Token Standard) compliant technology.
/// For detect what interfaces a smart contract implements used TIP-6.1 standard. ...
/// ... Read more here (https://github.com/nftalliance/docs/blob/main/src/Standard/TIP-6/1.md)
abstract contract TIP4_4Nft is TIP4_1Nft, ITIP4_4NFT {

    address _storage;
    bool _active;

    constructor(
        address storageAddr
    ) public {
        tvm.accept();

        _storage = storageAddr;

        _supportedInterfaces[
            bytes4(tvm.functionId(ITIP4_4NFT.onStorageFillComplete)) ^
            bytes4(tvm.functionId(ITIP4_4NFT.getStorage))
        ] = true;

    }

    function onStorageFillComplete(address gasReceiver) external override {
        require(msg.sender == _storage);
        tvm.rawReserve(0, 4);

        _active = true;

        gasReceiver.transfer({value: 0, flag: 128 + 2});
    }

    function getStorage() external view override responsible returns (address addr) {
        return {value: 0, flag: 64} (_storage);
    }

    modifier onlyManager virtual override {
        require(msg.sender == _manager, NftErrors.sender_is_not_manager);
        require(_active);
        _;
    }

}