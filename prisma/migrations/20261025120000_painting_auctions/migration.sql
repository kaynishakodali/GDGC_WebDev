-- Add optional auction sale mode without changing existing fixed-price paintings.
CREATE TYPE "PaintingSaleMode" AS ENUM ('fixed', 'auction');

ALTER TABLE "Painting"
ADD COLUMN "saleMode" "PaintingSaleMode" NOT NULL DEFAULT 'fixed',
ADD COLUMN "auctionEndsAt" TIMESTAMP(3);

CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "paintingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Bid_paintingId_amount_idx" ON "Bid"("paintingId", "amount");
CREATE INDEX "Bid_customerId_createdAt_idx" ON "Bid"("customerId", "createdAt");

ALTER TABLE "Bid"
ADD CONSTRAINT "Bid_paintingId_fkey" FOREIGN KEY ("paintingId") REFERENCES "Painting"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT "Bid_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
