# Order


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [readonly] [default to undefined]
**status** | [**OrderStatusEnum**](OrderStatusEnum.md) |  | [optional] [default to undefined]
**created_at** | **string** |  | [readonly] [default to undefined]
**updated_at** | **string** |  | [readonly] [default to undefined]
**customer** | **number** |  | [optional] [default to undefined]
**products** | **Array&lt;string&gt;** |  | [readonly] [default to undefined]

## Example

```typescript
import { Order } from './api';

const instance: Order = {
    id,
    status,
    created_at,
    updated_at,
    customer,
    products,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
