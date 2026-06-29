import { type Metadata } from "next";
import { Wallet } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listWallets } from "@/server/services/wallet-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { WalletCreateDialog } from "@/features/wallets/components/wallet-create-dialog";
import { WalletsTable } from "@/features/wallets/components/wallets-table";

export const metadata: Metadata = { title: "Monitored Wallets — StellarHooks" };

export default async function WalletsPage() {
  const user = await requireUser();
  const network = await getModeNetwork();
  const wallets = await listWallets(user.id, network);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitored Wallets"
        description="Addresses you own (held elsewhere) that we watch read-only for incoming payments."
        action={<WalletCreateDialog network={network} />}
      />

      {wallets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No monitored wallets yet"
          description="Add a Stellar address you own to start receiving payment webhooks. We only watch it — we never hold its keys."
          action={<WalletCreateDialog network={network} />}
        />
      ) : (
        <WalletsTable wallets={wallets} />
      )}
    </div>
  );
}
