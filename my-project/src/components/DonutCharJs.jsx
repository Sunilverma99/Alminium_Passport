import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const DonutChart = ({ backendData }) => {
  if (!backendData || !backendData.shares) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Color palette
  const colorPalette = {
    preConsumer: "#004AB2",
    postConsumer: "#e8223B",
    virgin: "#585858",
    accent: "#f66864"
  };

  const getSmartColor = (label) => {
    const l = label.toLowerCase();
    if (l.includes("pre-consumer") || l.includes("pre consumer")) {
      return colorPalette.preConsumer;
    }
    if (l.includes("post-consumer") || l.includes("post consumer")) {
      return colorPalette.postConsumer;
    }
    if (l.includes("virgin") || l.includes("primary")) {
      return colorPalette.virgin;
    }
    return colorPalette.accent;
  };

  // Prepare data
  const processedData = backendData.shares
    .filter((s) => s.value > 0)
    .map((s) => ({
      name: s.label,
      value: Math.round(s.value * 100) / 100,
      color: getSmartColor(s.label)
    }))
    .sort((a, b) => b.value - a.value);

  const totalPercentage = processedData.reduce((sum, x) => sum + x.value, 0);
  const isValidData = Math.abs(totalPercentage - 100) < 0.1;

  // Label for slices ≥5%
  const renderEnhancedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value
  }) => {
    if (value < 5) return null;
    const RAD = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.2;
    const x = cx + radius * Math.cos(-midAngle * RAD);
    const y = cy + radius * Math.sin(-midAngle * RAD);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">
          Value: <span className="font-medium">{data.value}%</span>
        </p>
        <p className="text-xs text-gray-500">
          Material: {backendData.material}
        </p>
      </div>
    );
  };

  // Custom legend
  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1 text-xs">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700 font-medium">
            {entry.payload.name} ({entry.payload.value}%)
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-5 rounded-lg relative overflow-visible">
      <div className="text-center mb-3">
        <h3 className="text-black text-lg font-semibold mb-1">
          Recycled Content Share
        </h3>
        {!isValidData && (
          <p className="text-xs text-amber-600">
            ⚠ Data may be incomplete (Total: {totalPercentage.toFixed(1)}%)
          </p>
        )}
      </div>

      <ResponsiveContainer
        width="100%"
        height={300}
        style={{ overflow: "visible" }}
      >
        <PieChart
          style={{ overflow: "visible" }}
        >
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="95%"
            paddingAngle={2}
            dataKey="value"
            label={renderEnhancedLabel}
            labelLine={false}
          >
            {processedData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ overflow: "visible", zIndex: 999 }}
            contentStyle={{ overflow: "visible" }}
            cursor={false}
          />

          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-gray-500 text-lg font-bold">
          {backendData.material}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {backendData.totalRecycledShare}% Recycled
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
