# CustomersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**customersCreate**](#customerscreate) | **POST** /customers/ | |
|[**customersDestroy**](#customersdestroy) | **DELETE** /customers/{id}/ | |
|[**customersList**](#customerslist) | **GET** /customers/ | |
|[**customersPartialUpdate**](#customerspartialupdate) | **PATCH** /customers/{id}/ | |
|[**customersRetrieve**](#customersretrieve) | **GET** /customers/{id}/ | |
|[**customersUpdate**](#customersupdate) | **PUT** /customers/{id}/ | |

# **customersCreate**
> Customer customersCreate(customer)


### Example

```typescript
import {
    CustomersApi,
    Configuration,
    Customer
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomersApi(configuration);

let customer: Customer; //

const { status, data } = await apiInstance.customersCreate(
    customer
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customer** | **Customer**|  | |


### Return type

**Customer**

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

# **customersDestroy**
> customersDestroy()


### Example

```typescript
import {
    CustomersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomersApi(configuration);

let id: number; //A unique integer value identifying this customer. (default to undefined)

const { status, data } = await apiInstance.customersDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this customer. | defaults to undefined|


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

# **customersList**
> PaginatedCustomerList customersList()


### Example

```typescript
import {
    CustomersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomersApi(configuration);

let limit: number; //Number of results to return per page. (optional) (default to undefined)
let offset: number; //The initial index from which to return the results. (optional) (default to undefined)
let search: string; //A search term. (optional) (default to undefined)

const { status, data } = await apiInstance.customersList(
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

**PaginatedCustomerList**

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

# **customersPartialUpdate**
> Customer customersPartialUpdate()


### Example

```typescript
import {
    CustomersApi,
    Configuration,
    PatchedCustomer
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomersApi(configuration);

let id: number; //A unique integer value identifying this customer. (default to undefined)
let patchedCustomer: PatchedCustomer; // (optional)

const { status, data } = await apiInstance.customersPartialUpdate(
    id,
    patchedCustomer
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedCustomer** | **PatchedCustomer**|  | |
| **id** | [**number**] | A unique integer value identifying this customer. | defaults to undefined|


### Return type

**Customer**

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

# **customersRetrieve**
> Customer customersRetrieve()


### Example

```typescript
import {
    CustomersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomersApi(configuration);

let id: number; //A unique integer value identifying this customer. (default to undefined)

const { status, data } = await apiInstance.customersRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this customer. | defaults to undefined|


### Return type

**Customer**

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

# **customersUpdate**
> Customer customersUpdate(customer)


### Example

```typescript
import {
    CustomersApi,
    Configuration,
    Customer
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomersApi(configuration);

let id: number; //A unique integer value identifying this customer. (default to undefined)
let customer: Customer; //

const { status, data } = await apiInstance.customersUpdate(
    id,
    customer
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customer** | **Customer**|  | |
| **id** | [**number**] | A unique integer value identifying this customer. | defaults to undefined|


### Return type

**Customer**

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

