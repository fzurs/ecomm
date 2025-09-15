# ProductsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**productsCreate**](#productscreate) | **POST** /products/ | |
|[**productsDestroy**](#productsdestroy) | **DELETE** /products/{id}/ | |
|[**productsDuplicateCreate**](#productsduplicatecreate) | **POST** /products/{id}/duplicate/ | |
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
} from '@workspace/api-client-v1--skip-validate-spec';

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

[cookieAuth](../README.md#cookieAuth)

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
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: string; //A UUID string identifying this product. (default to undefined)

const { status, data } = await apiInstance.productsDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | A UUID string identifying this product. | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No response body |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **productsDuplicateCreate**
> Product productsDuplicateCreate(product)


### Example

```typescript
import {
    ProductsApi,
    Configuration,
    Product
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: string; //A UUID string identifying this product. (default to undefined)
let product: Product; //

const { status, data } = await apiInstance.productsDuplicateCreate(
    id,
    product
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **product** | **Product**|  | |
| **id** | [**string**] | A UUID string identifying this product. | defaults to undefined|


### Return type

**Product**

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **productsList**
> PaginatedProductList productsList()


### Example

```typescript
import {
    ProductsApi,
    Configuration
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let brand: number; // (optional) (default to undefined)
let category: number; // (optional) (default to undefined)
let limit: number; //Number of results to return per page. (optional) (default to undefined)
let offset: number; //The initial index from which to return the results. (optional) (default to undefined)
let ordering: string; //Which field to use when ordering the results. (optional) (default to undefined)
let search: string; //A search term. (optional) (default to undefined)
let status: 'active' | 'discontinued' | 'draft' | 'inactive' | 'out_of_stock'; //* `draft` - Draft * `active` - Active * `inactive` - Inactive * `out_of_stock` - Out of stock * `discontinued` - Discontinued (optional) (default to undefined)

const { status, data } = await apiInstance.productsList(
    brand,
    category,
    limit,
    offset,
    ordering,
    search,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **brand** | [**number**] |  | (optional) defaults to undefined|
| **category** | [**number**] |  | (optional) defaults to undefined|
| **limit** | [**number**] | Number of results to return per page. | (optional) defaults to undefined|
| **offset** | [**number**] | The initial index from which to return the results. | (optional) defaults to undefined|
| **ordering** | [**string**] | Which field to use when ordering the results. | (optional) defaults to undefined|
| **search** | [**string**] | A search term. | (optional) defaults to undefined|
| **status** | [**&#39;active&#39; | &#39;discontinued&#39; | &#39;draft&#39; | &#39;inactive&#39; | &#39;out_of_stock&#39;**]**Array<&#39;active&#39; &#124; &#39;discontinued&#39; &#124; &#39;draft&#39; &#124; &#39;inactive&#39; &#124; &#39;out_of_stock&#39;>** | * &#x60;draft&#x60; - Draft * &#x60;active&#x60; - Active * &#x60;inactive&#x60; - Inactive * &#x60;out_of_stock&#x60; - Out of stock * &#x60;discontinued&#x60; - Discontinued | (optional) defaults to undefined|


### Return type

**PaginatedProductList**

### Authorization

[cookieAuth](../README.md#cookieAuth)

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
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: string; //A UUID string identifying this product. (default to undefined)
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
| **id** | [**string**] | A UUID string identifying this product. | defaults to undefined|


### Return type

**Product**

### Authorization

[cookieAuth](../README.md#cookieAuth)

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
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: string; //A UUID string identifying this product. (default to undefined)

const { status, data } = await apiInstance.productsRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | A UUID string identifying this product. | defaults to undefined|


### Return type

**Product**

### Authorization

[cookieAuth](../README.md#cookieAuth)

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
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new ProductsApi(configuration);

let id: string; //A UUID string identifying this product. (default to undefined)
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
| **id** | [**string**] | A UUID string identifying this product. | defaults to undefined|


### Return type

**Product**

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

