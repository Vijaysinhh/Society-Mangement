const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Error: Supabase credentials not found in environment variables')
  console.error('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initializeDatabase() {
  try {
    console.log('[v0] Connecting to Supabase...')
    console.log('[v0] URL:', supabaseUrl)

    // Read the SQL schema
    const schema = fs.readFileSync('./lib/supabase-schema.sql', 'utf-8')
    
    console.log('[v0] Executing database schema...')
    
    // Execute the schema - split by statements
    const statements = schema.split(';').filter(stmt => stmt.trim())
    
    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      const trimmed = statement.trim()
      if (!trimmed) continue

      try {
        const { data, error } = await supabase.rpc('execute_sql', { 
          sql: trimmed + ';' 
        }).catch(() => {
          // If RPC doesn't exist, try direct SQL execution via admin API
          return { data: null, error: 'RPC not available' }
        })

        if (error && error.includes('RPC not available')) {
          console.log('[v0] Note: Using direct SQL - please run the schema manually in Supabase dashboard')
          console.log('[v0] Schema file location: lib/supabase-schema.sql')
          break
        }

        if (error) {
          console.warn(`[v0] Warning: ${error}`)
          errorCount++
        } else {
          successCount++
        }
      } catch (err) {
        console.warn(`[v0] Warning executing statement:`, err.message)
        errorCount++
      }
    }

    console.log(`[v0] Database initialization: ${successCount} successful, ${errorCount} warnings`)
    console.log('[v0] Database schema file ready at: lib/supabase-schema.sql')
    console.log('[v0] Please run the SQL schema in Supabase dashboard to complete setup')

  } catch (error) {
    console.error('[v0] Error initializing database:', error.message)
    process.exit(1)
  }
}

initializeDatabase()
