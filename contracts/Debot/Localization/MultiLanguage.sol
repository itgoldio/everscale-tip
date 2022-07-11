pragma ton-solidity = 0.58.1;

import "../interfaces/ILanguageStorage.sol";

interface MultiLanguageEvents {
    event NewLanguage(string iso, address languageStorage);
    event RemoveLanguage(string iso, address languageStorage);
}

// Used ISO 639‑1
abstract contract MultiLanguage is MultiLanguageEvents {

    uint256 public editorPubkey;
    // Ex. ("EN" => language contract)
    mapping(string=>address) m_languages;
    // Ex. (tvm.hash("EN") => "EN")
    mapping(uint256=>string) public m_iso;
    // Lexicographically sorted iso
    string[] public sortedIso;

    constructor() public {
        require(msg.pubkey() == tvm.pubkey() && tvm.pubkey() != 0, 100);
        editorPubkey = tvm.pubkey();
    }

    function addLanguage(string iso, address languageStorage) external virtual onlyEditor {
        tvm.accept();
        emit MultiLanguageEvents.NewLanguage(iso, languageStorage);
        m_languages[iso] = languageStorage;
        m_iso[tvm.hash(iso)] = iso;
        _sort();
    }

    function removeLanguage(string iso) external virtual onlyEditor {
        tvm.accept();
        emit MultiLanguageEvents.RemoveLanguage(iso, m_languages[iso]);
        delete m_languages[iso];
        delete m_iso[tvm.hash(iso)];
        _sort();
    }

    function _sort() internal {
        delete sortedIso;
        for((uint256 isoHash, ) : m_iso) {
            sortedIso.push(m_iso[isoHash]);
        }
    }

    function _loadLanguageData(uint32 callbackFunctionId, uint32 callbackErrorFunctionId, string iso, uint16[] ids) internal virtual view {
        if(m_languages.exists(iso)) {
            optional(uint256) none;
            ILanguageStorage(m_languages[iso]).getStrings{
                sign: false,
                pubkey: none,
                time: uint64(now),
                expire: 0,
                callbackId: callbackFunctionId,
                onErrorId: callbackErrorFunctionId
            }(ids).extMsg;
        }
    }

    function setEditorPubkey(uint256 newEditorPubkey) external virtual onlyEditor {
        tvm.accept();
        editorPubkey = newEditorPubkey;
    }


    function getLanguages() external view responsible returns(string[] iso, address[] languageStorage){
        for((uint256 isoHash, ) : m_iso) {
            languageStorage.push(m_languages[m_iso[isoHash]]);
        }
        return{value: 0, flag:64}(sortedIso, languageStorage);
    }

    modifier onlyEditor() {
        require(msg.pubkey() == editorPubkey);
        _;
    }
}