# LoginApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**loginCreate**](#logincreate) | **POST** /login/ | |

# **loginCreate**
> Token loginCreate(login)

Check the credentials and return the REST Token if the credentials are valid and authenticated. Calls Django Auth login method to register User ID in Django session framework  Accept the following POST parameters: username, password Return the REST Framework Token Object\'s key.

### Example

```typescript
import {
    LoginApi,
    Configuration,
    Login
} from './api';

const configuration = new Configuration();
const apiInstance = new LoginApi(configuration);

let login: Login; //

const { status, data } = await apiInstance.loginCreate(
    login
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **login** | **Login**|  | |


### Return type

**Token**

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

