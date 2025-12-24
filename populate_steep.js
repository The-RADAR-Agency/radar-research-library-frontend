const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dvqoosxfycgggduoeeip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cW9vc3hmeWNnZ2dkdW9lZWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2ODAxNiwiZXhwIjoyMDgxNzQ0MDE2fQ.Dsxfav6qXfyBqMRF1_pwPz5m8aD5FD9-iGlj-hHWEjw'
);

async function populateSteep() {
  console.log('\n🎯 POPULATING STEEP CATEGORIES\n');

  // Get all STEEP categories
  const { data: steepCats } = await supabase.from('steep_categories').select('*');
  console.log(`✅ Found ${steepCats.length} STEEP categories`);
  steepCats.forEach(cat => console.log(`   - ${cat.name}`));

  // Randomly assign STEEP to drivers (1-3 categories per driver)
  console.log('\n📊 DRIVERS:');
  const { data: drivers } = await supabase.from('drivers').select('id, driver_name');
  console.log(`   Found ${drivers.length} drivers`);
  
  for (const driver of drivers) {
    const numCategories = Math.floor(Math.random() * 3) + 1; // 1-3 categories
    const selectedSteep = [];
    const availableSteep = [...steepCats];
    
    for (let i = 0; i < numCategories; i++) {
      const randomIndex = Math.floor(Math.random() * availableSteep.length);
      selectedSteep.push(availableSteep.splice(randomIndex, 1)[0]);
    }
    
    // Insert into junction table
    const junctionRecords = selectedSteep.map(steep => ({
      driver_id: driver.id,
      steep_category_id: steep.id
    }));
    
    const { error } = await supabase
      .from('drivers_steep_categories')
      .insert(junctionRecords);
    
    if (error) {
      console.log(`   ❌ Error for "${driver.driver_name}": ${error.message}`);
    } else {
      console.log(`   ✅ "${driver.driver_name}" → ${selectedSteep.map(s => s.name).join(', ')}`);
    }
  }

  // Randomly assign STEEP to trends
  console.log('\n📈 TRENDS:');
  const { data: trends } = await supabase.from('trends').select('id, trend_name');
  console.log(`   Found ${trends.length} trends`);
  
  for (const trend of trends) {
    const numCategories = Math.floor(Math.random() * 3) + 1;
    const selectedSteep = [];
    const availableSteep = [...steepCats];
    
    for (let i = 0; i < numCategories; i++) {
      const randomIndex = Math.floor(Math.random() * availableSteep.length);
      selectedSteep.push(availableSteep.splice(randomIndex, 1)[0]);
    }
    
    const junctionRecords = selectedSteep.map(steep => ({
      trend_id: trend.id,
      steep_category_id: steep.id
    }));
    
    const { error } = await supabase
      .from('trends_steep_categories')
      .insert(junctionRecords);
    
    if (error) {
      console.log(`   ❌ Error for "${trend.trend_name}": ${error.message}`);
    } else {
      console.log(`   ✅ "${trend.trend_name}" → ${selectedSteep.map(s => s.name).join(', ')}`);
    }
  }

  // Randomly assign STEEP to signals
  console.log('\n📡 SIGNALS:');
  const { data: signals } = await supabase.from('signals').select('id, signal_name');
  console.log(`   Found ${signals.length} signals`);
  
  for (const signal of signals) {
    const numCategories = Math.floor(Math.random() * 3) + 1;
    const selectedSteep = [];
    const availableSteep = [...steepCats];
    
    for (let i = 0; i < numCategories; i++) {
      const randomIndex = Math.floor(Math.random() * availableSteep.length);
      selectedSteep.push(availableSteep.splice(randomIndex, 1)[0]);
    }
    
    const junctionRecords = selectedSteep.map(steep => ({
      signal_id: signal.id,
      steep_category_id: steep.id
    }));
    
    const { error } = await supabase
      .from('signals_steep_categories')
      .insert(junctionRecords);
    
    if (error) {
      console.log(`   ❌ Error for "${signal.signal_name}": ${error.message}`);
    } else {
      console.log(`   ✅ "${signal.signal_name}" → ${selectedSteep.map(s => s.name).join(', ')}`);
    }
  }

  console.log('\n✅ STEEP POPULATION COMPLETE!\n');
}

populateSteep().catch(console.error);
