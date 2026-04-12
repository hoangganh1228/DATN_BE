# Project Folder Structure

```text
e-commerce/
├── src/
│   ├── common/
│   │   ├── constants/
│   │   ├── decorators/
│   │   ├── entities/
│   │   ├── exceptions/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── redis/
│   │   ├── upload/
│   │   └── utils/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── dtos/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   └── swagger/
│   │   ├── carts/
│   │   │   ├── dtos/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── swagger/
│   │   ├── categories/
│   │   │   ├── dtos/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── swagger/
│   │   ├── orders/
│   │   │   ├── dtos/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── swagger/
│   │   ├── products/
│   │   │   ├── dtos/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── swagger/
│   │   ├── rbac/
│   │   │   ├── dtos/
│   │   │   ├── entities/
│   │   │   ├── guards/
│   │   │   ├── repositories/
│   │   │   └── swagger/
│   │   ├── reviews/
│   │   │   ├── dtos/
│   │   │   ├── entitites/
│   │   │   ├── repositories/
│   │   │   └── swagger/
│   │   └── users/
│   │       ├── dtos/
│   │       ├── entities/
│   │       └── repositories/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

## Notes

- Cac module dang duoc to chuc theo huong `dtos/entities/repositories/swagger`.
- Trong `reviews` hien co thu muc dat ten la `entitites` (co the la typo cua `entities`).
