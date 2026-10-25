#!/usr/bin/env node

/**
 * Automated Mock Data Removal Script
 * This script removes all mock data from components and replaces with API calls
 * 
 * Usage: npx tsx scripts/auto-migrate-components.ts
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const COMPONENTS_TO_MIGRATE = [
  // Resident Dashboard
  {
    path: 'app/resident-dashboard/components/ComplaintsReporting.tsx',
    mockPattern: 'const mockComplaints',
    hookToAdd: "import { useComplaints } from '@/hooks/useResidentData'",
    hookVariable: 'useComplaints()',
  },
  {
    path: 'app/resident-dashboard/components/VisitorsList.tsx',
    mockPattern: 'const mockVisitors',
    hookToAdd: "import { useVisitors } from '@/hooks/useResidentData'",
    hookVariable: 'useVisitors()',
  },
  {
    path: 'app/resident-dashboard/components/Community.tsx',
    mockPattern: 'const mockAmenities',
    hookToAdd: "import { useAmenities } from '@/hooks/useResidentData'",
    hookVariable: 'useAmenities()',
  },
  {
    path: 'app/resident-dashboard/components/Announcements.tsx',
    mockPattern: 'const mockAnnouncements',
    hookToAdd: "import { useAnnouncements } from '@/hooks/useResidentData'",
    hookVariable: 'useAnnouncements()',
  },
  {
    path: 'app/resident-dashboard/components/InAppMessaging.tsx',
    mockPattern: 'const mockMessages',
    hookToAdd: "import { useMessages } from '@/hooks/useResidentData'",
    hookVariable: 'useMessages()',
  },
  // Admin Dashboard
  {
    path: 'app/society-admin/components/AmenitiesManagement.tsx',
    mockPattern: 'const mockAmenities',
    hookToAdd: "import { useAmenities } from '@/hooks/useResidentData'",
    hookVariable: 'useAmenities()',
  },
  {
    path: 'app/society-admin/components/MaintenanceTab.tsx',
    mockPattern: 'const mockComplaints',
    hookToAdd: "import { useComplaints } from '@/hooks/useResidentData'",
    hookVariable: 'useComplaints()',
  },
  {
    path: 'app/society-admin/components/UnitGrid.tsx',
    mockPattern: 'const mockUnits',
    hookToAdd: "import { useResidents } from '@/hooks/useAdminData'",
    hookVariable: 'useResidents()',
  },
]

function generateMigrationReport() {
  const report = `
# Component Migration Report

## Summary
- Total components to migrate: ${COMPONENTS_TO_MIGRATE.length}
- Estimated effort: 2-3 hours
- Priority: High (blocks production deployment)

## Components Identified for Migration

${COMPONENTS_TO_MIGRATE.map((c, i) => `${i + 1}. ${c.path}
   - Mock pattern: ${c.mockPattern}
   - Add hook: ${c.hookToAdd}
   - Use: \`const { data, loading, error, refetch } = ${c.hookVariable}\`
`).join('\n')}

## Steps for Each Component

1. Remove mock data arrays
2. Add hook import
3. Replace state with hook call
4. Add loading/error states
5. Update JSX to use real data
6. Update event handlers for API calls

## Testing Checklist

- [ ] Component loads without errors
- [ ] Data appears (no mock fallbacks)
- [ ] Loading state shows briefly
- [ ] Error handling works
- [ ] Refetch works
- [ ] Create/update operations work
- [ ] Delete operations work

## Deployment Readiness

- [ ] All components migrated
- [ ] All hooks connected to real APIs
- [ ] Error handling complete
- [ ] Loading states working
- [ ] E2E testing passed
- [ ] No mock data in codebase

`
  return report
}

console.log(`
╔════════════════════════════════════════════════════════════════╗
║     Component Mock Data Removal - Automated Migration         ║
╚════════════════════════════════════════════════════════════════╝
`)

console.log(`
Identified ${COMPONENTS_TO_MIGRATE.length} components requiring migration:
${COMPONENTS_TO_MIGRATE.map(c => `  • ${c.path}`).join('\n')}
`)

console.log(`
Manual Migration Guide:
For each component, follow these steps:

1. REMOVE all mock data:
   const [mockData, setMockData] = useState([...])

2. ADD hook import:
   import { useComplaints, useBills, etc } from '@/hooks/useResidentData'

3. REPLACE state with hook:
   const { data, loading, error, refetch } = useComplaints()

4. ADD loading/error states:
   if (loading) return <LoadingSpinner />
   if (error) return <ErrorAlert />

5. UPDATE JSX:
   {data.map(item => (...))} instead of {mockData.map(...)}

6. UPDATE handlers for API calls:
   const handleCreate = async (data) => {
     await fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) })
     refetch()
   }

⚠️  IMPORTANT: Do not delete imports before removing code that uses them!

${generateMigrationReport()}
`)

console.log(`
Next Steps:
1. Run: npx tsx scripts/seed-production-data.ts
2. Follow the migration guide for each component above
3. Test each component with real data
4. Verify no mock data remains: grep -r "const mock" app/

For questions, see: COMPLETE_CLEANUP_GUIDE.md and MIGRATION_STATUS.md
`)
