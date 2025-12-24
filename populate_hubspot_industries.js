const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dvqoosxfycgggduoeeip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cW9vc3hmeWNnZ2dkdW9lZWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2ODAxNiwiZXhwIjoyMDgxNzQ0MDE2fQ.Dsxfav6qXfyBqMRF1_pwPz5m8aD5FD9-iGlj-hHWEjw'
);

async function populateHubSpot() {
  console.log('\n🏢 POPULATING HUBSPOT INDUSTRIES\n');

  // Get all HubSpot industries
  const { data: industries } = await supabase.from('hubspot_industries').select('*');
  console.log(`✅ Found ${industries.length} HubSpot industries`);

  // Assign 0-5 random industries to each driver (some will have none)
  console.log('\n📊 DRIVERS:');
  const { data: drivers } = await supabase.from('drivers').select('id, driver_name');
  console.log(`   Found ${drivers.length} drivers`);
  
  for (const driver of drivers) {
    // 30% chance of having no industries
    if (Math.random() < 0.3) {
      console.log(`   ⚪ "${driver.driver_name}" → No industries`);
      continue;
    }
    
    const numIndustries = Math.floor(Math.random() * 5) + 1; // 1-5 industries
    const selectedIndustries = [];
    const availableIndustries = [...industries];
    
    for (let i = 0; i < numIndustries && availableIndustries.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndustries.length);
      selectedIndustries.push(availableIndustries.splice(randomIndex, 1)[0]);
    }
    
    const junctionRecords = selectedIndustries.map(ind => ({
      driver_id: driver.id,
      hubspot_industry_id: ind.id
    }));
    
    const { error } = await supabase
      .from('drivers_hubspot_industries')
      .insert(junctionRecords);
    
    if (!error) {
      console.log(`   ✅ "${driver.driver_name}" → ${selectedIndustries.length} industries`);
    }
  }

  // Assign to trends
  console.log('\n📈 TRENDS:');
  const { data: trends } = await supabase.from('trends').select('id, trend_name');
  console.log(`   Found ${trends.length} trends`);
  
  for (const trend of trends) {
    if (Math.random() < 0.3) {
      console.log(`   ⚪ "${trend.trend_name}" → No industries`);
      continue;
    }
    
    const numIndustries = Math.floor(Math.random() * 5) + 1;
    const selectedIndustries = [];
    const availableIndustries = [...industries];
    
    for (let i = 0; i < numIndustries && availableIndustries.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndustries.length);
      selectedIndustries.push(availableIndustries.splice(randomIndex, 1)[0]);
    }
    
    const junctionRecords = selectedIndustries.map(ind => ({
      trend_id: trend.id,
      hubspot_industry_id: ind.id
    }));
    
    const { error } = await supabase
      .from('trends_hubspot_industries')
      .insert(junctionRecords);
    
    if (!error) {
      console.log(`   ✅ "${trend.trend_name}" → ${selectedIndustries.length} industries`);
    }
  }

  // Assign to signals
  console.log('\n📡 SIGNALS:');
  const { data: signals } = await supabase.from('signals').select('id, signal_name');
  console.log(`   Found ${signals.length} signals`);
  
  for (const signal of signals) {
    if (Math.random() < 0.3) {
      console.log(`   ⚪ "${signal.signal_name}" → No industries`);
      continue;
    }
    
    const numIndustries = Math.floor(Math.random() * 5) + 1;
    const selectedIndustries = [];
    const availableIndustries = [...industries];
    
    for (let i = 0; i < numIndustries && availableIndustries.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndustries.length);
      selectedIndustries.push(availableIndustries.splice(randomIndex, 1)[0]);
    }
    
    const junctionRecords = selectedIndustries.map(ind => ({
      signal_id: signal.id,
      hubspot_industry_id: ind.id
    }));
    
    const { error } = await supabase
      .from('signals_hubspot_industries')
      .insert(junctionRecords);
    
    if (!error) {
      console.log(`   ✅ "${signal.signal_name}" → ${selectedIndustries.length} industries`);
    }
  }

  console.log('\n✅ HUBSPOT INDUSTRIES POPULATION COMPLETE!\n');
}

populateHubSpot().catch(console.error);
