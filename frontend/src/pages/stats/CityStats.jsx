import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import API from "../../services/api";
import { Spinner, EmptyState } from "../../components/UI";

const COLORS = ["#e63946", "#f4a261", "#4a90d9", "#2dc653", "#9b72cf", "#e9c46a", "#264653", "#e76f51", "#a8dadc", "#457b9d"];

const CityStats = () => {
  const [cityData, setCityData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [selectedCity, setSelectedCity] = useState("__all__");
  const [loading, setLoading] = useState(true);
  const [areaLoading, setAreaLoading] = useState(false);

  // Load city stats once
  useEffect(() => {
    API.get("/crimes/stats/city")
      .then((r) => setCityData(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load area stats whenever selected city changes
  useEffect(() => {
    setAreaLoading(true);
    const url =
      selectedCity === "__all__"
        ? "/crimes/stats/area"
        : `/crimes/stats/area?city=${encodeURIComponent(selectedCity)}`;

    API.get(url)
      .then((r) => setAreaData(r.data.data || []))
      .catch(() => setAreaData([]))
      .finally(() => setAreaLoading(false));
  }, [selectedCity]);

  if (loading) return <Spinner />;

  const total = cityData.reduce((s, d) => s + d.totalCrimes, 0);

  // Flatten area data for display
  const flatAreas = areaData.flatMap((cityEntry) =>
    cityEntry.areas.map((a) => ({
      label: selectedCity === "__all__" ? `${a.area} (${cityEntry._id})` : a.area,
      city: cityEntry._id,
      area: a.area,
      totalCrimes: a.totalCrimes,
    }))
  ).sort((a, b) => b.totalCrimes - a.totalCrimes);

  const areaTotal = flatAreas.reduce((s, d) => s + d.totalCrimes, 0);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">CRIMES BY CITY</div>
          <div className="section-subtitle">Geographic distribution of all incidents</div>
        </div>
      </div>

      {cityData.length === 0 ? (
        <EmptyState icon="🏙️" title="No Data Available" subtitle="Add crime reports to see city statistics." />
      ) : (
        <div className="row g-3">
          {/* ── City bar chart ── */}
          <div className="col-12">
            <div className="chart-card">
              <div className="chart-title">INCIDENT COUNT PER CITY</div>
              <div className="chart-subtitle">{cityData.length} cities · {total} total incidents</div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={cityData} margin={{ top: 10, right: 20, bottom: 70, left: 0 }}>
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
                    {cityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── City table ── */}
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
                  {cityData.map((d, i) => (
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
                            <div style={{ width: `${(d.totalCrimes / cityData[0].totalCrimes) * 100}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 3, transition: "width 0.6s ease" }} />
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

          {/* ── Area breakdown section ── */}
          <div className="col-12" style={{ marginTop: 12 }}>
            <div className="chart-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div>
                  <div className="chart-title">CRIMES BY AREA</div>
                  <div className="chart-subtitle">
                    {selectedCity === "__all__" ? "All cities" : selectedCity} · {flatAreas.length} areas · {areaTotal} incidents
                  </div>
                </div>
                <select
                  className="form-control"
                  style={{ width: "auto", minWidth: 180 }}
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="__all__">All Cities</option>
                  {cityData.map((c) => (
                    <option key={c._id} value={c._id}>{c._id}</option>
                  ))}
                </select>
              </div>

              {areaLoading ? (
                <Spinner />
              ) : flatAreas.length === 0 ? (
                <EmptyState icon="📍" title="No Area Data" subtitle="No area information found for this selection." />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={flatAreas} margin={{ top: 10, right: 20, bottom: 80, left: 0 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#8b949e", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                        angle={-40}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fill: "#8b949e", fontSize: 12, fontFamily: "IBM Plex Mono" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "#151920", border: "1px solid #1e2530", borderRadius: 6, fontFamily: "IBM Plex Mono", fontSize: 12 }}
                        labelStyle={{ color: "#e8eaed", marginBottom: 4 }}
                        itemStyle={{ color: "#8b949e" }}
                        formatter={(v, _, props) => [v, `Crimes in ${props.payload.area}`]}
                      />
                      <Bar dataKey="totalCrimes" radius={[4, 4, 0, 0]}>
                        {flatAreas.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="table-wrapper" style={{ marginTop: 16 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          {selectedCity === "__all__" && <th>City</th>}
                          <th>Area</th>
                          <th>Total Crimes</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flatAreas.map((d, i) => (
                          <tr key={`${d.city}-${d.area}`}>
                            <td style={{ fontFamily: "var(--font-display)", fontSize: 20, color: i < 3 ? "var(--accent)" : "var(--text-muted)", width: 60 }}>
                              #{i + 1}
                            </td>
                            {selectedCity === "__all__" && (
                              <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{d.city}</td>
                            )}
                            <td style={{ fontWeight: 600, fontSize: 14 }}>{d.area}</td>
                            <td style={{ fontFamily: "var(--font-display)", fontSize: 24, color: COLORS[i % COLORS.length] }}>
                              {d.totalCrimes}
                            </td>
                            <td style={{ minWidth: 160 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ flex: 1, height: 5, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ width: `${(d.totalCrimes / flatAreas[0].totalCrimes) * 100}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                                </div>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", minWidth: 38, textAlign: "right" }}>
                                  {areaTotal > 0 ? ((d.totalCrimes / areaTotal) * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityStats;