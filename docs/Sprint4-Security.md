# Sprint 4 — Security & Polish

**Dates:** Apr 7 – Apr 14, 2026  
**Goal:** Production-ready, security audited, deployed.  
**Milestone:** M4 (Apr 14) — Security Hardened

**⚠️ This is a compressed 1-week sprint. Prioritize ruthlessly.**

**Prerequisite:** M3 complete (dashboard working)

---

## Daily Breakdown

### Monday, Apr 7 — Security Audit

- [ ] **T7.1** Audit Firestore security rules
  - Review every rule against intended access patterns
  - Document what each rule allows/denies
  - Verify no open read/write rules remain from testing

- [ ] **T7.2** Test unauthorized access attempts
  - Volunteer tries to access supervisor routes → blocked
  - Volunteer tries to verify reports via direct Firestore write → blocked
  - Supervisor tries to access other region's data → blocked
  - Unauthenticated user tries to read any data → blocked
  - Document test results

- [ ] **T7.3** Verify role scoping in queries
  - All queries filter by region where appropriate
  - No way to bypass region filter via client manipulation
  - Check both read and write operations

- [ ] **T7.4** Review auth custom claims
  - Role stored in custom claims (not just Firestore doc)
  - Claims refreshed appropriately after approval
  - Consider token refresh flow

- [ ] **T7.5** PII audit
  - Dashboard shows aggregated data only
  - Individual patient data not exposed to officials
  - Reporter identity protected appropriately

### Tests (Monday)

- [ ] **Test S4.1** Volunteer cannot access /supervisor routes
- [ ] **Test S4.2** Volunteer cannot access /dashboard routes
- [ ] **Test S4.3** Direct Firestore write as volunteer to verify report → permission denied
- [ ] **Test S4.4** Supervisor query for other region → returns empty or error
- [ ] **Test S4.5** Unauthenticated request to Firestore → denied
- [ ] **Test S4.6** API requests include valid auth token

---

### Tuesday, Apr 8 — CI/CD

- [ ] **T8.1** Set up GitHub Actions workflow
  - Create `.github/workflows/deploy.yml`
  - Trigger on push to main branch

- [ ] **T8.2** Add lint step
  - ESLint with TypeScript config
  - Fail build on lint errors

- [ ] **T8.3** Add type check step
  - `tsc --noEmit`
  - Fail build on type errors

- [ ] **T8.4** Add build step
  - `npm run build`
  - Verify production build succeeds

- [ ] **T8.5** Add deploy step
  - Firebase CLI deploy to Hosting
  - Set up Firebase service account secret in GitHub
  - Deploy only on main branch, not PRs

- [ ] **T8.6** Test pipeline end-to-end
  - Push commit to main
  - Verify workflow runs
  - Verify site updates on Firebase Hosting

- [ ] **T8.7** Add build status badge to README

### Tests (Tuesday)

- [ ] **Test S4.7** Push to main triggers GitHub Actions
- [ ] **Test S4.8** Lint failure blocks deployment
- [ ] **Test S4.9** Successful build deploys to Firebase Hosting
- [ ] **Test S4.10** Deployed site loads correctly

---

### Wednesday, Apr 9 — Deploy & Polish

- [ ] **T9.1** Production Firebase configuration
  - Verify production environment config
  - Ensure no emulator connections in prod
  - Check Firestore rules deployed to production

- [ ] **T9.2** Production deployment verification
  - Test deployed site on multiple devices
  - Verify HTTPS working
  - Check PWA install works on Android Chrome

- [ ] **T9.3** Add loading states (audit)
  - Every data-fetching component has loading state
  - Skeleton loaders or spinners
  - No blank screens while loading

- [ ] **T9.4** Add error boundaries
  - Wrap major route sections
  - Show user-friendly error message
  - Offer retry or navigation options

- [ ] **T9.5** Add empty states
  - "No reports yet" for empty lists
  - "No data for selected filters" for dashboard
  - Helpful messaging, not just blank space

- [ ] **T9.6** Responsive design audit
  - Test all views on mobile viewport
  - Fix any overflow or layout issues
  - Ensure touch targets are adequate size

- [ ] **T9.7** Offline indicator
  - Show banner or icon when offline
  - Reassure user that data will sync
  - Hide when back online

### Tests (Wednesday)

