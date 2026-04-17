"use client";
export default function App() {
  const rawNodes = [
    { id: "1", parentId: null, name: "Rugi Laba", order: 1 },
    { id: "2", parentId: "1", name: "Gross Profit", order: 1 },
    { id: "3", parentId: "2", name: "Pendapatan", order: 1 },
    { id: "4", parentId: "3", name: "Barang", coaId: 101, order: 1 }, // Leaf
    { id: "5", parentId: "3", name: "Jasa", coaId: 102, order: 2 }, // Leaf
    { id: "6", parentId: "2", name: "HPP", order: 2 },
    { id: "7", parentId: "6", name: "HPP Pokok", coaId: 501, order: 1 }, // Leaf
  ];
  // Actual balances fetched from your Ledger/Transactions table
  const balances = {
    101: 5000, // Barang
    102: 2000, // Jasa
    501: 3000, // HPP
  };
  const buildAndCalculateTree = (nodes, balances, parentId = null) => {
    return nodes
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map((node) => {
        const children = buildAndCalculateTree(nodes, balances, node.id);

        let total = 0;
        if (node.coaId) {
          // If it's a leaf, get value from balances
          total = balances[node.coaId] || 0;
        } else {
          // If it's a category, sum its children
          total = children.reduce((sum, child) => sum + child.total, 0);
        }

        return {
          ...node,
          children,
          total,
        };
      });
  };
  const reportTree = buildAndCalculateTree(rawNodes, balances);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <header className="mb-8 border-b-2 border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-800">
          Laporan Rugi Laba
        </h1>
        <p className="text-slate-500 italic">
          Customizable Administrative Report
        </p>
      </header>

      <div className="space-y-4">
        {reportTree.map((rootNode) => (
          <ReportRow key={rootNode.id} node={rootNode} />
        ))}
      </div>
    </div>
  );
}

const ReportRow = ({ node, depth = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`flex flex-col ${depth > 0 ? "mt-2" : "mt-4"}`}>
      {/* Header Row: Displays Name and Total */}
      <div
        className={`flex justify-between items-center p-3 rounded-t-lg border-b
          ${hasChildren ? "bg-slate-100 font-bold" : "bg-white font-medium"}
          ${depth === 0 ? "border-l-4 border-l-blue-600 shadow-sm" : "border-l-2 border-l-slate-300"}
        `}
      >
        <span className="text-slate-700">{node.name}</span>
        <span className="text-slate-900">
          {node.total.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </span>
      </div>

      {/* The Container for Siblings (The "Box") */}
      {hasChildren && (
        <div className="ml-4 border-l border-r border-b border-slate-200 rounded-b-lg bg-slate-50/30 pl-2 shadow-inner">
          {node.children.map((child) => (
            <ReportRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
