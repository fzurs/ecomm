# ProductsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**productsCreate**](#productscreate) | **POST** /products/ | |
|[**productsDestroy**](#productsdestroy) | **DELETE** /products/{id}/ | |
|[**productsList**](#productslist) | **GET** /products/ | |
|[**productsPartialUpdate**](#productspartialupdate) | **PATCH** /products/{id}/ | |
|[**productsRetrieve**](#productsretrieve) | **GET** /products/{id}/ | |
|[**productsUpdate**](#productsupdate) | **PUT** /products/{id}/ | |

# **productsCreate**
> Product productsCreate(product)


### Example

```typescript
import {
    ProductsApi,
    Configuration,
    Product
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let product: Product; //

const { status, data } = await apiInstance.productsCreate(
    product
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **product** | **Product**|  | |


### Return type

**Product**

### Authorization

[basicAuth](../README.md#basicAuth), [cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **productsDestroy**
> productsDestroy()


### Example

```typescript
import {
    ProductsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: number; //A unique integer value identifying this product. (default to undefined)

const { status, data } = await apiInstance.productsDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this product. | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[basicAuth](../README.md#basicAuth), [cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No response body |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **productsList**
> Array<Product> productsList()


### Example

```typescript
import {
    ProductsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

const { status, data } = await apiInstance.productsList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Product>**

### Authorization

[basicAuth](../README.md#basicAuth), [cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **productsPartialUpdate**
> Product productsPartialUpdate()


### Example

```typescript
import {
    ProductsApi,
    Configuration,
    PatchedProduct
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: number; //A unique integer value identifying this product. (default to undefined)
let patchedProduct: PatchedProduct; // (optional)

const { status, data } = await apiInstance.productsPartialUpdate(
    id,
    patchedProduct
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedProduct** | **PatchedProduct**|  | |
| **id** | [**number**] | A unique integer value identifying this product. | defaults to undefined|


### Return type

**Product**

### Authorization

[basicAuth](../README.md#basicAuth), [cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **productsRetrieve**
> Product productsRetrieve()


### Example

```typescript
import {
    ProductsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: number; //A unique integer value identifying this product. (default to undefined)

const { status, data } = await apiInstance.productsRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this product. | defaults to undefined|


### Return type

**Product**

### Authorization

[basicAuth](../README.md#basicAuth), [cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **productsUpdate**
> Product productsUpdate(product)


### Example

```typescript
import {
    ProductsApi,
    Configuration,
    Product
} from './api';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: number; //A unique integer value identifying this product. (default to undefined)
let product: Product; //

const { status, data } = await apiInstance.productsUpdate(
    id,
    product
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **product** | **Product**|  | |
| **id** | [**number**] | A unique integer value identifying this product. | defaults to undefined|


### Return type

**Product**

### Authorization

[basicAuth](../README.md#basicAuth), [cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

