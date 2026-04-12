# E-commerce API — Request & Response Reference

This document consolidates all HTTP endpoints described by the project’s Swagger decorators (`src/modules/**/swagger/*.swagger.ts`), aligned with controllers and DTOs. Interactive docs: **`GET /api/docs`** (Swagger UI).

**Base URL:** `http://localhost:<PORT>` (default port `3000` from `.env`).

---

## Authentication

- **Bearer JWT:** `Authorization: Bearer <accessToken>`  
  Required for routes marked **Auth** below (same as `@ApiBearerAuth()` / `JwtAuthGuard` / `RolesGuard` in code).

- **Obtain tokens:** `POST /auth/login` → response `data` includes `accessToken` and `refreshToken`.

---

## Global success response shape

All successful responses are wrapped by `ResponseInterceptor`:

```json
{
  "success": true,
  "data": { },
  "message": "OK",
  "timestamp": "2026-04-12T12:00:00.000Z",
  "path": "/the-request-path"
}
```

The **`data`** field holds the payload described in each section (DTOs below). For empty deletes, `data` may be `null`.

---

## Global error response shape

`HttpExceptionFilter` returns:

```json
{
  "success": false,
  "data": null,
  "message": "Human-readable message",
  "errorCode": "SOME_CODE",
  "errors": ["optional", "validation", "messages"],
  "timestamp": "2026-04-12T12:00:00.000Z",
  "path": "/the-request-path"
}
```

- Validation failures may use `errorCode` for validation and populate **`errors`** as an array.
- Documented examples in Swagger (e.g. `USER_002`, `AUTH_001`, `RBAC_002`) appear inside **`message`** / **`errorCode`** per implementation.

---

## Root

| Method | Path | Auth | Summary |
|--------|------|------|---------|
| `GET` | `/` | No | Health/hello string (`AppController`) |

---

## Auth (`/auth`)

| Method | Path | Auth | Request body | Success `data` (conceptual) | Notes (HTTP / errors) |
|--------|------|------|--------------|-----------------------------|------------------------|
| `POST` | `/auth/register` | No | **JSON** `RegisterDto` | User profile (no password) | **201** Created. **409** email exists (`USER_002`). |
| `POST` | `/auth/login` | No | **JSON** `LoginDto` | `TokenResponseDto` | **200**. **401** invalid credentials (`AUTH_001`). |
| `GET` | `/auth/me` | Bearer | — | User profile | **200**. **401** unauthorized. |

### `RegisterDto` (JSON)

| Field | Type | Rules |
|-------|------|--------|
| `email` | string | email |
| `password` | string | min 6, max 50 |
| `fullName` | string | 1–100 chars |
| `phone` | string | optional, max 20 |
| `address` | string | optional |

### `LoginDto` (JSON)

| Field | Type |
|-------|------|
| `email` | string |
| `password` | string |

### `TokenResponseDto` (`data` for login)

| Field | Type |
|-------|------|
| `accessToken` | string |
| `refreshToken` | string |

### `UserResponseDto` (Swagger type for profile/register-style responses)

| Field | Type |
|-------|------|
| `id` | number |
| `fullName` | string |
| `email` | string \| null |
| `role` | string |
| `isActive` | boolean |

---

## Categories (`/categories`)

| Method | Path | Auth | Request | Success `data` | Errors |
|--------|------|------|---------|------------------|--------|
| `GET` | `/categories` | No | — | `CategoryResponseDto[]` | **200** |
| `GET` | `/categories/:id` | No | — | `CategoryResponseDto` | **200**, **404** |
| `POST` | `/categories` | No | **multipart/form-data** `CreateCategoryFormDto` | `CategoryResponseDto` | **201** |
| `PATCH` | `/categories/:id` | No | **multipart/form-data** `CreateCategoryFormDto` | `CategoryResponseDto` | **200**, **404** |
| `DELETE` | `/categories/:id` | No | — | — (empty / null `data`) | **204**, **404** |

### Form fields (`CreateCategoryFormDto`)

| Field | Type |
|-------|------|
| `name` | string |
| `description` | string (optional) |
| `parentId` | number (optional) |
| `image` | file (optional) |

### `CategoryResponseDto`

| Field | Type |
|-------|------|
| `id`, `name`, `slug` | number / string |
| `description`, `imageUrl`, `parentId` | nullable |
| `parent` | `CategoryResponseDto` \| null |
| `createdAt`, `updatedAt` | date |

---

## Products (`/products`)

