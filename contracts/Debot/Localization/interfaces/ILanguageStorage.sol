pragma ton-solidity = 0.58.1;

interface ILanguageStorage {
    function getStrings(uint16[] ids) external view responsible returns(mapping(uint16=>string) data);
    function getLanguageInfo() external view responsible returns(string iso, mapping(uint16=>string) strings);
}