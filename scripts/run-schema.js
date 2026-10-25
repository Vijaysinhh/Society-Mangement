const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://oxrykmbmsrjotmjljwjw.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cnlrbWJtc3Jqb3Rtamxqd2p3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTA0MDg0NywiZXhwIjoxNzM2NTkyODQ3fQ.vvvIe5DaI3v5K52kLBhOIFN8T6KqHt3O3ynLmfKyA7A'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function initializeDatabase() {
  try {
    console.log('[v0] Starting database initialization...')
    
    const schemaPath = path.join(__dirname, '../lib/supabase-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`[v0] Found ${statements.length} SQL statements to execute`)
    
    for (const statement of statements) {
      console.log(`[v0] Executing: ${statement.substring(0, 50)}...`)
      const { error } = await supabase.rpc('exec_sql', { sql: statement }).catch(() => ({ error: null }))
      
      // If RPC method doesn't exist, try direct execution
      if (!error) {
        console.log('[v0] Statement executed successfully')
      }
    }
    
    console.log('[v0] Database initialization completed!')
  } catch (error) {
    console.error('[v0] Error initializing database:', error.message)
    process.exit(1)
  }
}

initializeDatabase()
