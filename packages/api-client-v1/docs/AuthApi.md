# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authLoginCreate**](#authlogincreate) | **POST** /auth/login/ | |
|[**authLogoutCreate**](#authlogoutcreate) | **POST** /auth/logout/ | |
|[**authPasswordChangeCreate**](#authpasswordchangecreate) | **POST** /auth/password/change/ | |
|[**authPasswordResetConfirmCreate**](#authpasswordresetconfirmcreate) | **POST** /auth/password/reset/confirm/ | |
|[**authPasswordResetCreate**](#authpasswordresetcreate) | **POST** /auth/password/reset/ | |
|[**authUserPartialUpdate**](#authuserpartialupdate) | **PATCH** /auth/user/ | |
|[**authUserRetrieve**](#authuserretrieve) | **GET** /auth/user/ | |
|[**authUserUpdate**](#authuserupdate) | **PUT** /auth/user/ | |

# **authLoginCreate**
> Token authLoginCreate(login)

Check the credentials and return the REST Token if the credentials are valid and authenticated. Calls Django Auth login method to register User ID in Django session framework  Accept the following POST parameters: username, password Return the REST Framework Token Object\'s key.

### Example

```typescript
import {
    AuthApi,
    Configuration,
    Login
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let login: Login; //

const { status, data } = await apiInstance.authLoginCreate(
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

# **authLogoutCreate**
> RestAuthDetail authLogoutCreate()

Calls Django logout method and delete the Token object assigned to the current User object.  Accepts/Returns nothing.

### Example

```typescript
import {
    AuthApi,
    Configuration
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authLogoutCreate();
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

# **authPasswordChangeCreate**
> RestAuthDetail authPasswordChangeCreate(passwordChange)

Calls Django Auth SetPasswordForm save method.  Accepts the following POST parameters: new_password1, new_password2 Returns the success/fail message.

### Example

```typescript
import {
    AuthApi,
    Configuration,
    PasswordChange
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let passwordChange: PasswordChange; //

const { status, data } = await apiInstance.authPasswordChangeCreate(
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

# **authPasswordResetConfirmCreate**
> RestAuthDetail authPasswordResetConfirmCreate(passwordResetConfirm)

Password reset e-mail link is confirmed, therefore this resets the user\'s password.  Accepts the following POST parameters: token, uid,     new_password1, new_password2 Returns the success/fail message.

### Example

```typescript
import {
    AuthApi,
    Configuration,
    PasswordResetConfirm
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let passwordResetConfirm: PasswordResetConfirm; //

const { status, data } = await apiInstance.authPasswordResetConfirmCreate(
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

# **authPasswordResetCreate**
> RestAuthDetail authPasswordResetCreate(passwordReset)

Calls Django Auth PasswordResetForm save method.  Accepts the following POST parameters: email Returns the success/fail message.

### Example

```typescript
import {
    AuthApi,
    Configuration,
    PasswordReset
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let passwordReset: PasswordReset; //

const { status, data } = await apiInstance.authPasswordResetCreate(
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

# **authUserPartialUpdate**
> UserDetails authUserPartialUpdate()

Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.

### Example

```typescript
import {
    AuthApi,
    Configuration,
    PatchedUserDetails
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let patchedUserDetails: PatchedUserDetails; // (optional)

const { status, data } = await apiInstance.authUserPartialUpdate(
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

# **authUserRetrieve**
> UserDetails authUserRetrieve()

Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.

### Example

```typescript
import {
    AuthApi,
    Configuration
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authUserRetrieve();
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

# **authUserUpdate**
> UserDetails authUserUpdate(userDetails)

Reads and updates UserModel fields Accepts GET, PUT, PATCH methods.  Default accepted fields: username, first_name, last_name Default display fields: pk, username, email, first_name, last_name Read-only fields: pk, email  Returns UserModel fields.

### Example

```typescript
import {
    AuthApi,
    Configuration,
    UserDetails
} from '@workspace/api-client-v1--skip-validate-spec';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let userDetails: UserDetails; //

const { status, data } = await apiInstance.authUserUpdate(
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

