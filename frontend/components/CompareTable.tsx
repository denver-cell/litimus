export interface CompareRow {
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
}

// Two-column comparison table. Column A is the other tool, column B is Litimus.
export default function CompareTable({
  caption,
  aName,
  bName,
  rows,
}: {
  caption: string;
  aName: string;
  bName: string;
  rows: CompareRow[];
}) {
  return (
    <div className="table-wrap">
      <table className="cmp" aria-label={caption}>
        <thead>
          <tr>
            <th scope="col">&nbsp;</th>
            <th scope="col">{aName}</th>
            <th scope="col">{bName}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>{r.a}</td>
              <td>{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
