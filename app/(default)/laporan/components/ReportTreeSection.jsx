"use client";

import Harga from "@/components/harga";

export default function ReportTreeSection({
  reportType,
  reportSummary,
  reportTree,
  showModifier = false,
}) {
  return (
    <div className="space-y-4">
      {reportType === "full" && reportSummary ? (
        <FullReportSummary summary={reportSummary} />
      ) : null}
      {reportTree.map((rootNode) => (
        <ReportRow
          key={rootNode.id}
          node={rootNode}
          showModifier={showModifier}
        />
      ))}
    </div>
  );
}

const ReportRow = ({ node, depth = 0, showModifier = false }) => {
  const hasChildren = node.children && node.children.length > 0;
  const modifierText =
    showModifier && node.modifier != null
      ? ` (${+node.modifier > 0 ? "+" : "-"})`
      : "";

  return (
    <div className={`flex flex-col ${depth > 0 ? "mt-2" : "mt-4"}`}>
      <div
        className={`flex justify-between items-center p-3 rounded-t-lg border-b
          ${hasChildren ? "bg-slate-100 font-bold" : "bg-white font-medium"}
          ${depth === 0 ? "border-l-4 shadow-sm" : "border-l-2 border-l-slate-300"}
        `}
      >
        <span className="text-slate-700">
          {node.nama}
          {modifierText}
        </span>
        <span className="text-slate-900">
          <Harga harga={node.total_balance} />
        </span>
      </div>

      {hasChildren && (
        <div className="border-l border-r border-b border-slate-200 rounded-b-lg bg-slate-50/30 pl-2 pb-2 shadow-inner">
          {node.children.map((child) => (
            <ReportRow
              key={child.id}
              node={child}
              depth={depth + 1}
              showModifier={showModifier}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FullReportSummary = ({ summary }) => {
  const summaryItems = [
    { label: "Past", value: Number(summary?.past ?? 0) },
    { label: "End", value: Number(summary?.end ?? 0) },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="text-sm font-medium text-slate-500">{item.label}</div>
          <div className="mt-1 text-lg font-bold text-slate-800">
            <Harga harga={item.value} />
          </div>
        </div>
      ))}
    </div>
  );
};
