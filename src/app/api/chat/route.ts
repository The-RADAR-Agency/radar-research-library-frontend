import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, userId } = await req.json();

    if (!message || !userId) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ 
          user_id: userId,
          title: message.slice(0, 100) // Use first 100 chars as title
        })
        .select()
        .single();

      if (convError) throw convError;
      convId = newConv.id;
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        role: 'user',
        content: message,
      });

    if (userMsgError) throw userMsgError;

    // Search research library for relevant content
    const relevantContext = await searchResearchLibrary(message, userId);

    // Build system prompt with research context
    const systemPrompt = buildSystemPrompt(relevantContext);

    // Get conversation history
    const { data: previousMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(10); // Last 10 messages for context

    // Build messages array for Claude
    const messages = [
      ...(previousMessages || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
    });

    // Create readable stream for response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && 
                chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                text,
                conversationId: convId 
              })}\n\n`));
            }
          }

          // Save assistant response
          await supabase
            .from('messages')
            .insert({
              conversation_id: convId,
              role: 'assistant',
              content: fullResponse,
            });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }), 
      { status: 500 }
    );
  }
}

async function searchResearchLibrary(query: string, userId: string) {
  // Search across drivers, trends, signals with their taxonomy
  
  // Search drivers with full taxonomy
  const { data: drivers } = await supabase
    .from('drivers')
    .select(`
      id,
      driver_name,
      description,
      source_documents!drivers_extracted_from_fkey (
        id,
        title,
        visibility,
        uploaded_by,
        visible_to
      ),
      drivers_steep_categories (
        steep_categories (name)
      ),
      drivers_hubspot_industries (
        industries (industry_name)
      ),
      drivers_categories (
        categories (category_name)
      ),
      drivers_topics (
        topics (topic_name)
      ),
      drivers_geographical_focus (
        geographical_focus (region_name)
      )
    `)
    .or(`driver_name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(5);

  // Search trends with full taxonomy
  const { data: trends } = await supabase
    .from('trends')
    .select(`
      id,
      trend_name,
      description,
      source_documents!trends_extracted_from_fkey (
        id,
        title,
        visibility,
        uploaded_by,
        visible_to
      ),
      trends_steep_categories (
        steep_categories (name)
      ),
      trends_hubspot_industries (
        industries (industry_name)
      ),
      trends_categories (
        categories (category_name)
      ),
      trends_topics (
        topics (topic_name)
      ),
      trends_geographical_focus (
        geographical_focus (region_name)
      )
    `)
    .or(`trend_name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(5);

  // Search signals with full taxonomy
  const { data: signals } = await supabase
    .from('signals')
    .select(`
      id,
      signal_title,
      description,
      source_documents!signals_extracted_from_fkey (
        id,
        title,
        visibility,
        uploaded_by,
        visible_to
      ),
      signals_steep_categories (
        steep_categories (name)
      ),
      signals_hubspot_industries (
        industries (industry_name)
      ),
      signals_categories (
        categories (category_name)
      ),
      signals_topics (
        topics (topic_name)
      ),
      signals_geographical_focus (
        geographical_focus (region_name)
      )
    `)
    .or(`signal_title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(5);

  // Filter by visibility
  const filterByVisibility = (items: any[]) => {
    return items?.filter(item => {
      const doc = item.source_documents;
      if (!doc) return false;
      
      if (doc.visibility === 'public' || doc.visibility === 'radar_members') return true;
      if (doc.visibility === 'just_me' && doc.uploaded_by === userId) return true;
      if (doc.visibility === 'select_users' && doc.visible_to?.includes(userId)) return true;
      
      return false;
    }) || [];
  };

  return {
    drivers: filterByVisibility(drivers || []),
    trends: filterByVisibility(trends || []),
    signals: filterByVisibility(signals || []),
  };
}

