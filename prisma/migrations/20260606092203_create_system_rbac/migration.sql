-- CreateTable
CREATE TABLE "system_users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(50),
    "role_id" INTEGER NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_roles" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,
    "role_code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_menus" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "menu_name" VARCHAR(50) NOT NULL,
    "path" VARCHAR(255),
    "component" VARCHAR(255),
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_role_menus" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_role_menus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_users_username_key" ON "system_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "system_roles_role_code_key" ON "system_roles"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "system_role_menus_role_id_menu_id_key" ON "system_role_menus"("role_id", "menu_id");

-- AddForeignKey
ALTER TABLE "system_users" ADD CONSTRAINT "system_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "system_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_menus" ADD CONSTRAINT "system_menus_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "system_menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_role_menus" ADD CONSTRAINT "system_role_menus_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "system_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_role_menus" ADD CONSTRAINT "system_role_menus_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "system_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
