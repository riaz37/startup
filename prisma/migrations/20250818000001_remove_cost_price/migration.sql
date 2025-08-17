-- Remove costPrice column from products table
ALTER TABLE "products" DROP COLUMN "costPrice";

-- Remove costPrice column from product_price_history table  
ALTER TABLE "product_price_history" DROP COLUMN "costPrice"; 