| Method | Path | Auth | Request | Success `data` | Errors |
|--------|------|------|---------|------------------|--------|
| `GET` | `/products` | No | Query `QueryProductDto` | `PaginatedProductResponseDto` | **200** |
| `GET` | `/products/slug/:slug` | No | — | `ProductResponseDto` | **200**, **404** |
| `GET` | `/products/:id` | No | — | `ProductResponseDto` | **200**, **404** |
| `POST` | `/products` | No | **multipart/form-data** `CreateProductFormDto` | `ProductResponseDto` | **201** |
| `PATCH` | `/products/:id` | No | **multipart/form-data** `UpdateProductFormDto` | `ProductResponseDto` | **200**, **404** |
| `PATCH` | `/products/:id/status` | No | JSON `{ "status": "active" \| "inactive" \| "out_of_stock" }` | `ProductResponseDto` | **200**, **404** |
| `PATCH` | `/products/:id/stock` | No | JSON `{ "quantity": number }` | `ProductResponseDto` | **200**, **404** |
| `DELETE` | `/products/:id` | No | — | — | **204**, **404** |

### Query `QueryProductDto` (`GET /products`)

| Query | Description |
|-------|-------------|
| `search`, `categoryId`, `status`, `minPrice`, `maxPrice` | filters |
| `page`, `limit` | pagination (defaults page=1, limit=10) |
| `sortBy` | `price` \| `name` \| `createdAt` \| `stockQuantity` (default `createdAt`) |
| `sortOrder` | `ASC` \| `DESC` (default `DESC`) |

### Multipart body (`CreateProductFormDto` / `UpdateProductFormDto`)

Core fields (see `CreateProductDto`; update is partial):

| Field | Type |
|-------|------|
| `categoryId` | number (optional) |
| `name` | string |
| `description` | string (optional) |
| `price` | number |
| `salePrice` | number (optional) |
| `stockQuantity` | integer ≥ 0 |
| `status` | `active` \| `inactive` \| `out_of_stock` (optional) |
| `image` | file (optional) |

### `PaginatedProductResponseDto`

| Field | Type |
|-------|------|
| `data` | `ProductResponseDto[]` |
| `total`, `page`, `limit`, `totalPages` | number |

### `ProductResponseDto`

| Field | Type |
|-------|------|
| `id`, `categoryId`, `name`, `slug`, `description`, `price`, `salePrice`, `stockQuantity`, `imageUrl`, `status` | (see Swagger) |
| `category` | `CategoryResponseDto` \| null |
| `createdAt`, `updatedAt` | date |

---

## Carts (`/carts`)

All routes: **Bearer JWT** (`JwtAuthGuard` on controller).

| Method | Path | Request body | Success `data` | Errors |
|--------|------|--------------|------------------|--------|
| `GET` | `/carts` | — | `CartSummaryResponseDto` | **200** |
| `POST` | `/carts` | `AddToCartDto` | `CartResponseDto` | **201**, **404** product, **400** stock/status |
| `PATCH` | `/carts/:id` | `UpdateCartDto` | `CartResponseDto` | **200**, **404**, **400** insufficient stock |
| `DELETE` | `/carts/:id` | — | — | **204**, **404** |
| `DELETE` | `/carts` | — | — | **204**, **400** cart empty |

### `AddToCartDto`

| Field | Type |
|-------|------|
| `productId` | positive integer |
| `quantity` | integer ≥ 1 |

### `UpdateCartDto`

| Field | Type |
|-------|------|
| `quantity` | integer ≥ 1 |

### `CartSummaryResponseDto`

| Field | Type |
|-------|------|
| `items` | `CartResponseDto[]` |
| `totalItems`, `totalQty`, `totalPrice` | number |

### `CartResponseDto`

| Field | Type |
|-------|------|
| `id`, `userId`, `productId`, `quantity` | number |
| `product` | `ProductResponseDto` |
| `createdAt`, `updatedAt` | date |

---

## Orders — Customer (`/orders`)

All routes: **Bearer JWT**.

| Method | Path | Request | Success `data` | Errors |
|--------|------|---------|------------------|--------|
| `GET` | `/orders/me` | Query `QueryOrderDto` | `PaginatedOrdersResponseDto` | **200** |
| `GET` | `/orders/me/:id` | — | `OrderResponseDto` | **200**, **404** |
| `POST` | `/orders/checkout` | `CheckoutDto` | `OrderResponseDto` | **201**, **400**, **404** |
| `POST` | `/orders` | `CreateOrderDto` | `OrderResponseDto` | **201**, **400**, **404** |
| `DELETE` | `/orders/:id/cancel` | — | `OrderResponseDto` | **200**, **404**, **400** cannot cancel |

