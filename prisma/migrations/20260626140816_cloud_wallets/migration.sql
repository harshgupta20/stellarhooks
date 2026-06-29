-- CreateTable
CREATE TABLE "cloud_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "network" "Network" NOT NULL DEFAULT 'TESTNET',
    "publicKey" TEXT NOT NULL,
    "encryptedSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cloud_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cloud_wallets_userId_idx" ON "cloud_wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cloud_wallets_userId_publicKey_key" ON "cloud_wallets"("userId", "publicKey");

-- AddForeignKey
ALTER TABLE "cloud_wallets" ADD CONSTRAINT "cloud_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
