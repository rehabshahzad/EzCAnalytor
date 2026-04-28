import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import API from "../../services/api";
import { Spinner, EmptyState } from "../../components/UI";

const COLORS = ["#e63946", "#f4a261", "#4a90d9", "#2dc653", "#9b72cf", "#e9c46a", "#264653", "#e76f51", "#a8dadc", "#457b9d"];

const TypeStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/crimes/stats/type")
      .then((r) => setData(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const total = data.reduce((s, d) => s + d.totalCrimes, 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontFamily="IBM Plex Mono">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">CRIMES BY TYPE</div>
          <div className="section-subtitle">Category breakdown of all incidents</div>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState icon="📂" title="No Data Available" subtitle="Add crime reports to see type statistics." />
      ) : (
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="chart-card">
              <div className="chart-title">TYPE DISTRIBUTION</div>
              <div className="chart-subtitle">{data.length} crime categories · {total} total records</div>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="totalCrimes"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={160}
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#151920", border: "1px solid #1e2530", borderRadius: 6, fontFamily: "IBM Plex Mono", fontSize: 12 }}
                    formatter={(v, n) => [v + " cases", n]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Crime Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr key={d._id}>
                      <td data-label="Type">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontWeight: 600 }}>{d._id}</span>
                        </div>
                      </td>
                      <td data-label="Count" style={{ fontFamily: "var(--font-display)", fontSize: 26, color: COLORS[i % COLORS.length] }}>
                        {d.totalCrimes}
                      </td>
                      <td data-label="%" style={{ minWidth: 160 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, height: 6, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${(d.totalCrimes / total) * 100}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", minWidth: 42, textAlign: "right" }}>
                            {((d.totalCrimes / total) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeStats;