function buildSystemPrompt(context: any) {
  const { drivers, trends, signals } = context;

  let prompt = `You are a futures research assistant for RADAR Agency. You help researchers analyze and understand strategic foresight research using the Making Futures methodology.

## RADAR Research Library Structure

The research library organizes futures research into four interconnected types:

1. **Drivers**: Root causes and underlying forces shaping change
2. **Trends**: Patterns and trajectories emerging from drivers
3. **Signals**: Observable events and early indicators of trends
4. **Evidence**: Supporting data, statistics, and concrete examples

Each piece of research is categorized using multiple taxonomies:
- **STEEP Categories**: Social, Technological, Economic, Environmental, Political
- **Industries**: Specific industry sectors affected
- **Categories**: Broader thematic groupings
- **Topics**: Specific subject areas and themes
- **Geographical Focus**: Regional and global contexts

These research items are interconnected - drivers influence trends, trends are evidenced by signals, and all are supported by evidence. Understanding these relationships is key to strategic foresight analysis.

## Your Role

When answering questions:
1. **Prioritize the research library**: Use the specific research provided below as your primary source
2. **Show relationships**: Explain how drivers, trends, and signals connect to each other
3. **Reference taxonomy**: Mention relevant STEEP categories, industries, topics, regions when useful
4. **Contextualize**: Use your broader knowledge to explain and contextualize the research
5. **Be specific**: Cite specific research items by name when referencing them
6. **Acknowledge gaps**: If the library doesn't have relevant research, say so clearly

`;

  if (drivers.length > 0) {
    prompt += `\n## Relevant Drivers from Research Library:\n`;
    drivers.forEach((d: any) => {
      const steep = d.drivers_steep_categories?.map((s: any) => s.steep_categories?.name).filter(Boolean) || [];
      const industries = d.drivers_hubspot_industries?.map((i: any) => i.industries?.industry_name).filter(Boolean) || [];
      const categories = d.drivers_categories?.map((c: any) => c.categories?.category_name).filter(Boolean) || [];
      const topics = d.drivers_topics?.map((t: any) => t.topics?.topic_name).filter(Boolean) || [];
      const regions = d.drivers_geographical_focus?.map((g: any) => g.geographical_focus?.region_name).filter(Boolean) || [];
      
      prompt += `\n**${d.driver_name}**\n`;
      prompt += `${d.description}\n`;
      if (steep.length) prompt += `STEEP: ${steep.join(', ')}\n`;
      if (categories.length) prompt += `Categories: ${categories.join(', ')}\n`;
      if (topics.length) prompt += `Topics: ${topics.join(', ')}\n`;
      if (industries.length) prompt += `Industries: ${industries.join(', ')}\n`;
      if (regions.length) prompt += `Geography: ${regions.join(', ')}\n`;
    });
  }

  if (trends.length > 0) {
    prompt += `\n## Relevant Trends from Research Library:\n`;
    trends.forEach((t: any) => {
      const steep = t.trends_steep_categories?.map((s: any) => s.steep_categories?.name).filter(Boolean) || [];
      const industries = t.trends_hubspot_industries?.map((i: any) => i.industries?.industry_name).filter(Boolean) || [];
      const categories = t.trends_categories?.map((c: any) => c.categories?.category_name).filter(Boolean) || [];
      const topics = t.trends_topics?.map((top: any) => top.topics?.topic_name).filter(Boolean) || [];
      const regions = t.trends_geographical_focus?.map((g: any) => g.geographical_focus?.region_name).filter(Boolean) || [];
      
      prompt += `\n**${t.trend_name}**\n`;
      prompt += `${t.description}\n`;
      if (steep.length) prompt += `STEEP: ${steep.join(', ')}\n`;
      if (categories.length) prompt += `Categories: ${categories.join(', ')}\n`;
      if (topics.length) prompt += `Topics: ${topics.join(', ')}\n`;
      if (industries.length) prompt += `Industries: ${industries.join(', ')}\n`;
      if (regions.length) prompt += `Geography: ${regions.join(', ')}\n`;
    });
  }

  if (signals.length > 0) {
    prompt += `\n## Relevant Signals from Research Library:\n`;
    signals.forEach((s: any) => {
      const steep = s.signals_steep_categories?.map((sc: any) => sc.steep_categories?.name).filter(Boolean) || [];
      const industries = s.signals_hubspot_industries?.map((i: any) => i.industries?.industry_name).filter(Boolean) || [];
      const categories = s.signals_categories?.map((c: any) => c.categories?.category_name).filter(Boolean) || [];
      const topics = s.signals_topics?.map((t: any) => t.topics?.topic_name).filter(Boolean) || [];
      const regions = s.signals_geographical_focus?.map((g: any) => g.geographical_focus?.region_name).filter(Boolean) || [];
      
      prompt += `\n**${s.signal_title}**\n`;
      prompt += `${s.description}\n`;
      if (steep.length) prompt += `STEEP: ${steep.join(', ')}\n`;
      if (categories.length) prompt += `Categories: ${categories.join(', ')}\n`;
      if (topics.length) prompt += `Topics: ${topics.join(', ')}\n`;
      if (industries.length) prompt += `Industries: ${industries.join(', ')}\n`;
      if (regions.length) prompt += `Geography: ${regions.join(', ')}\n`;
    });
  }

  if (drivers.length === 0 && trends.length === 0 && signals.length === 0) {
    prompt += `\n## No Directly Relevant Research Found

The research library doesn't contain items that directly match this query. You can still use your general knowledge to help, but please note that you're not drawing from the RADAR research library for this response.`;
  }

  return prompt;
}
