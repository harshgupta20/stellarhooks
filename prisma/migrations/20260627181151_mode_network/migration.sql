-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "network" "Network" NOT NULL DEFAULT 'TESTNET';

-- AlterTable
ALTER TABLE "webhooks" ADD COLUMN     "network" "Network" NOT NULL DEFAULT 'TESTNET';

