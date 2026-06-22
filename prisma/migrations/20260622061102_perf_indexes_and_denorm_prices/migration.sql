-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "maxPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "minPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "popularityScore" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "Product_categoryId_isActive_idx" ON "Product"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "Product_isActive_isFeatured_createdAt_idx" ON "Product"("isActive", "isFeatured", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Product_isActive_minPrice_idx" ON "Product"("isActive", "minPrice");

-- CreateIndex
CREATE INDEX "Product_isActive_maxPrice_idx" ON "Product"("isActive", "maxPrice");

-- CreateIndex
CREATE INDEX "Product_isActive_popularityScore_idx" ON "Product"("isActive", "popularityScore");

-- CreateIndex
CREATE INDEX "Product_isActive_createdAt_idx" ON "Product"("isActive", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProductImage_productId_isPrimary_idx" ON "ProductImage"("productId", "isPrimary");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_isActive_price_idx" ON "ProductVariant"("productId", "isActive", "price");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_isActive_stock_idx" ON "ProductVariant"("productId", "isActive", "stock");
