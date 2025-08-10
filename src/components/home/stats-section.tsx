interface StatItem {
  value: string;
  label: string;
}

const stats: StatItem[] = [
  {
    value: "50%+",
    label: "Average Savings"
  },
  {
    value: "10K+",
    label: "Happy Customers"
  },
  {
    value: "500+",
    label: "Group Orders"
  }
];

export function StatsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}