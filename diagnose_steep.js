const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dvqoosxfycgggduoeeip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cW9vc3hmeWNnZ2dkdW9lZWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2ODAxNiwiZXhwIjoyMDgxNzQ0MDE2fQ.Dsxfav6qXfyBqMRF1_pwPz5m8aD5FD9-iGlj-hHWEjw'
);

async function diagnose() {
  console.log('\n=== CHECKING STEEP CATEGORIES ===');
  const { data: steep, error: steepError } = await supabase
    .from('steep_categories')
    .select('*');
  
  if (steepError) {
    console.error('Error loading STEEP categories:', steepError);
  } else {
    console.log(`✓ Found ${steep.length} STEEP categories`);
    steep.forEach(s => console.log(`  - ${s.steep_name} (id: ${s.id})`));
  }

  console.log('\n=== CHECKING DRIVERS ===');
  const { data: drivers, error: driversError } = await supabase
    .from('drivers')
    .select('id, driver_name');
  
  if (driversError) {
    console.error('Error loading drivers:', driversError);
  } else {
    console.log(`✓ Found ${drivers.length} drivers`);
  }

  console.log('\n=== CHECKING DRIVERS_STEEP_CATEGORIES JUNCTION ===');
  const { data: driversSteep, error: driversSteepError } = await supabase
    .from('drivers_steep_categories')
    .select('*, steep_categories(steep_name)');
  
  if (driversSteepError) {
    console.error('Error loading drivers_steep_categories:', driversSteepError);
  } else {
    console.log(`✓ Found ${driversSteep.length} driver-STEEP associations`);
    if (driversSteep.length > 0) {
      console.log('Sample associations:');
      driversSteep.slice(0, 3).forEach(ds => {
        console.log(`  - Driver ${ds.driver_id} → ${ds.steep_categories?.steep_name || 'N/A'}`);
      });
    } else {
      console.log('⚠️  NO ASSOCIATIONS FOUND - This is why STEEP filter is empty!');
    }
  }

  console.log('\n=== CHECKING TRENDS ===');
  const { data: trends, error: trendsError } = await supabase
    .from('trends')
    .select('id, trend_name');
  
  if (trendsError) {
    console.error('Error loading trends:', trendsError);
  } else {
    console.log(`✓ Found ${trends.length} trends`);
  }

  console.log('\n=== CHECKING TRENDS_STEEP_CATEGORIES JUNCTION ===');
  const { data: trendsSteep, error: trendsSteepError } = await supabase
    .from('trends_steep_categories')
    .select('*, steep_categories(steep_name)');
  
  if (trendsSteepError) {
    console.error('Error loading trends_steep_categories:', trendsSteepError);
  } else {
    console.log(`✓ Found ${trendsSteep.length} trend-STEEP associations`);
    if (trendsSteep.length === 0) {
      console.log('⚠️  NO ASSOCIATIONS FOUND');
    }
  }

  console.log('\n=== CHECKING SIGNALS_STEEP_CATEGORIES JUNCTION ===');
  const { data: signalsSteep, error: signalsSteepError } = await supabase
    .from('signals_steep_categories')
    .select('*, steep_categories(steep_name)');
  
  if (signalsSteepError) {
    console.error('Error loading signals_steep_categories:', signalsSteepError);
  } else {
    console.log(`✓ Found ${signalsSteep.length} signal-STEEP associations`);
    if (signalsSteep.length === 0) {
      console.log('⚠️  NO ASSOCIATIONS FOUND');
    }
  }

  console.log('\n=== CHECKING HUBSPOT INDUSTRIES ===');
  const { data: hubspot, error: hubspotError } = await supabase
    .from('hubspot_industries')
    .select('*');
  
  if (hubspotError) {
    console.error('Error loading hubspot_industries:', hubspotError);
  } else {
    console.log(`✓ Found ${hubspot.length} HubSpot industries`);
    console.log('Sample industries:');
    hubspot.slice(0, 5).forEach(h => console.log(`  - ${h.industry_name}`));
  }

  console.log('\n=== DIAGNOSIS COMPLETE ===');
}

diagnose().catch(console.error);
