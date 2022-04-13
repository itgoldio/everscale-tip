pragma ton-solidity = 0.58.1;

/**
    Reserved codes - 100-149
 */
library NftErrors {
    uint8 constant value_is_empty = 101;
    uint8 constant sender_is_not_collection = 102;
    uint8 constant sender_is_not_manager = 103;
    uint8 constant value_is_less_than_required = 104;
}