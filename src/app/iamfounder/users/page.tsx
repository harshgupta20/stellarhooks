import { type Metadata } from "next";
import { Search } from "lucide-react";

import { requireAdminPage } from "@/server/auth/admin";
import { listUsers } from "@/server/services/admin-service";
import { parsePageParams } from "@/lib/pagination";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRowActions } from "@/features/admin/components/user-row-actions";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const admin = await requireAdminPage();
  const { page, search } = await searchParams;
  const params = parsePageParams({ page });
  const { users, meta } = await listUsers(params, search);

  const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={`${meta.total} total accounts.`} />

      <form className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={search}
          placeholder="Search by email or name…"
          className="pl-9"
        />
      </form>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Plan · Role · Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name ?? user.email.split("@")[0]}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <Badge variant="secondary">{user.counts.wallets} wal</Badge>
                    <Badge variant="secondary">{user.counts.products} prod</Badge>
                    <Badge variant="secondary">{user.counts.webhooks} hooks</Badge>
                    <Badge variant="secondary">{user.counts.payments} pay</Badge>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDateTime(user.createdAt)}
                </TableCell>
                <TableCell>
                  <UserRowActions user={user} currentAdminId={admin.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Pagination
        meta={meta}
        prevHref={`/iamfounder/users?page=${meta.page - 1}${searchQuery}`}
        nextHref={`/iamfounder/users?page=${meta.page + 1}${searchQuery}`}
      />
    </div>
  );
}
