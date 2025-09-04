# PatchedUserDetails

User model w/o password

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**pk** | **number** |  | [optional] [readonly] [default to undefined]
**username** | **string** | Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. | [optional] [default to undefined]
**email** | **string** |  | [optional] [readonly] [default to undefined]
**first_name** | **string** |  | [optional] [default to undefined]
**last_name** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { PatchedUserDetails } from './api';

const instance: PatchedUserDetails = {
    pk,
    username,
    email,
    first_name,
    last_name,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
