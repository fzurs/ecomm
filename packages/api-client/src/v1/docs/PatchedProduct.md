# PatchedProduct


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [readonly] [default to undefined]
**category** | [**Category**](Category.md) |  | [optional] [readonly] [default to undefined]
**category_id** | **number** |  | [optional] [default to undefined]
**brand** | [**Brand**](Brand.md) |  | [optional] [readonly] [default to undefined]
**brand_id** | **number** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**slug** | **string** |  | [optional] [default to undefined]
**sku** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**price** | **string** |  | [optional] [default to undefined]
**stock_quantity** | **number** |  | [optional] [default to undefined]
**status** | [**ProductStatusEnum**](ProductStatusEnum.md) |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [readonly] [default to undefined]
**updated_at** | **string** |  | [optional] [readonly] [default to undefined]

## Example

```typescript
import { PatchedProduct } from './api';

const instance: PatchedProduct = {
    id,
    category,
    category_id,
    brand,
    brand_id,
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
