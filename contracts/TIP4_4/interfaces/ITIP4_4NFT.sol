pragma ton-solidity >= 0.58.0;

interface ITIP4_4NFT {
    function onStorageFillComplete(address gasReceiver) external;
    function getStorage() external view responsible returns (address addr);
}