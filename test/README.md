# Testing

The directory structure within the /test directory corresponds to the /contracts directory.

| Test        | Description           | Status  |
| ------------- |:-------------:| -----:|
| **Ownable External** |
| Load contract factory | | ✅ |
| Deploy contract | | ✅ |
| Common transfer ownership test | Token transfer with valid parameters | ✅ |
| Get owner test |  | ✅ |
| Only owner test | Check only owner require | ❌ (in dev.) |
| **Ownable internal** |
| Deploy contract |  | ✅ |
| Load contract factory |  | ✅ |
| Only owner test | Check only owner require | ✅ |
| Transfer ownership test with zero new owner address | Check require(newOwner != address(0)) | ✅ |
| Common transfer ownership test | Token transfer with valid parameters | ✅ |
| Get owner test |  | ✅ |
| **TIP4_1Collection (tip4-1-test)** |
| Load contract factory |  | ✅ |
| Deploy contract |  | ✅ |
| TIP6 test | | ✅ |
| Nft code test | | ✅ |
| Nft address test | | ✅ |
| **TIP4_1Nft (tip4-1-nft-test)** |
| Load contract factory |  | ✅ |
| Deploy contract |  | ✅ |
| TIP6 test | | ✅ |
| Common transfer test | Token transfer with valid parameters | ✅ |
| Transfer test with wrong owner | Check only manager require | ✅ |
| Change manager test with wrong manager | Check only manager require | ✅ |
| Change manager with the same manager test | If new Manager = current manager - event is not emitted | ✅ |
| Common change manager test | Change manager with valid parameters | ✅ |
| Change owner test with wrong sender | Check only manager require | ✅ |
| Change owner with the same owner test | If new Owner = current owner - event is not emitted | ✅ |
| Common change owner test | Change owner with valid parameters | ✅ |
| Transfer test with callbacks |  | ❌ (in dev.) |
| **TIP4_2Collection (tip4-2-test)** |
| Load contract factory |  | ✅ |
| Deploy contract |  | ✅ |
| TIP6 test | | ✅ |
| Nft code test | | ✅ |
| Nft address test | | ✅ |
| Get JSON test | | ✅ |
| **TIP4_2Nft (tip4-2-nft-test)** |
| Load contract factory |  | ✅ |
| Deploy contract |  | ✅ |
| TIP6 test | | ✅ |
| Common transfer test | Token transfer with valid parameters | ✅ |
| Transfer test with wrong sender | Check only manager require | ✅ |
| Change manager test with wrong sender | Check only manager require | ✅ |
| Change manager with the same manager test | If new Manager = current manager - event is not emitted | ✅ |
| Common change manager test | Change manager with valid parameters | ✅ |
| Change owner test with wrong sender | Check only manager require | ✅ |
| Change owner with the same owner test | If new Owner = current owner - event is not emitted | ✅ |
| Common change owner test | Change owner with valid parameters | ✅ |
| Get JSON test | Change owner with valid parameters | ✅ |
| Transfer test with callbacks |  | ❌ (in dev.) |
| **TIP4_3Collection (tip4-3-test)** |
| Load contract factory |  | ✅ |
| Deploy contract |  | ✅ |
| TIP6 test | | ✅ |
| Nft code test | | ✅ |
| Nft address test | | ✅ |
| Index code test | | ✅ |
| IndexBasis code test | | ✅ |
| Deploy IndexBasis test | | ✅ |
| IndexBasis getInfo test | | ✅ |
| **TIP4_3Nft (tip4-3-nft-test)** |
| Load contract factory |  | ✅ |
| Deploy contract |  | ✅ |
| TIP6 test | | ✅ |
| Common transfer test | Token transfer with valid parameters | ✅ |
| Transfer test with wrong sender | Check only manager require | ✅ |
| Change manager test with wrong sender | Check only manager require | ✅ |
| Change manager with the same manager test | If new Manager = current manager - event is not emitted | ✅ |
| Common change manager test | Change manager with valid parameters | ✅ |
| Change owner test with wrong sender | Check only manager require | ✅ |
| Change owner with the same owner test | If new Owner = current owner - event is not emitted | ✅ |
| Common change owner test | Change owner with valid parameters | ✅ |
| Get JSON test | Change owner with valid parameters | ✅ |
| Transfer test with callbacks |  | ❌ (in dev.) |
| **TIP6 (tip6-test)** |
| Load contract factory |  | ✅ |
| Deploy contract |  | ✅ |
| TIP6 test | | ✅ |