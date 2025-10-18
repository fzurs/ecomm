# PatchedUserDetails


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [readonly] [default to undefined]
**first_name** | **string** |  | [optional] [default to undefined]
**last_name** | **string** |  | [optional] [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**username** | **string** | Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. | [optional] [default to undefined]
**is_staff** | **boolean** | Designates whether the user can log into this admin site. | [optional] [default to undefined]

## Example

```typescript
import { PatchedUserDetails } from './api';

const instance: PatchedUserDetails = {
    id,
    first_name,
    last_name,
    email,
    username,
    is_staff,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
