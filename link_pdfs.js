const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dvqoosxfycgggduoeeip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cW9vc3hmeWNnZ2dkdW9lZWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2ODAxNiwiZXhwIjoyMDgxNzQ0MDE2fQ.Dsxfav6qXfyBqMRF1_pwPz5m8aD5FD9-iGlj-hHWEjw'
);

async function linkPDFs() {
  console.log('\n📎 LINKING PDF FILES TO SOURCE DOCUMENTS\n');

  const { data: files } = await supabase.storage.from('trend-reports').list();
  console.log(`✅ Found ${files.length} files in bucket`);

  const { data: docs } = await supabase.from('source_documents').select('id, title, file_name');
  console.log(`✅ Found ${docs.length} source documents\n`);

  for (const file of files) {
    let matchedDoc = docs.find(d => d.file_name === file.name);
    
    if (!matchedDoc) {
      const fileNameLower = file.name.toLowerCase().replace(/\.pdf$/i, '');
      matchedDoc = docs.find(d => {
        const titleLower = d.title.toLowerCase();
        return titleLower.includes(fileNameLower) || fileNameLower.includes(titleLower);
      });
    }

    if (matchedDoc) {
      const fileUrl = `trend-reports/${file.name}`;
      await supabase.from('source_documents').update({ 
        file_url: fileUrl,
        file_name: file.name 
      }).eq('id', matchedDoc.id);
      
      console.log(`✅ Linked "${file.name}" → "${matchedDoc.title}"`);
    } else {
      console.log(`⚠️  No match found for "${file.name}"`);
    }
  }
  
  console.log('\n✅ PDF LINKING COMPLETE!\n');
}

linkPDFs().catch(console.error);
