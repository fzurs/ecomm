# LogoutApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**logoutCreate**](#logoutcreate) | **POST** /logout/ | |

# **logoutCreate**
> RestAuthDetail logoutCreate()

Calls Django logout method and delete the Token object assigned to the current User object.  Accepts/Returns nothing.

### Example

```typescript
import {
    LogoutApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LogoutApi(configuration);

const { status, data } = await apiInstance.logoutCreate();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**RestAuthDetail**

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