### `QueryOrderDto`

| Query | Type |
|-------|------|
| `status` | `pending` \| `confirmed` \| `shipping` \| `completed` \| `cancelled` |
| `paymentStatus` | `unpaid` \| `paid` \| `refunded` |
| `page`, `limit` | pagination |

### `CheckoutDto`

| Field | Type |
|-------|------|
| `shippingAddress` | string |
| `paymentMethod` | string optional, max 50 |
| `note` | string optional |

### `CreateOrderDto`

| Field | Type |
|-------|------|
| `items` | `{ productId, quantity }[]` |
| `shippingAddress` | string |
| `paymentMethod` | optional |
| `note` | optional |

### `OrderResponseDto` / `PaginatedOrdersResponseDto`

- **`OrderResponseDto`:** `id`, `userId`, `totalAmount`, `status`, `shippingAddress`, `paymentMethod`, `paymentStatus`, `note`, `items` (`OrderItemResponseDto[]`), timestamps.  
- **`PaginatedOrdersResponseDto`:** `data`, `total`, `page`, `limit`, `totalPages`.  
- **Order status:** `pending` \| `confirmed` \| `shipping` \| `completed` \| `cancelled`.  
- **Payment status:** `unpaid` \| `paid` \| `refunded`.

---

## Orders — Admin (`/admin/orders`)

**Bearer JWT** + roles **`admin`** or **`staff`** (`RolesGuard`).

| Method | Path | Request | Success `data` | Errors |
|--------|------|---------|------------------|--------|
| `GET` | `/admin/orders` | Query `QueryOrderDto` | `PaginatedOrdersResponseDto` | **200** |
| `GET` | `/admin/orders/:id` | — | `OrderResponseDto` | **200**, **404** |
| `PATCH` | `/admin/orders/:id/status` | `UpdateOrderStatusDto` | `OrderResponseDto` | **200**, **404**, **400** invalid transition |
| `PATCH` | `/admin/orders/:id/payment` | `UpdatePaymentStatusDto` | `OrderResponseDto` | **200**, **404**, **400**, **409** already paid |

### `UpdateOrderStatusDto`

| Field | Type |
|-------|------|
| `status` | order status enum |

### `UpdatePaymentStatusDto`

| Field | Type |
|-------|------|
| `paymentStatus` | `unpaid` \| `paid` \| `refunded` |

---

## Reviews (`/reviews`)

| Method | Path | Auth | Request / Query | Success `data` | Errors |
|--------|------|------|-----------------|----------------|--------|
| `GET` | `/reviews/product/:productId` | No | `QueryReviewDto` | `PaginatedReviewResponseDto` | **200**, **404** product |
| `GET` | `/reviews/me` | Bearer | — | `ReviewResponseDto[]` | **200** |
| `GET` | `/reviews/:id` | No | — | `ReviewResponseDto` | **200**, **404** |
| `POST` | `/reviews` | Bearer | `CreateReviewDto` | `ReviewResponseDto` | **201**, **404**, **403** not purchased, **409** duplicate review |
| `PATCH` | `/reviews/:id` | Bearer | `UpdateReviewDto` | `ReviewResponseDto` | **200**, **404** |
| `DELETE` | `/reviews/:id` | Bearer | — | — | **204**, **404** |
| `DELETE` | `/reviews/:id/admin` | Bearer **+ role `admin`** | — | — | **204**, **404** |

### `QueryReviewDto`

| Query | Description |
|-------|-------------|
| `rating` | 1–5 optional filter |
| `sortBy` | `rating` \| `createdAt` |
| `sortOrder` | `ASC` \| `DESC` |
| `page`, `limit` | pagination |

### `CreateReviewDto`

| Field | Type |
|-------|------|
| `productId` | positive integer |
| `rating` | 1–5 |
| `comment` | string optional, max 1000 |

### `UpdateReviewDto`

| Field | Type |
|-------|------|
| `rating` | 1–5 optional |
| `comment` | string optional |

### `PaginatedReviewResponseDto`

| Field | Type |
|-------|------|
| `data` | `ReviewResponseDto[]` |
| `total`, `page`, `limit`, `totalPages` | number |
| `avgRating` | number |
| `ratingStats` | map of star → count (e.g. `{ "1": 0, "5": 10 }`) |

### `ReviewResponseDto`

