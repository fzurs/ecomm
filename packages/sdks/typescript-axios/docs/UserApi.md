# UserApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userPartialUpdate**](#userpartialupdate) | **PATCH** /user/ | |
|[**userRetrieve**](#userretrieve) | **GET** /user/ | |
|[**userUpdate**](#userupdate) | **PUT** /user/ | |

# **userPartialUpdate**
> UserDetails userPartialUpdate()

Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.

### Example

```typescript
import {
    UserApi,
    Configuration,
    PatchedUserDetails
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let patchedUserDetails: PatchedUserDetails; // (optional)

const { status, data } = await apiInstance.userPartialUpdate(
    patchedUserDetails
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedUserDetails** | **PatchedUserDetails**|  | |


### Return type

**UserDetails**

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

# **userRetrieve**
> UserDetails userRetrieve()

Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userRetrieve();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserDetails**

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

# **userUpdate**
> UserDetails userUpdate(userDetails)

Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.

### Example

```typescript
import {
    UserApi,
    Configuration,
    UserDetails
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userDetails: UserDetails; //

const { status, data } = await apiInstance.userUpdate(
    userDetails
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userDetails** | **UserDetails**|  | |


### Return type

**UserDetails**

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

