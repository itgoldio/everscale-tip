pragma ton-solidity = 0.58.1;

import "../interfaces/ILanguageStorage.sol";
import "../access/OwnableExternal.sol";

library LanguageStorageExitCodes {
    uint16 constant WRONG_INPUT_DATA = 130;
    uint16 constant STRING_ALREADY_EXIST = 131;
    uint16 constant STRING_NOT_EXIST = 132;
    uint16 constant NULL_STRINGS = 133;
}

abstract contract LanguageStorage is ILanguageStorage, OwnableExternal {

    // Used ISO 639‑1 code
    string iso;

    mapping(uint16=>string) m_strings;

    constructor(string newIso, uint256 ownerPubkey) OwnableExternal(ownerPubkey) public {
        iso = newIso;
    }

    function addStrings(uint16[] ids, string[] str) external virtual onlyOwner {
        require(ids.length == str.length, LanguageStorageExitCodes.WRONG_INPUT_DATA);
        tvm.accept();
        for(uint16 i = 0; i < ids.length; i++) {
            if(!m_strings.exists(ids[i])) {
                m_strings[ids[i]] = str[i];
            }
            else {
                revert(LanguageStorageExitCodes.STRING_ALREADY_EXIST);
            }
        }
    }

    function replaceStrings(uint16[] ids, string[] str) external virtual onlyOwner {
        require(ids.length == str.length, LanguageStorageExitCodes.WRONG_INPUT_DATA);
        tvm.accept();
        for(uint16 i = 0; i < ids.length; i++) {
            if(m_strings.exists(ids[i])) {
                m_strings[ids[i]] = str[i];
            }
            else {
                revert(LanguageStorageExitCodes.STRING_NOT_EXIST);
            }
        }
    }

    function removeStrings(uint16[] ids) external virtual onlyOwner {
        tvm.accept();
        for(uint16 i = 0; i < ids.length; i++) {
            if(m_strings.exists(ids[i])) {
                delete m_strings[ids[i]];
            }
            else {
                revert(LanguageStorageExitCodes.STRING_NOT_EXIST);
            }
        }
    }

    function checkNull() internal virtual view returns(bool nullStrings) {
        for((uint16 id, string str) : m_strings) {
            if(str.empty()) {
                nullStrings = true;
            }
        }
    }

    function getStrings(uint16[] ids) external virtual override view responsible returns(mapping(uint16=>string) data) {
        if(!checkNull()) {
            for(uint16 id : ids) {
                if(m_strings.exists(id)) {
                    data[id] = m_strings[id];
                }
                else {
                    revert(LanguageStorageExitCodes.STRING_NOT_EXIST);
                }
            }
        }
        else {
            revert(LanguageStorageExitCodes.NULL_STRINGS);
        }
        return{value: 0, flag: 64}(data);
    }

    function getLanguageInfo() external override view responsible returns(string _iso, mapping(uint16=>string) _strings) {
        return{value: 0, flag:64}(iso, m_strings);
    }
}