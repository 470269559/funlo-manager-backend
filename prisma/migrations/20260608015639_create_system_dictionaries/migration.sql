-- CreateTable
CREATE TABLE "system_dictionary_types" (
    "id" SERIAL NOT NULL,
    "dict_name" VARCHAR(50) NOT NULL,
    "dict_code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_dictionary_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_dictionary_items" (
    "id" SERIAL NOT NULL,
    "type_id" INTEGER NOT NULL,
    "item_label" VARCHAR(50) NOT NULL,
    "item_value" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_dictionary_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_dictionary_types_dict_code_key" ON "system_dictionary_types"("dict_code");

-- CreateIndex
CREATE UNIQUE INDEX "system_dictionary_items_type_id_item_value_key" ON "system_dictionary_items"("type_id", "item_value");

-- AddForeignKey
ALTER TABLE "system_dictionary_items" ADD CONSTRAINT "system_dictionary_items_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "system_dictionary_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
