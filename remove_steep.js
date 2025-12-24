const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dvqoosxfycgggduoeeip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cW9vc3hmeWNnZ2dkdW9lZWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2ODAxNiwiZXhwIjoyMDgxNzQ0MDE2fQ.Dsxfav6qXfyBqMRF1_pwPz5m8aD5FD9-iGlj-hHWEjw'
);

async function cleanupSteep() {
  console.log('\n🧹 REMOVING AUTO-GENERATED STEEP CLASSIFICATIONS\n');

  // Delete all from junction tables to start fresh
  const tables = [
    'drivers_steep_categories',
    'trends_steep_categories', 
    'signals_steep_categories'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('created_at', '1900-01-01');
    
    if (error) {
      console.log(`❌ Error clearing ${table}: ${error.message}`);
    } else {
      console.log(`✅ Cleared ${table}`);
    }
  }

  console.log('\n✅ CLEANUP COMPLETE - All STEEP classifications removed\n');
  console.log('You can now manually add back the ones you want to keep.');
}

cleanupSteep().catch(console.error);
