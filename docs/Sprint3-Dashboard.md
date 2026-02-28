# Sprint 3 — Dashboard & Maps

**Dates:** Mar 24 – Apr 6, 2026  
**Goal:** Officials see outbreak data on charts and maps.  
**Milestone:** M3 (Apr 6) — Dashboard Live

**Prerequisite:** M2 complete (verification workflow working)

---

## Week 5: Dashboard & Charts (Mar 24–28)

### Tasks

- [ ] **T5.1** Install and configure Recharts
  - Add recharts package
  - Create `src/components/charts/` directory
  - Test basic chart renders

- [ ] **T5.2** Build dashboard layout
  - Official-only route (`/dashboard`)
  - Responsive grid layout (cards + charts + map placeholder)
  - Date range selector (last 7 days, 30 days, custom)

- [ ] **T5.3** Build KPI summary cards
  - Total reports (period)
  - Verified vs pending count
  - Active diseases count
  - Reports today
  - Style with MUI Cards

- [ ] **T5.4** Create data aggregation queries
  - Query reports within date range
  - Group by disease for counts
  - Group by date for time series
  - Group by status for verification metrics
  - Consider query efficiency (may need composite indexes)

- [ ] **T5.5** Build cases by disease bar chart
  - Horizontal or vertical bar chart
  - Color-coded by disease
  - Show count labels
  - Click to filter? (stretch goal)

- [ ] **T5.6** Build cases over time line chart
  - X-axis: dates
  - Y-axis: case count
  - Multiple lines for different diseases OR single aggregate line
  - Decide granularity (daily for 7d, weekly for 30d?)

- [ ] **T5.7** Build cases by status pie/donut chart
  - Verified, Pending, Rejected breakdown
  - Optional—can cut if time short

- [ ] **T5.8** Implement date range filtering
  - Date picker or preset buttons
  - Re-query data on filter change
  - Show loading state during refetch

- [ ] **T5.9** Add dashboard loading states
  - Skeleton loaders for cards and charts
  - Graceful handling of empty data
  - Error state if query fails

- [ ] **T5.10** Create reusable chart wrapper component
  - Consistent sizing, padding
  - Title and optional subtitle
  - Download/export button (stretch goal)

### Tests (Week 5)

- [ ] **Test W5.1** Dashboard route accessible only to officials
- [ ] **Test W5.2** KPI cards show correct counts for date range
- [ ] **Test W5.3** Bar chart displays disease breakdown
- [ ] **Test W5.4** Line chart displays time series correctly
- [ ] **Test W5.5** Changing date range updates all charts
- [ ] **Test W5.6** Dashboard handles zero reports gracefully
- [ ] **Test W5.7** Charts render on mobile viewport
- [ ] **Test W5.8** Loading skeletons appear during data fetch

---

## Week 6: Maps & Filtering (Mar 31 – Apr 6)

### Tasks

- [ ] **T6.1** Install and configure Leaflet
  - Add leaflet and react-leaflet packages
  - Import Leaflet CSS
  - Handle SSR issues if any (shouldn't be a problem with Vite)

- [ ] **T6.2** Build map container component
  - Default center on Gaza Strip coordinates
  - Appropriate default zoom level
  - OpenStreetMap tile layer

- [ ] **T6.3** Add report markers to map
  - Plot verified reports with coordinates
  - Custom marker icons by disease (color-coded)
  - Handle reports without coordinates (skip or show in separate list)

- [ ] **T6.4** Implement marker clustering
  - Use leaflet.markercluster or react-leaflet-markercluster
  - Cluster at higher zoom levels
  - Show count in cluster icon
  - Expand cluster on click

- [ ] **T6.5** Build marker popup/tooltip
  - Show disease, date, status on click
  - Link to report detail? (stretch)
  - Keep PII minimal (no patient details in popup)

- [ ] **T6.6** Implement disease filter for map
  - Multi-select or single-select by disease
  - Filter markers to show only selected diseases
  - Sync with chart filters if implemented

- [ ] **T6.7** Implement location/region filter
  - Dropdown of regions (if defined)
  - Or bounding box selection (stretch)
  - Filter both map markers and chart data

- [ ] **T6.8** Implement verification status filter
  - Show verified only (default for dashboard)
  - Option to include pending
  - Toggle or dropdown

- [ ] **T6.9** Sync all filters across charts and map
  - Date range, disease, status filters apply to all visualizations
  - Consider using Zustand store for filter state

- [ ] **T6.10** Implement role-based data scoping
  - Officials see all regions (or their assigned regions)
  - Supervisors see only their region if they access dashboard
  - Apply scoping in queries, not just UI

- [ ] **T6.11** Add dashboard export/print (stretch)
  - Print-friendly CSS
  - Or screenshot/PDF export
  - Lower priority—cut if time short

- [ ] **T6.12** Internal testing session
  - Full walkthrough: submit reports → verify → view on dashboard
  - Test with realistic data volumes
  - Document bugs for Sprint 4

### Tests (Week 6)

- [ ] **Test W6.1** Map renders centered on Gaza Strip
- [ ] **Test W6.2** Verified reports appear as markers
- [ ] **Test W6.3** Markers are color-coded by disease
- [ ] **Test W6.4** Clicking marker shows popup with report info
- [ ] **Test W6.5** Markers cluster at low zoom levels
- [ ] **Test W6.6** Clicking cluster zooms in or expands
- [ ] **Test W6.7** Disease filter updates visible markers
- [ ] **Test W6.8** Status filter updates visible markers
- [ ] **Test W6.9** Date range filter affects map markers
- [ ] **Test W6.10** Filters sync between charts and map
- [ ] **Test W6.11** Supervisor sees only their region's data
- [ ] **Test W6.12** Map works on mobile viewport (pan, zoom)
- [ ] **Test W6.13** Dashboard loads acceptably fast with 100+ reports

---

## Definition of Done (M3)

- [ ] Officials can access dashboard with charts and map
- [ ] KPI cards show summary statistics
- [ ] Bar chart shows cases by disease
- [ ] Line chart shows cases over time
- [ ] Map shows verified report locations with clustering
- [ ] Markers are color-coded by disease
- [ ] Filters work: date range, disease, status
- [ ] Filters apply consistently across all visualizations
- [ ] Role-based scoping limits data access appropriately
- [ ] Dashboard is responsive on mobile
- [ ] Performance acceptable with realistic data volume

---

## Deferred to Future

- [ ] Heatmap layer as alternative to markers
- [ ] Export dashboard as PDF
- [ ] Real-time updates via Firestore listeners (can use manual refresh for now)
- [ ] Alert threshold visualization on charts

---

## Notes

- Map is the most visually impressive feature—prioritize getting markers working over fancy filtering
- If clustering is complex, can ship without it and add in Sprint 4 polish
- Test with seed data that has realistic geographic spread across Gaza Strip
- Coordinate with Dalia on which regions/governorates to use for filtering
- Consider colorblind-friendly palette for disease colors
