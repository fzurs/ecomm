# OrdersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**ordersCreate**](#orderscreate) | **POST** /orders/ | |
|[**ordersDestroy**](#ordersdestroy) | **DELETE** /orders/{id}/ | |
|[**ordersList**](#orderslist) | **GET** /orders/ | |
|[**ordersPartialUpdate**](#orderspartialupdate) | **PATCH** /orders/{id}/ | |
|[**ordersRetrieve**](#ordersretrieve) | **GET** /orders/{id}/ | |
|[**ordersUpdate**](#ordersupdate) | **PUT** /orders/{id}/ | |

# **ordersCreate**
> Order ordersCreate()


### Example

```typescript
import {
    OrdersApi,
    Configuration,
    Order
} from '@workspace/api-client-v1';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let order: Order; // (optional)

const { status, data } = await apiInstance.ordersCreate(
    order
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **order** | **Order**|  | |


### Return type

**Order**

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

# **ordersDestroy**
> ordersDestroy()


### Example

```typescript
import {
    OrdersApi,
    Configuration
} from '@workspace/api-client-v1';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //A unique integer value identifying this order. (default to undefined)

const { status, data } = await apiInstance.ordersDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this order. | defaults to undefined|


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

# **ordersList**
> PaginatedOrderList ordersList()


### Example

```typescript
import {
    OrdersApi,
    Configuration
} from '@workspace/api-client-v1';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let limit: number; //Number of results to return per page. (optional) (default to undefined)
let offset: number; //The initial index from which to return the results. (optional) (default to undefined)

const { status, data } = await apiInstance.ordersList(
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] | Number of results to return per page. | (optional) defaults to undefined|
| **offset** | [**number**] | The initial index from which to return the results. | (optional) defaults to undefined|


### Return type

**PaginatedOrderList**

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

# **ordersPartialUpdate**
> Order ordersPartialUpdate()


### Example

```typescript
import {
    OrdersApi,
    Configuration,
    PatchedOrder
} from '@workspace/api-client-v1';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //A unique integer value identifying this order. (default to undefined)
let patchedOrder: PatchedOrder; // (optional)

const { status, data } = await apiInstance.ordersPartialUpdate(
    id,
    patchedOrder
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedOrder** | **PatchedOrder**|  | |
| **id** | [**number**] | A unique integer value identifying this order. | defaults to undefined|


### Return type

**Order**

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

# **ordersRetrieve**
> Order ordersRetrieve()


### Example

```typescript
import {
    OrdersApi,
    Configuration
} from '@workspace/api-client-v1';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //A unique integer value identifying this order. (default to undefined)

const { status, data } = await apiInstance.ordersRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this order. | defaults to undefined|


### Return type

**Order**

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

# **ordersUpdate**
> Order ordersUpdate()


### Example

```typescript
import {
    OrdersApi,
    Configuration,
    Order
} from '@workspace/api-client-v1';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //A unique integer value identifying this order. (default to undefined)
let order: Order; // (optional)

const { status, data } = await apiInstance.ordersUpdate(
    id,
    order
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **order** | **Order**|  | |
| **id** | [**number**] | A unique integer value identifying this order. | defaults to undefined|


### Return type

**Order**

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

