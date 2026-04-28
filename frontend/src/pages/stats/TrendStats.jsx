import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import API from "../../services/api";
import { Spinner, EmptyState } from "../../components/UI";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TrendStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/crimes/stats/trends")
      .then((r) => {
        const formatted = (r.data.data || []).map((d) => ({
          label: `${MONTHS[d._id.month]} ${d._id.year}`,
          totalCrimes: d.totalCrimes,
          year: d._id.year,
          month: d._id.month,
        }));
        setData(formatted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const totalAll = data.reduce((s, d) => s + d.totalCrimes, 0);
  const maxVal = data.length ? Math.max(...data.map((d) => d.totalCrimes)) : 0;
  const minVal = data.length ? Math.min(...data.map((d) => d.totalCrimes)) : 0;
  const avg = data.length ? (totalAll / data.length).toFixed(1) : 0;
  const peakEntry = data.find((d) => d.totalCrimes === maxVal);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">CRIME TRENDS</div>
          <div className="section-subtitle">Monthly incident timeline analysis</div>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState icon="📈" title="No Trend Data" subtitle="Add crime reports with dates to see trends." />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="stat-card red">
                <div className="stat-label">Peak Month</div>
                <div className="stat-value">{maxVal}</div>
                <div className="stat-meta">📍 {peakEntry?.label}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card green">
                <div className="stat-label">Lowest Month</div>
                <div className="stat-value">{minVal}</div>
                <div className="stat-meta">Quietest period</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card amber">
                <div className="stat-label">Monthly Avg</div>
                <div className="stat-value">{avg}</div>
                <div className="stat-meta">Per month</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card blue">
                <div className="stat-label">Total Period</div>
                <div className="stat-value">{totalAll}</div>
                <div className="stat-meta">{data.length} months tracked</div>
              </div>
            </div>
          </div>

          <div className="chart-card" style={{ marginBottom: 20 }}>
            <div className="chart-title">MONTHLY CRIME FREQUENCY</div>
            <div className="chart-subtitle">Number of incidents reported each month</div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 70, left: 0 }}>
                <defs>
                  <linearGradient id="crimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e63946" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#e63946" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#8b949e", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: "#8b949e", fontSize: 12, fontFamily: "IBM Plex Mono" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#151920", border: "1px solid #1e2530", borderRadius: 6, fontFamily: "IBM Plex Mono", fontSize: 12 }}
                  labelStyle={{ color: "#e8eaed", marginBottom: 4 }}
                  formatter={(v) => [v, "Incidents"]}
                />
                <Area
                  type="monotone"
                  dataKey="totalCrimes"
                  stroke="#e63946"
                  strokeWidth={2.5}
                  fill="url(#crimeGradient)"
                  dot={{ fill: "#e63946", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: "#e63946", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Incidents</th>
                  <th>vs Average</th>
                  <th>Visual</th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((d) => {
                  const diff = d.totalCrimes - parseFloat(avg);
                  const isAbove = diff >= 0;
                  return (
                    <tr key={d.label}>
                      <td data-label="Month" style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{d.label}</td>
                      <td data-label="Incidents" style={{ fontFamily: "var(--font-display)", fontSize: 26, color: d.totalCrimes === maxVal ? "var(--accent)" : "var(--text-primary)" }}>
                        {d.totalCrimes}
                        {d.totalCrimes === maxVal && <span style={{ fontSize: 12, marginLeft: 8 }}>🔺 peak</span>}
                      </td>
                      <td data-label="vs Avg" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: isAbove ? "var(--accent)" : "var(--green)" }}>
                        {isAbove ? "+" : ""}{diff.toFixed(1)}
                      </td>
                      <td data-label="Bar" style={{ minWidth: 160 }}>
                        <div style={{ height: 6, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${(d.totalCrimes / maxVal) * 100}%`, height: "100%", background: d.totalCrimes === maxVal ? "var(--accent)" : "var(--blue)", borderRadius: 3 }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TrendStats;
