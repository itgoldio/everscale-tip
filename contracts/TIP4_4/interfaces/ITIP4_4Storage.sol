pragma ton-solidity >= 0.58.0;

interface ITIP4_4Storage {
    function fill(uint8 id, bytes chunk) external;
    function getInfo() external view responsible returns (
        address nft,
        address collection,
        string mimeType,
        mapping(uint8 => bytes) content
    );
}