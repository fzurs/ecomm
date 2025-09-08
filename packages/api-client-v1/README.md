## @workspace/api-client-v1@0.0.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install @workspace/api-client-v1@0.0.0 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *http://localhost*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*AuthApi* | [**authLoginCreate**](docs/AuthApi.md#authlogincreate) | **POST** /auth/login/ | 
*AuthApi* | [**authLogoutCreate**](docs/AuthApi.md#authlogoutcreate) | **POST** /auth/logout/ | 
*AuthApi* | [**authPasswordChangeCreate**](docs/AuthApi.md#authpasswordchangecreate) | **POST** /auth/password/change/ | 
*AuthApi* | [**authPasswordResetConfirmCreate**](docs/AuthApi.md#authpasswordresetconfirmcreate) | **POST** /auth/password/reset/confirm/ | 
*AuthApi* | [**authPasswordResetCreate**](docs/AuthApi.md#authpasswordresetcreate) | **POST** /auth/password/reset/ | 
*AuthApi* | [**authUserPartialUpdate**](docs/AuthApi.md#authuserpartialupdate) | **PATCH** /auth/user/ | 
*AuthApi* | [**authUserRetrieve**](docs/AuthApi.md#authuserretrieve) | **GET** /auth/user/ | 
*AuthApi* | [**authUserUpdate**](docs/AuthApi.md#authuserupdate) | **PUT** /auth/user/ | 
*BrandsApi* | [**brandsCreate**](docs/BrandsApi.md#brandscreate) | **POST** /brands/ | 
*BrandsApi* | [**brandsDestroy**](docs/BrandsApi.md#brandsdestroy) | **DELETE** /brands/{id}/ | 
*BrandsApi* | [**brandsList**](docs/BrandsApi.md#brandslist) | **GET** /brands/ | 
*BrandsApi* | [**brandsPartialUpdate**](docs/BrandsApi.md#brandspartialupdate) | **PATCH** /brands/{id}/ | 
*BrandsApi* | [**brandsRetrieve**](docs/BrandsApi.md#brandsretrieve) | **GET** /brands/{id}/ | 
*BrandsApi* | [**brandsUpdate**](docs/BrandsApi.md#brandsupdate) | **PUT** /brands/{id}/ | 
*CategoriesApi* | [**categoriesCreate**](docs/CategoriesApi.md#categoriescreate) | **POST** /categories/ | 
*CategoriesApi* | [**categoriesDestroy**](docs/CategoriesApi.md#categoriesdestroy) | **DELETE** /categories/{id}/ | 
*CategoriesApi* | [**categoriesList**](docs/CategoriesApi.md#categorieslist) | **GET** /categories/ | 
*CategoriesApi* | [**categoriesPartialUpdate**](docs/CategoriesApi.md#categoriespartialupdate) | **PATCH** /categories/{id}/ | 
*CategoriesApi* | [**categoriesRetrieve**](docs/CategoriesApi.md#categoriesretrieve) | **GET** /categories/{id}/ | 
*CategoriesApi* | [**categoriesUpdate**](docs/CategoriesApi.md#categoriesupdate) | **PUT** /categories/{id}/ | 
*CustomersApi* | [**customersCreate**](docs/CustomersApi.md#customerscreate) | **POST** /customers/ | 
*CustomersApi* | [**customersDestroy**](docs/CustomersApi.md#customersdestroy) | **DELETE** /customers/{id}/ | 
*CustomersApi* | [**customersList**](docs/CustomersApi.md#customerslist) | **GET** /customers/ | 
*CustomersApi* | [**customersPartialUpdate**](docs/CustomersApi.md#customerspartialupdate) | **PATCH** /customers/{id}/ | 
*CustomersApi* | [**customersRetrieve**](docs/CustomersApi.md#customersretrieve) | **GET** /customers/{id}/ | 
*CustomersApi* | [**customersUpdate**](docs/CustomersApi.md#customersupdate) | **PUT** /customers/{id}/ | 
*OrdersApi* | [**ordersCreate**](docs/OrdersApi.md#orderscreate) | **POST** /orders/ | 
*OrdersApi* | [**ordersDestroy**](docs/OrdersApi.md#ordersdestroy) | **DELETE** /orders/{id}/ | 
*OrdersApi* | [**ordersList**](docs/OrdersApi.md#orderslist) | **GET** /orders/ | 
*OrdersApi* | [**ordersPartialUpdate**](docs/OrdersApi.md#orderspartialupdate) | **PATCH** /orders/{id}/ | 
*OrdersApi* | [**ordersRetrieve**](docs/OrdersApi.md#ordersretrieve) | **GET** /orders/{id}/ | 
*OrdersApi* | [**ordersUpdate**](docs/OrdersApi.md#ordersupdate) | **PUT** /orders/{id}/ | 
*ProductsApi* | [**productsCreate**](docs/ProductsApi.md#productscreate) | **POST** /products/ | 
*ProductsApi* | [**productsDestroy**](docs/ProductsApi.md#productsdestroy) | **DELETE** /products/{id}/ | 
*ProductsApi* | [**productsList**](docs/ProductsApi.md#productslist) | **GET** /products/ | 
*ProductsApi* | [**productsPartialUpdate**](docs/ProductsApi.md#productspartialupdate) | **PATCH** /products/{id}/ | 
*ProductsApi* | [**productsRetrieve**](docs/ProductsApi.md#productsretrieve) | **GET** /products/{id}/ | 
*ProductsApi* | [**productsUpdate**](docs/ProductsApi.md#productsupdate) | **PUT** /products/{id}/ | 


### Documentation For Models

 - [Brand](docs/Brand.md)
 - [Category](docs/Category.md)
 - [Customer](docs/Customer.md)
 - [Login](docs/Login.md)
 - [Order](docs/Order.md)
 - [OrderStatusEnum](docs/OrderStatusEnum.md)
 - [PaginatedBrandList](docs/PaginatedBrandList.md)
 - [PaginatedCategoryList](docs/PaginatedCategoryList.md)
 - [PaginatedCustomerList](docs/PaginatedCustomerList.md)
 - [PaginatedOrderList](docs/PaginatedOrderList.md)
 - [PaginatedProductList](docs/PaginatedProductList.md)
 - [PasswordChange](docs/PasswordChange.md)
 - [PasswordReset](docs/PasswordReset.md)
 - [PasswordResetConfirm](docs/PasswordResetConfirm.md)
 - [PatchedBrand](docs/PatchedBrand.md)
 - [PatchedCategory](docs/PatchedCategory.md)
 - [PatchedCustomer](docs/PatchedCustomer.md)
 - [PatchedOrder](docs/PatchedOrder.md)
 - [PatchedProduct](docs/PatchedProduct.md)
 - [PatchedUserDetails](docs/PatchedUserDetails.md)
 - [Product](docs/Product.md)
 - [ProductStatusEnum](docs/ProductStatusEnum.md)
 - [RestAuthDetail](docs/RestAuthDetail.md)
 - [Token](docs/Token.md)
 - [UserDetails](docs/UserDetails.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="cookieAuth"></a>
### cookieAuth

- **Type**: API key
- **API key parameter name**: sessionid
- **Location**: 

