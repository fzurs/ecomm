# InventoryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**inventoryCreate**](#inventorycreate) | **POST** /inventory/ | |
|[**inventoryDestroy**](#inventorydestroy) | **DELETE** /inventory/{id}/ | |
|[**inventoryList**](#inventorylist) | **GET** /inventory/ | |
|[**inventoryPartialUpdate**](#inventorypartialupdate) | **PATCH** /inventory/{id}/ | |
|[**inventoryRetrieve**](#inventoryretrieve) | **GET** /inventory/{id}/ | |
|[**inventoryUpdate**](#inventoryupdate) | **PUT** /inventory/{id}/ | |

# **inventoryCreate**
> Inventory inventoryCreate(inventory)


### Example

```typescript
import {
    InventoryApi,
    Configuration,
    Inventory
} from './api';

const configuration = new Configuration();
const apiInstance = new InventoryApi(configuration);

let inventory: Inventory; //

const { status, data } = await apiInstance.inventoryCreate(
    inventory
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **inventory** | **Inventory**|  | |


### Return type

**Inventory**

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

# **inventoryDestroy**
> inventoryDestroy()


### Example

```typescript
import {
    InventoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InventoryApi(configuration);

let id: number; //A unique integer value identifying this inventory. (default to undefined)

const { status, data } = await apiInstance.inventoryDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this inventory. | defaults to undefined|


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

# **inventoryList**
> Array<Inventory> inventoryList()


### Example

```typescript
import {
    InventoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InventoryApi(configuration);

const { status, data } = await apiInstance.inventoryList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Inventory>**

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

# **inventoryPartialUpdate**
> Inventory inventoryPartialUpdate()


### Example

```typescript
import {
    InventoryApi,
    Configuration,
    PatchedInventory
} from './api';

const configuration = new Configuration();
const apiInstance = new InventoryApi(configuration);

let id: number; //A unique integer value identifying this inventory. (default to undefined)
let patchedInventory: PatchedInventory; // (optional)

const { status, data } = await apiInstance.inventoryPartialUpdate(
    id,
    patchedInventory
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedInventory** | **PatchedInventory**|  | |
| **id** | [**number**] | A unique integer value identifying this inventory. | defaults to undefined|


### Return type

**Inventory**

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

# **inventoryRetrieve**
> Inventory inventoryRetrieve()


### Example

```typescript
import {
    InventoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InventoryApi(configuration);

let id: number; //A unique integer value identifying this inventory. (default to undefined)

const { status, data } = await apiInstance.inventoryRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this inventory. | defaults to undefined|


### Return type

**Inventory**

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

# **inventoryUpdate**
> Inventory inventoryUpdate(inventory)


### Example

```typescript
import {
    InventoryApi,
    Configuration,
    Inventory
} from './api';

const configuration = new Configuration();
const apiInstance = new InventoryApi(configuration);

let id: number; //A unique integer value identifying this inventory. (default to undefined)
let inventory: Inventory; //

const { status, data } = await apiInstance.inventoryUpdate(
    id,
    inventory
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **inventory** | **Inventory**|  | |
| **id** | [**number**] | A unique integer value identifying this inventory. | defaults to undefined|


### Return type

**Inventory**

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