| Field | Type |
|-------|------|
| `id`, `userId`, `productId`, `rating`, `comment` | |
| `user` | `ReviewUserResponseDto` optional |
| `product` | `ProductResponseDto` optional |
| `createdAt`, `updatedAt` | date |

---

## RBAC — Roles (`/roles`)

No `JwtAuthGuard` on this controller in code — endpoints are **public** unless you add guards separately.

| Method | Path | Request | Success `data` | Errors |
|--------|------|---------|----------------|--------|
| `GET` | `/roles` | — | `RoleResponseDto[]` | **200** |
| `GET` | `/roles/:id` | — | `RoleResponseDto` | **200**, **404** |
| `POST` | `/roles` | `CreateRoleDto` | `RoleResponseDto` | **201**, **409** `RBAC_002` |
| `PATCH` | `/roles/:id` | `UpdateRoleDto` | `RoleResponseDto` | **200**, **404** |
| `DELETE` | `/roles/:id` | — | — | **204**, **404** |
| `POST` | `/roles/:roleId/permissions/:permissionId` | — | `RoleResponseDto` | **201**, **404**, **409** permission already assigned |
| `DELETE` | `/roles/:roleId/permissions/:permissionId` | — | `RoleResponseDto` | **200**, **404** |

### `CreateRoleDto` / `UpdateRoleDto`

| Field | Type |
|-------|------|
| `name` | string (max 50) |
| `description` | string optional (max 200) |
| `permissionIds` | number[] optional, unique |

### `RoleResponseDto`

| Field | Type |
|-------|------|
| `id`, `name`, `description` | |
| `permissions` | `PermissionResponseDto[]` |
| `createdAt`, `updatedAt` | date |

---

## RBAC — Permissions (`/permissions`)

Public in code (no JWT on controller).

| Method | Path | Request | Success `data` | Errors |
|--------|------|---------|----------------|--------|
| `GET` | `/permissions` | — | `PermissionResponseDto[]` | **200** |
| `GET` | `/permissions/:id` | — | `PermissionResponseDto` | **200**, **404** |
| `POST` | `/permissions` | `CreatePermissionDto` | `PermissionResponseDto` | **201**, **409** `RBAC_102` |
| `PATCH` | `/permissions/:id` | `UpdatePermissionDto` | `PermissionResponseDto` | **200**, **404** |
| `DELETE` | `/permissions/:id` | — | — | **204**, **404** |

### `CreatePermissionDto` / `UpdatePermissionDto`

| Field | Type |
|-------|------|
| `name` | string (e.g. `product.create`) |
| `action` | `create` \| `read` \| `update` \| `delete` |
| `description` | optional string |

### `PermissionResponseDto`

| Field | Type |
|-------|------|
| `id`, `name`, `action`, `description`, `createdAt`, `updatedAt` | |

---

## RBAC — User roles (`/user-roles`)

Public in code (no JWT on controller).

| Method | Path | Request | Success `data` | Errors |
|--------|------|---------|----------------|--------|
| `GET` | `/user-roles/:userId` | — | `UserRoleResponseDto[]` | **200** |
| `GET` | `/user-roles/:userId/permissions` | — | `string[]` (permission names) | **200** |
| `POST` | `/user-roles/assign` | `AssignRoleDto` | `UserRoleResponseDto` | **201**, **409** `RBAC_003` |
| `DELETE` | `/user-roles/revoke` | `AssignRoleDto` | — | **204**, **404** |

### `AssignRoleDto`

| Field | Type |
|-------|------|
| `userId` | number |
| `roleId` | number |

### `UserRoleResponseDto`

| Field | Type |
|-------|------|
| `userId`, `roleId` | number |
| `role` | `RoleResponseDto` optional |
| `createdAt`, `updatedAt` | date |

---

## Forgot password (`/forgot-password`)

The `ForgotPasswordController` is registered but **defines no HTTP routes** yet. There is no Swagger module for it.

---

## Quick reference: Swagger source files

| Module | File |
|--------|------|
| Auth | `src/modules/auth/swagger/auth.swagger.ts` |
| Categories | `src/modules/categories/swagger/categories.swagger.ts` |
| Products | `src/modules/products/swagger/products.swagger.ts` |
| Carts | `src/modules/carts/swagger/carts.swagger.ts` |
| Orders | `src/modules/orders/swagger/orders.swagger.ts` |
| Reviews | `src/modules/reviews/swagger/reviews.swagger.ts` |
| RBAC | `src/modules/rbac/swagger/rbac.swagger.ts` |

If behavior differs from this document, **runtime code** (services, guards) wins; this file mirrors Swagger + DTOs as of the last update.
