# PasswordApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**passwordChangeCreate**](#passwordchangecreate) | **POST** /password/change/ | |
|[**passwordResetConfirmCreate**](#passwordresetconfirmcreate) | **POST** /password/reset/confirm/ | |
|[**passwordResetCreate**](#passwordresetcreate) | **POST** /password/reset/ | |

# **passwordChangeCreate**
> RestAuthDetail passwordChangeCreate(passwordChange)

Calls Django Auth SetPasswordForm save method.  Accepts the following POST parameters: new_password1, new_password2 Returns the success/fail message.

### Example

```typescript
import {
    PasswordApi,
    Configuration,
    PasswordChange
} from './api';

const configuration = new Configuration();
const apiInstance = new PasswordApi(configuration);

let passwordChange: PasswordChange; //

const { status, data } = await apiInstance.passwordChangeCreate(
    passwordChange
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **passwordChange** | **PasswordChange**|  | |


### Return type

**RestAuthDetail**

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

# **passwordResetConfirmCreate**
> RestAuthDetail passwordResetConfirmCreate(passwordResetConfirm)

Password reset e-mail link is confirmed, therefore this resets the user\'s password.  Accepts the following POST parameters: token, uid,     new_password1, new_password2 Returns the success/fail message.

### Example

```typescript
import {
    PasswordApi,
    Configuration,
    PasswordResetConfirm
} from './api';

const configuration = new Configuration();
const apiInstance = new PasswordApi(configuration);

let passwordResetConfirm: PasswordResetConfirm; //

const { status, data } = await apiInstance.passwordResetConfirmCreate(
    passwordResetConfirm
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **passwordResetConfirm** | **PasswordResetConfirm**|  | |


### Return type

**RestAuthDetail**

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

# **passwordResetCreate**
> RestAuthDetail passwordResetCreate(passwordReset)

Calls Django Auth PasswordResetForm save method.  Accepts the following POST parameters: email Returns the success/fail message.

### Example

```typescript
import {
    PasswordApi,
    Configuration,
    PasswordReset
} from './api';

const configuration = new Configuration();
const apiInstance = new PasswordApi(configuration);

let passwordReset: PasswordReset; //

const { status, data } = await apiInstance.passwordResetCreate(
    passwordReset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **passwordReset** | **PasswordReset**|  | |


### Return type

**RestAuthDetail**

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

