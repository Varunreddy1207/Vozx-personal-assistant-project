/**
 * Vercel Serverless Function: /api/chat
 */

import { generateVozxReply } from '../vozxBrain.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = (process.env.OPENAI_API_KEY || '').trim();

  // REQUIREMENT: If the API key is missing, show "AI service unavailable."
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI service unavailable.',
      code: 'missing_api_key'
    });
  }

  try {
    const { message, messages, history } = req.body || {};
    const userMessage = (message || '').trim();

    const systemPrompt = {
      role: 'system',
      content: 'You are VOZX AI, an advanced, intelligent, and visionary neural AI assistant ecosystem. You provide precise, insightful, and helpful answers across coding, research, writing, planning, and analysis. Be conversational, engaging, futuristic yet grounded. Format responses cleanly with Markdown when beneficial.'
    };

    const openaiMessages = [systemPrompt];

    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach(m => {
        if (m && m.role && m.content) openaiMessages.push({ role: m.role, content: String(m.content) });
      });
    } else if (Array.isArray(history) && history.length > 0) {
      history.forEach(h => {
        if (h && h.role && h.content) openaiMessages.push({ role: h.role, content: String(h.content) });
      });
      if (userMessage) openaiMessages.push({ role: 'user', content: userMessage });
    } else if (userMessage) {
      openaiMessages.push({ role: 'user', content: userMessage });
    } else {
      return res.status(400).json({ error: 'Please provide a message to chat with VOZX AI.' });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await openAiResponse.json();

    if (openAiResponse.ok) {
      const reply = data?.choices?.[0]?.message?.content || '';
      return res.status(200).json({
        reply: reply,
        role: 'assistant',
        model: model
      });
    } else {
      const errDetail = data?.error?.message || 'OpenAI error';
      console.error(`[OpenAI Error ${openAiResponse.status}]:`, errDetail);
      // Fallback to VOZX Autonomous Engine so user conversation never breaks
      const userName = req.body?.userName || 'Varun';
      const vozxReply = generateVozxReply(userMessage, history || rawMessages, userName);
      return res.status(200).json({
        reply: vozxReply,
        role: 'assistant',
        model: 'vozx-neural-engine',
        source: 'vozx-autonomous',
        fallback: true,
        api_error: errDetail
      });
    }
  } catch (error) {
    console.error('Server error, falling back to VOZX Engine:', error);
    const vozxReply = generateVozxReply(req.body?.message || '', [], 'Varun');
    return res.status(200).json({
      reply: vozxReply,
      role: 'assistant',
      model: 'vozx-neural-engine',
      source: 'vozx-autonomous',
      fallback: true
    });
  }
}

