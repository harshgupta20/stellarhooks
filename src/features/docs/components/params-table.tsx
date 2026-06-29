export interface Param {
  name: string;
  type: string;
  required?: boolean;
  description: React.ReactNode;
}

/** Documents request/response fields. */
export function ParamsTable({ params }: { params: Param[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <tbody className="divide-y">
          {params.map((p) => (
            <tr key={p.name} className="align-top">
              <td className="w-1/3 p-3">
                <code className="font-mono text-[13px] text-foreground">{p.name}</code>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[11px] text-muted-foreground">{p.type}</span>
                  {p.required ? (
                    <span className="rounded bg-destructive/10 px-1.5 text-[10px] font-medium text-destructive">
                      required
                    </span>
                  ) : (
                    <span className="rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                      optional
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3 leading-6 text-muted-foreground">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
