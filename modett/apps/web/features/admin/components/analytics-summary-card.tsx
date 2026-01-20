interface AnalyticsSummaryCardProps {
  title: string;
  value: string;
  color: "green" | "blue" | "purple" | "amber";
}

const colorVariants = {
  green: {
    gradient: "from-green-50 to-white",
    border: "border-green-200",
    text: "text-green-700",
  },
  blue: {
    gradient: "from-blue-50 to-white",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  purple: {
    gradient: "from-purple-50 to-white",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  amber: {
    gradient: "from-amber-50 to-white",
    border: "border-amber-200",
    text: "text-amber-700",
  },
};

export function AnalyticsSummaryCard({
  title,
  value,
  color,
}: AnalyticsSummaryCardProps) {
  const colors = colorVariants[color];

  return (
    <div
      className={`bg-gradient-to-br ${colors.gradient} border ${colors.border} rounded-xl p-6`}
    >
      <div className={`text-sm font-medium ${colors.text} mb-2`}>{title}</div>
      <div className="text-3xl font-bold text-[#232D35]">{value}</div>
    </div>
  );
}
