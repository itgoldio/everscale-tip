# Multi-language Debot

## How to use

> TIP: You can use sample from [everscale-tip-samples](https://github.com/itgoldio/everscale-tip-samples/tree/main/demo)

1. Create & Inherit the `MultiLanguage.sol` in your `Debot` contract.
```sol
import "MultiLanguage.sol";

contract Debot is MultiLanguage {

    constructor() MultiLanguage() {
        tvm.accept();
    }

}
```
2. Set the `editorKey` for add and remove languages.
> Default value is tvm.pubkey().
```bash
tonos-cli --url <url_endpoint> call <debot_address> setEditorPubkey '{"newEditorPubkey": "your_pubkey>"}' --abi <abi_path> --sign <keys_path>
```
3. Create & Deploy language contract. Inherit the `LanguageStorage.sol` in your new contract.
* `string newIso` - Language code in ISO 639‑1.
* `uint256 ownerPubkey` - Owner pubkey for this contract.
> Use different keys for all language contracts, it is safe and serves to generate other addresses.
```sol
import "LanguageStorage.sol";

contract Language is LanguageStorage {

    constructor(string newIso, uint256 ownerPubkey) LanguageStorage(newIso, ownerPubkey) {
        tvm.accept();
    }

}
```
4. Add strings to `Language` contract.
```bash
tonos-cli --url <url_endpoint> call <language_address> addStrings '{"ids": [<array_of_id>], "str": [<array_of_strings>]}' --abi <abi_path> --sign <owner_keys_path>
```
* Replace strings.
    ```bash
    tonos-cli --url <url_endpoint> call <language_address> replaceStrings '{"ids": [<array_of_id>], "str": [<array_of_strings>]}' --abi <abi_path> --sign <owner_keys_path>
    ```
* Remove strings.
    ```bash
    tonos-cli --url <url_endpoint> call <language_address> removeStrings '{"ids": [<array_of_id>]}' --abi <abi_path> --sign <owner_keys_path>
    ```
5. Set `Language` contract address to `Debot`.
```bash
tonos-cli --url <url_endpoint> call <debot_address> addLanguage '{"iso": "<iso_code>", "languageStorage": "<language_address>"}' --abi <abi_path> --sign <editor_keys_path>
```
* Remove `Language` contract address from `Debot`.
    ```bash
    tonos-cli --url <url_endpoint> call <debot_address> removeLanguage '{"iso": "<iso_code>"}' --abi <abi_path> --sign <editor_keys_path>
    ```
6. Read data from `Language` contract in `Debot`.
```sol
// Example

library StringCodes {
    uint16 constant FIRST_STRING_ID = 0;
    uint16 constant SECOND_STRING_ID = 1;
    ...
}

...
_loadLanguageData(
    tvm.functionId(onLanguageDataLoad), 
    tvm.functionId(onErrorDataLoad), 
    "EN", 
    [
        StringCodes.FIRST_STRING_ID,
        StringCodes.SECOND_STRING_ID
        ...
    ]
);

function onSuccessDataLoad(mapping(uint16=>string) data) {
    string first = data[StringCodes.FIRST_STRING_ID],
    string second = data[StringCodes.SECOND_STRING_ID],
    ...
}
function onErrorDataLoad(uint32 sdkError, uint32 exitCode) {}
```