- [ ] **Test S4.11** Production site loads via HTTPS
- [ ] **Test S4.12** PWA installs on Android Chrome
- [ ] **Test S4.13** All routes show loading states during fetch
- [ ] **Test S4.14** Intentional error shows error boundary, not crash
- [ ] **Test S4.15** Empty report list shows helpful message
- [ ] **Test S4.16** All views usable on 360px wide viewport
- [ ] **Test S4.17** Offline indicator appears when network disabled

---

### Thursday, Apr 10 — Seed Data & Regression

- [ ] **T10.1** Create seed data script
  - Generate realistic test data
  - Multiple diseases, multiple locations
  - Date range spanning several weeks
  - Mix of statuses (pending, verified, rejected)
  - 50-100 reports for meaningful dashboard

- [ ] **T10.2** Seed production-like data to staging
  - Or use emulator for demo
  - Ensure data shows meaningful patterns on dashboard

- [ ] **T10.3** Full regression: Volunteer flow
  - Register → pending → (manual approve) → login → submit report → view reports

- [ ] **T10.4** Full regression: Supervisor flow
  - Login → approve volunteer → view pending reports → verify/reject → view verified list

- [ ] **T10.5** Full regression: Official flow
  - Login → approve supervisor → view dashboard → apply filters → view map

- [ ] **T10.6** Full regression: Offline flows
  - Submit report offline → reconnect → verify synced
  - Verify report offline → reconnect → verify synced
  - App loads offline

- [ ] **T10.7** Document remaining bugs
  - Create issues in GitHub
  - Prioritize: P0 (must fix), P1 (should fix), P2 (nice to fix)

### Tests (Thursday)

- [ ] **Test S4.18** Seed data populates dashboard meaningfully
- [ ] **Test S4.19** Full volunteer flow works end-to-end
- [ ] **Test S4.20** Full supervisor flow works end-to-end
- [ ] **Test S4.21** Full official flow works end-to-end
- [ ] **Test S4.22** Offline report submission syncs correctly
- [ ] **Test S4.23** Offline verification syncs correctly
- [ ] **Test S4.24** App loads and is navigable when started offline

---

### Friday, Apr 11 — Buffer & Final Fixes

- [ ] **T11.1** Fix P0 bugs from Thursday
- [ ] **T11.2** Fix P1 bugs if time permits
- [ ] **T11.3** Update README with current status
  - Accurate setup instructions
  - Current feature list
  - Known limitations

- [ ] **T11.4** Update docs/firestore-schema.md
- [ ] **T11.5** Final deployment to production
- [ ] **T11.6** Smoke test production deployment
- [ ] **T11.7** Create demo account credentials
  - One of each role for demonstration
  - Document in secure location (not README)

### Tests (Friday)

- [ ] **Test S4.25** All P0 bugs resolved
- [ ] **Test S4.26** Production deployment matches expected behavior
- [ ] **Test S4.27** Demo accounts work correctly

---

## Weekend Buffer (Apr 12–13)

If needed, use for:
- [ ] Additional bug fixes
- [ ] Documentation polish
- [ ] Demo preparation
- [ ] Coordination with Dalia on public health framing

---

## Definition of Done (M4)

- [ ] Security rules audited and tested
- [ ] No unauthorized access possible via client manipulation
- [ ] CI/CD pipeline deploys on merge to main
- [ ] Production site live on Firebase Hosting
- [ ] All views have loading, error, and empty states
- [ ] App responsive on mobile
- [ ] Offline indicator present
- [ ] Seed data provides realistic demo
- [ ] Full regression passed for all user flows
- [ ] Offline functionality verified
- [ ] README and schema docs updated
- [ ] Demo accounts created

---

## Out of Scope for M4

- [ ] Accessibility audit (ARIA, keyboard nav) — nice to have, not blocking
- [ ] Performance optimization beyond obvious issues
- [ ] Comprehensive unit test coverage
- [ ] Internationalization (Arabic) — documented as future work

---

## Risk Mitigation

**If Thursday regression reveals major bugs:**
- Friday is buffer day—use it fully
- Prioritize offline sync issues over UI polish
- If necessary, disable broken features rather than ship broken

**If CI/CD setup takes longer than Tuesday:**
- Manual deploy is acceptable for M4
- Document manual deploy process
- CI/CD becomes P1 for post-project

**If security audit reveals architectural issues:**
- Fix critical vulnerabilities (data exposure) immediately
- Document lesser issues as known limitations
- Do not ship with open security rules

---

## Notes

- This week is about stability, not new features
- Resist scope creep—no new features this sprint
- Better to have fewer polished features than many broken ones
- Document everything that gets cut for future work
- Coordinate with Dalia on final review before Apr 14
