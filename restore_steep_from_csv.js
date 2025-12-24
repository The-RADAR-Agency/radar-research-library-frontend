const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://dvqoosxfycgggduoeeip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cW9vc3hmeWNnZ2dkdW9lZWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2ODAxNiwiZXhwIjoyMDgxNzQ0MDE2fQ.Dsxfav6qXfyBqMRF1_pwPz5m8aD5FD9-iGlj-hHWEjw'
);

const csvData = {
  Social: {
    drivers: ['Consumer Expectation Evolution', 'Demographic Transition and Aging Populations', 'Evolving Human Connection Needs'],
    trends: ['Human-Centric AI Implementation', 'Fan-to-Creator Pipeline Acceleration', 'Cultural Moment Amplification Through Fan Participation'],
    signals: ['Consumer AI Favorability Increase', 'Personal AI Assistant Integration Demand', 'Fan Content Surpassing Original Material Viewership', 'Rapid Fandom Formation Around New Properties']
  },
  Technological: {
    drivers: ['AI Technology Maturation', 'Artificial Intelligence Revolution', 'Technological Democratization of Content Creation'],
    trends: ['Autonomous Service Model Adoption', 'Assistant-First Experience Design', 'Voice AI Revolution in Customer Service', 'AI Commercialization and Market Expansion'],
    signals: ['Shadow AI Usage Surge', 'AI Agent Effectiveness Gap', 'Big Tech AI Capital Expenditure Surge']
  },
  Economic: {
    drivers: ['Competitive Market Pressure', 'Central Bank Rate Cutting Cycle', 'Creator Economy Monetization Opportunities'],
    trends: ['AI-Driven Personalization as Loyalty Driver', 'Global Monetary Policy Normalization', 'US Dollar Overextension and Rebalancing', 'Roaring 20s Market Resilience and Growth', 'Brand-Fan Collaboration Integration'],
    signals: ['Federal Reserve Rate Cut Implementation', 'Gold Price Record Highs', 'S&P 500 Performance Despite Challenges', 'Brand Integration with Fan Culture']
  },
  Environmental: {
    drivers: ['Rising Electricity Demand and Decarbonization'],
    trends: ['Electrification and Power Infrastructure Revolution'],
    signals: ['Data Center Energy Consumption Explosion']
  },
  Political: {
    drivers: ['US Political and Policy Changes'],
    trends: [],
    signals: []
  }
};

async function restoreSteep() {
  console.log('\n🔄 RESTORING STEEP CLASSIFICATIONS FROM CSV BACKUP\n');

  // Get all STEEP categories
  const { data: steepCategories } = await supabase.from('steep_categories').select('*');
  const steepMap = {};
  steepCategories.forEach(cat => {
    steepMap[cat.name] = cat.id;
  });

  // Get all entities
  const { data: drivers } = await supabase.from('drivers').select('id, driver_name');
  const { data: trends } = await supabase.from('trends').select('id, trend_name');
  const { data: signals } = await supabase.from('signals').select('id, signal_name');

  // Create lookup maps
  const driverMap = {};
  drivers.forEach(d => { driverMap[d.driver_name] = d.id; });
  
  const trendMap = {};
  trends.forEach(t => { trendMap[t.trend_name] = t.id; });
  
  const signalMap = {};
  signals.forEach(s => { signalMap[s.signal_name] = s.id; });

  let totalRestored = 0;

  // Restore each STEEP category
  for (const [steepName, entities] of Object.entries(csvData)) {
    const steepId = steepMap[steepName];
    
    if (!steepId) {
      console.log(`⚠️  STEEP category "${steepName}" not found in database`);
      continue;
    }

    console.log(`\n📊 ${steepName}:`);

    // Restore drivers
    for (const driverName of entities.drivers) {
      const driverId = driverMap[driverName];
      if (driverId) {
        await supabase.from('drivers_steep_categories').insert({
          driver_id: driverId,
          steep_category_id: steepId
        });
        console.log(`   ✅ Driver: ${driverName}`);
        totalRestored++;
      } else {
        console.log(`   ⚠️  Driver not found: ${driverName}`);
      }
    }

    // Restore trends
    for (const trendName of entities.trends) {
      const trendId = trendMap[trendName];
      if (trendId) {
        await supabase.from('trends_steep_categories').insert({
          trend_id: trendId,
          steep_category_id: steepId
        });
        console.log(`   ✅ Trend: ${trendName}`);
        totalRestored++;
      } else {
        console.log(`   ⚠️  Trend not found: ${trendName}`);
      }
    }

    // Restore signals
    for (const signalName of entities.signals) {
      const signalId = signalMap[signalName];
      if (signalId) {
        await supabase.from('signals_steep_categories').insert({
          signal_id: signalId,
          steep_category_id: steepId
        });
        console.log(`   ✅ Signal: ${signalName}`);
        totalRestored++;
      } else {
        console.log(`   ⚠️  Signal not found: ${signalName}`);
      }
    }
  }

  console.log(`\n✅ RESTORATION COMPLETE - ${totalRestored} classifications restored!\n`);
}

restoreSteep().catch(console.error);
