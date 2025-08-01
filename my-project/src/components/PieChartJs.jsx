import React from "react";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Raw Material Extraction: 89gCO₂e/kWh", value: 65.0 },
  { name: "Main Production: 30gCO₂e/kWh", value: 21.9 },
  { name: "Distribution: 10gCO₂e/kWh", value: 7.3 },
  { name: "Recycling: 8gCO₂e/kWh", value: 5.8 },
];

const COLORS = ["#585858", "#e8223B", "#004AB2", "#f66864"]; // Colors for the chart

const ResponsivePieChart = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen size change
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Define mobile as width <= 768px
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize); // Add resize listener
    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  return (
    <div className="flex justify-center items-center w-full h-auto p-6 rounded-lg">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          {/* Pie Component */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            fill="#ffffff"
            dataKey="value"

            label={({ name, percent }) =>
              isMobile ? `${(percent * 100).toFixed(1)}%` :
              `${name.split(":")[0]} (${(percent * 100).toFixed(1)}%)`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          {/* Legend */}
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ color: "white" }}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              color: "#ffffff",
              borderRadius: "5px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponsivePieChart;
