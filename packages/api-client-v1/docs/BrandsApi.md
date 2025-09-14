# BrandsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**brandsCreate**](#brandscreate) | **POST** /brands/ | |
|[**brandsDestroy**](#brandsdestroy) | **DELETE** /brands/{id}/ | |
|[**brandsList**](#brandslist) | **GET** /brands/ | |
|[**brandsPartialUpdate**](#brandspartialupdate) | **PATCH** /brands/{id}/ | |
|[**brandsRetrieve**](#brandsretrieve) | **GET** /brands/{id}/ | |
|[**brandsUpdate**](#brandsupdate) | **PUT** /brands/{id}/ | |

# **brandsCreate**
> Brand brandsCreate(brand)


### Example

```typescript
import {
    BrandsApi,
    Configuration,
    Brand
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new BrandsApi(configuration);

let brand: Brand; //

const { status, data } = await apiInstance.brandsCreate(
    brand
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **brand** | **Brand**|  | |


### Return type

**Brand**

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

# **brandsDestroy**
> brandsDestroy()


### Example

```typescript
import {
    BrandsApi,
    Configuration
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new BrandsApi(configuration);

let id: number; //A unique integer value identifying this brand. (default to undefined)

const { status, data } = await apiInstance.brandsDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this brand. | defaults to undefined|


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

# **brandsList**
> PaginatedBrandList brandsList()


### Example

```typescript
import {
    BrandsApi,
    Configuration
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new BrandsApi(configuration);

let limit: number; //Number of results to return per page. (optional) (default to undefined)
let offset: number; //The initial index from which to return the results. (optional) (default to undefined)
let search: string; //A search term. (optional) (default to undefined)

const { status, data } = await apiInstance.brandsList(
    limit,
    offset,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] | Number of results to return per page. | (optional) defaults to undefined|
| **offset** | [**number**] | The initial index from which to return the results. | (optional) defaults to undefined|
| **search** | [**string**] | A search term. | (optional) defaults to undefined|


### Return type

**PaginatedBrandList**

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

# **brandsPartialUpdate**
> Brand brandsPartialUpdate()


### Example

```typescript
import {
    BrandsApi,
    Configuration,
    PatchedBrand
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new BrandsApi(configuration);

let id: number; //A unique integer value identifying this brand. (default to undefined)
let patchedBrand: PatchedBrand; // (optional)

const { status, data } = await apiInstance.brandsPartialUpdate(
    id,
    patchedBrand
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedBrand** | **PatchedBrand**|  | |
| **id** | [**number**] | A unique integer value identifying this brand. | defaults to undefined|


### Return type

**Brand**

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

# **brandsRetrieve**
> Brand brandsRetrieve()


### Example

```typescript
import {
    BrandsApi,
    Configuration
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new BrandsApi(configuration);

let id: number; //A unique integer value identifying this brand. (default to undefined)

const { status, data } = await apiInstance.brandsRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this brand. | defaults to undefined|


### Return type

**Brand**

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

# **brandsUpdate**
> Brand brandsUpdate(brand)


### Example

```typescript
import {
    BrandsApi,
    Configuration,
    Brand
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new BrandsApi(configuration);

let id: number; //A unique integer value identifying this brand. (default to undefined)
let brand: Brand; //

const { status, data } = await apiInstance.brandsUpdate(
    id,
    brand
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **brand** | **Brand**|  | |
| **id** | [**number**] | A unique integer value identifying this brand. | defaults to undefined|


### Return type

**Brand**

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

