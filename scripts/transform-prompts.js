import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../prompts/chatgpt_prompts.json');
const outputPath = path.join(__dirname, '../prompts/chatgpt_prompts_transformed.json');

// Category mapping based on keywords in the act/title
function categorizePrompt(act, prompt) {
  const text = `${act} ${prompt}`.toLowerCase();
  
  if (text.includes('programm') || text.includes('code') || text.includes('interpreter') || 
      text.includes('debug') || text.includes('terminal') || text.includes('linux') ||
      text.includes('python') || text.includes('javascript') || text.includes('php') ||
      text.includes('sql') || text.includes('developer')) {
    return 'programming';
  }
  
  if (text.includes('music') || text.includes('composer') || text.includes('song') ||
      text.includes('artist') || text.includes('rap')) {
    return 'music';
  }
  
  if (text.includes('write') || text.includes('writer') || text.includes('author') ||
      text.includes('novelist') || text.includes('essay') || text.includes('article') ||
      text.includes('journalist') || text.includes('poet') || text.includes('screenplay')) {
    return 'writing';
  }
  
  if (text.includes('business') || text.includes('startup') || text.includes('market') ||
      text.includes('salesperson') || text.includes('accountant') || text.includes('invest')) {
    return 'business';
  }
  
  if (text.includes('teach') || text.includes('tutor') || text.includes('instructor') ||
      text.includes('professor') || text.includes('academic')) {
    return 'education';
  }
  
  if (text.includes('doctor') || text.includes('medical') || text.includes('health') ||
      text.includes('dentist') || text.includes('psychologist') || text.includes('dietitian') ||
      text.includes('nutritionist')) {
    return 'healthcare';
  }
  
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || 
      text.includes('interior') || text.includes('fashion') || text.includes('graphic')) {
    return 'design';
  }
  
  if (text.includes('game') || text.includes('entertainment') || text.includes('sport') ||
      text.includes('football') || text.includes('commentator')) {
    return 'entertainment';
  }
  
  if (text.includes('legal') || text.includes('lawyer') || text.includes('law')) {
    return 'legal';
  }
  
  if (text.includes('travel') || text.includes('guide') || text.includes('tour')) {
    return 'travel';
  }
  
  if (text.includes('chef') || text.includes('food') || text.includes('recipe') ||
      text.includes('cook')) {
    return 'food';
  }
  
  if (text.includes('life coach') || text.includes('motivat') || text.includes('self-help') ||
      text.includes('mental') || text.includes('relationship')) {
    return 'lifestyle';
  }
  
  if (text.includes('prompt generator') || text.includes('midjourney') || 
      text.includes('stable diffusion')) {
    return 'ai-tools';
  }
  
  if (text.includes('history') || text.includes('historian')) {
    return 'history';
  }
  
  if (text.includes('math') || text.includes('statistic') || text.includes('calculator') ||
      text.includes('science')) {
    return 'science';
  }
  
  if (text.includes('movie') || text.includes('film') || text.includes('critic') ||
      text.includes('review')) {
    return 'media';
  }
  
  if (text.includes('language') || text.includes('translate') || text.includes('english') ||
      text.includes('pronunciat')) {
    return 'language';
  }
  
  if (text.includes('philosophy') || text.includes('philosopher') || text.includes('ethic')) {
    return 'philosophy';
  }
  
  // Default category
  return 'general';
}

try {
  const originalData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  
  const transformedData = originalData.map((item) => ({
    promptId: item.FIELD1,
    title: item.act,
    promptText: item.prompt,
    category: categorizePrompt(item.act, item.prompt),
    createdAt: '2026-03-07T00:00:00Z',
    createdBy: 'system',
  }));
  
  fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2), 'utf-8');
  
  console.log(`✅ Successfully transformed ${transformedData.length} prompts`);
  console.log(`📁 Output saved to: ${outputPath}`);
  
  // Display category breakdown
  const categoryCount = {};
  transformedData.forEach(item => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });
  
  console.log('\n📊 Category breakdown:');
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
    
} catch (error) {
  console.error('❌ Error transforming prompts:', error);
  process.exit(1);
}
