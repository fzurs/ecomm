# CategoriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**categoriesCreate**](#categoriescreate) | **POST** /categories/ | |
|[**categoriesDestroy**](#categoriesdestroy) | **DELETE** /categories/{id}/ | |
|[**categoriesList**](#categorieslist) | **GET** /categories/ | |
|[**categoriesPartialUpdate**](#categoriespartialupdate) | **PATCH** /categories/{id}/ | |
|[**categoriesRetrieve**](#categoriesretrieve) | **GET** /categories/{id}/ | |
|[**categoriesUpdate**](#categoriesupdate) | **PUT** /categories/{id}/ | |

# **categoriesCreate**
> Category categoriesCreate(category)


### Example

```typescript
import {
    CategoriesApi,
    Configuration,
    Category
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let category: Category; //

const { status, data } = await apiInstance.categoriesCreate(
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | **Category**|  | |


### Return type

**Category**

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

# **categoriesDestroy**
> categoriesDestroy()


### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let id: number; //A unique integer value identifying this category. (default to undefined)

const { status, data } = await apiInstance.categoriesDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this category. | defaults to undefined|


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

# **categoriesList**
> Array<Category> categoriesList()


### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

const { status, data } = await apiInstance.categoriesList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Category>**

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

# **categoriesPartialUpdate**
> Category categoriesPartialUpdate()


### Example

```typescript
import {
    CategoriesApi,
    Configuration,
    PatchedCategory
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let id: number; //A unique integer value identifying this category. (default to undefined)
let patchedCategory: PatchedCategory; // (optional)

const { status, data } = await apiInstance.categoriesPartialUpdate(
    id,
    patchedCategory
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedCategory** | **PatchedCategory**|  | |
| **id** | [**number**] | A unique integer value identifying this category. | defaults to undefined|


### Return type

**Category**

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

# **categoriesRetrieve**
> Category categoriesRetrieve()


### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let id: number; //A unique integer value identifying this category. (default to undefined)

const { status, data } = await apiInstance.categoriesRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this category. | defaults to undefined|


### Return type

**Category**

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

# **categoriesUpdate**
> Category categoriesUpdate(category)


### Example

```typescript
import {
    CategoriesApi,
    Configuration,
    Category
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let id: number; //A unique integer value identifying this category. (default to undefined)
let category: Category; //

const { status, data } = await apiInstance.categoriesUpdate(
    id,
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | **Category**|  | |
| **id** | [**number**] | A unique integer value identifying this category. | defaults to undefined|


### Return type

**Category**

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

