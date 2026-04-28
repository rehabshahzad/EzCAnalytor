import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import API from "../../services/api";
import { Spinner, EmptyState } from "../../components/UI";

const COLORS = ["#e63946", "#f4a261", "#4a90d9", "#2dc653", "#9b72cf", "#e9c46a", "#264653", "#e76f51", "#a8dadc", "#457b9d"];

const CityStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/crimes/stats/city")
      .then((r) => setData(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const total = data.reduce((s, d) => s + d.totalCrimes, 0);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">CRIMES BY CITY</div>
          <div className="section-subtitle">Geographic distribution of all incidents</div>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState icon="🏙️" title="No Data Available" subtitle="Add crime reports to see city statistics." />
      ) : (
        <div className="row g-3">
          <div className="col-12">
            <div className="chart-card">
              <div className="chart-title">INCIDENT COUNT PER CITY</div>
              <div className="chart-subtitle">{data.length} cities · {total} total incidents</div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={data} margin={{ top: 10, right: 20, bottom: 70, left: 0 }}>
                  <XAxis
                    dataKey="_id"
                    tick={{ fill: "#8b949e", fontSize: 12, fontFamily: "IBM Plex Mono" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#8b949e", fontSize: 12, fontFamily: "IBM Plex Mono" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#151920", border: "1px solid #1e2530", borderRadius: 6, fontFamily: "IBM Plex Mono", fontSize: 12 }}
                    labelStyle={{ color: "#e8eaed", marginBottom: 4 }}
                    itemStyle={{ color: "#8b949e" }}
                    formatter={(v) => [v, "Crimes"]}
                  />
                  <Bar dataKey="totalCrimes" radius={[4, 4, 0, 0]}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-12">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>City</th>
                    <th>Total Crimes</th>
                    <th>Share of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr key={d._id}>
                      <td data-label="Rank" style={{ fontFamily: "var(--font-display)", fontSize: 22, color: i < 3 ? "var(--accent)" : "var(--text-muted)", width: 60 }}>
                        #{i + 1}
                      </td>
                      <td data-label="City" style={{ fontWeight: 600, fontSize: 15 }}>{d._id}</td>
                      <td data-label="Crimes" style={{ fontFamily: "var(--font-display)", fontSize: 28, color: COLORS[i % COLORS.length] }}>
                        {d.totalCrimes}
                      </td>
                      <td data-label="Share" style={{ minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ flex: 1, height: 6, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${(d.totalCrimes / data[0].totalCrimes) * 100}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 3, transition: "width 0.6s ease" }} />
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

export default CityStats;
