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
} from '@workspace/api-client-v1--skip-validate-spec';

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

[cookieAuth](../README.md#cookieAuth)

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
} from '@workspace/api-client-v1--skip-validate-spec';

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

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No response body |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **categoriesList**
> PaginatedCategoryList categoriesList()


### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let limit: number; //Number of results to return per page. (optional) (default to undefined)
let offset: number; //The initial index from which to return the results. (optional) (default to undefined)
let search: string; //A search term. (optional) (default to undefined)

const { status, data } = await apiInstance.categoriesList(
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

**PaginatedCategoryList**

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

# **categoriesPartialUpdate**
> Category categoriesPartialUpdate()


### Example

```typescript
import {
    CategoriesApi,
    Configuration,
    PatchedCategory
} from '@workspace/api-client-v1--skip-validate-spec';

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

[cookieAuth](../README.md#cookieAuth)

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
} from '@workspace/api-client-v1--skip-validate-spec';

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

[cookieAuth](../README.md#cookieAuth)

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
} from '@workspace/api-client-v1--skip-validate-spec';

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

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

