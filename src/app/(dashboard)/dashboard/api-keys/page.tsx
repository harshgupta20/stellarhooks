import { type Metadata } from "next";
import { KeyRound } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listApiKeys } from "@/server/services/apikey-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { ApiKeyCreateDialog } from "@/features/api-keys/components/api-key-create-dialog";
import { RevokeApiKeyButton } from "@/features/api-keys/components/revoke-api-key-button";

export const metadata: Metadata = { title: "API Keys — StellarHooks" };

export default async function ApiKeysPage() {
  const user = await requireUser();
  const network = await getModeNetwork();
  const keys = await listApiKeys(user.id, network);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Authenticate the StellarHooks SDK and REST API."
        action={<ApiKeyCreateDialog />}
      />

      {keys.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No API keys yet"
          description="Create a key to use the SDK or call the REST API with a Bearer token."
          action={<ApiKeyCreateDialog />}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="font-mono text-xs text-muted-foreground">
                      {key.prefix}…
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : "Never"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(key.createdAt)}
                  </TableCell>
                  <TableCell>
                    <RevokeApiKeyButton id={key.id} name={key.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
