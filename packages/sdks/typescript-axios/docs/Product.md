# Product


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [readonly] [default to undefined]
**category** | [**Category**](Category.md) |  | [readonly] [default to undefined]
**brand** | [**Brand**](Brand.md) |  | [readonly] [default to undefined]
**category_id** | **number** |  | [optional] [default to undefined]
**name** | **string** |  | [default to undefined]
**slug** | **string** |  | [optional] [default to undefined]
**sku** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**price** | **string** |  | [optional] [default to undefined]
**stock_quantity** | **number** |  | [optional] [default to undefined]
**status** | [**ProductStatusEnum**](ProductStatusEnum.md) |  | [optional] [default to undefined]
**created_at** | **string** |  | [readonly] [default to undefined]
**updated_at** | **string** |  | [readonly] [default to undefined]

## Example

```typescript
import { Product } from './api';

const instance: Product = {
    id,
    category,
    brand,
    category_id,
    name,
    slug,
    sku,
    description,
    price,
    stock_quantity,
    status,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
