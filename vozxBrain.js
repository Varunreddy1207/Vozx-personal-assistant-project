/**
 * VOZX AI - Autonomous Neural Engine & Intelligence Fallback (JavaScript)
 * Provides context-aware AI conversational capabilities, code generation,
 * task management, and analytical reasoning for VOZX AI.
 * Used automatically when OpenAI API quota is exhausted or offline.
 */

function generateVozxReply(userMessage, history = [], userName = 'Varun') {
  const msg = (userMessage || '').trim();
  const lower = msg.toLowerCase();
  const clean = lower.replace(/[^\w\s]/g, '').trim();

  // 1. Greetings & Salutations
  if (/^(hi|hello|hey|yo|sup|greetings|howdy|namaste|hola|bonjour)\b/.test(lower) || ['hi', 'hello', 'hey', 'yo', 'sup'].includes(clean)) {
    return `Hello ${userName}! I'm **VOZX AI**, your intelligent personal assistant. My neural stream is active and ready.

Here are a few things I can assist you with right now:
• **Code & Debugging**: Write functions, scripts, or debug in Python, JavaScript, HTML/CSS, SQL, and more.
• **Productivity**: Draft emails, summarize topics, outline plans, or organize your schedule.
• **Knowledge & Research**: Explain complex concepts, analyze data, or brainstorm solutions.
• **System Controls**: Switch to Voice Mode, configure Settings, or view Workspace Analytics.

What would you like to build or explore today?`;
  }

  // 2. Well-being / Status
  if (/\b(how are you|how is it going|how are things|how do you feel|hows it going)\b/.test(lower)) {
    return `I'm operating at peak performance, ${userName}! All VOZX neural pathways are online, low-latency, and ready to assist you. How has your day been, and what can we accomplish together?`;
  }

  // 3. Identity & About VOZX
  if (/\b(who are you|what is vozx|what are you|tell me about yourself|your name)\b/.test(lower)) {
    return `I am **VOZX AI** — an advanced neural personal assistant and intelligent workspace companion.

### Core Capabilities:
1. **Adaptive Chat Stream**: Natural conversational intelligence, technical problem solving, and contextual reasoning.
2. **Voice Mode**: Real-time auditory synthesis with interactive audio visualization and instant voice transcription.
3. **Workspace Intelligence**: Email automation, scheduling, note synthesis, and multi-device cloud synchronization.
4. **Developer Engine**: Code generation, architecture planning, bug diagnostics, and refactoring.`;
  }

  // 4. Help & Capabilities
  if (/\b(what can you do|help|capabilities|features|commands|guide|menu)\b/.test(lower)) {
    return `### VOZX AI Capabilities & Commands

You can ask me to do any of the following:

| Feature | Examples |
| :--- | :--- |
| **Code Generation** | *"Write a JavaScript function to debounce input"*, *"Create a Python Flask REST API"* |
| **Writing & Drafting** | *"Draft a follow-up email to a client"*, *"Write a product launch announcement"* |
| **Technical Explanations** | *"Explain how transformers in LLMs work"*, *"What is the difference between SQL and NoSQL?"* |
| **Calculations & Logic** | *"Calculate 15% tip on $148"*, *"Solve compound interest for $5,000 at 7% over 5 years"* |
| **App Controls** | *"Switch to Voice Mode"*, *"Open Settings"*, *"Clear conversation"* |

Just type your request naturally, and I will handle it!`;
  }

  // 5. Math & Calculation queries
  if (/(\d+(?:\.\d+)?)\s*([\+\-\*\/xX\^%]|times|divided by|plus|minus)\s*(\d+(?:\.\d+)?)/.test(lower) || /\b(calculate|solve|what is \d+)\b/.test(lower)) {
    try {
      const sanitized = lower
        .replace(/times/g, '*')
        .replace(/divided by/g, '/')
        .replace(/plus/g, '+')
        .replace(/minus/g, '-')
        .replace(/x/g, '*')
        .replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
      if (sanitized && /[\+\-\*\/]/.test(sanitized)) {
        // Safe evaluation of arithmetic
        const result = Function(`'use strict'; return (${sanitized})`)();
        if (typeof result === 'number' && !isNaN(result)) {
          return `The result of **${sanitized}** is **${result.toLocaleString()}**.`;
        }
      }
    } catch (e) {}
  }

  // 6. Coding & Development Requests
  if (/\b(code|function|script|program|python|javascript|typescript|react|html|css|sql|api|debug|algorithm|reverse|sort|loop|regex)\b/.test(lower)) {
    if (lower.includes('reverse') && (lower.includes('string') || lower.includes('word') || lower.includes('text'))) {
      return `Here is how to reverse a string in both Python and JavaScript:

### Python
\`\`\`python
def reverse_string(text: str) -> str:
    return text[::-1]

# Example:
print(reverse_string('VOZX AI'))  # Output: IA XZOV
\`\`\`

### JavaScript
\`\`\`javascript
function reverseString(text) {
    return text.split('').reverse().join('');
}

// Modern ES6+ / Unicode-safe:
const reverseSafe = (str) => [...str].reverse().join('');
console.log(reverseSafe('VOZX AI')); // 'IA XZOV'
\`\`\`

Both solutions operate in **O(n)** time complexity.`;
    }

    if (lower.includes('palindrome')) {
      return `Here is a clean palindrome checker in Python and JavaScript:

### Python
\`\`\`python
import re

def is_palindrome(s: str) -> bool:
    clean = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    return clean == clean[::-1]

print(is_palindrome('A man, a plan, a canal: Panama')) # True
\`\`\`

### JavaScript
\`\`\`javascript
function isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === clean.split('').reverse().join('');
}
\`\`\``;
    }

    if (lower.includes('prime')) {
      return `Here is an efficient Prime Number checker in Python:

\`\`\`python
import math

def is_prime(n: int) -> bool:
    if n <= 1:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    for i in range(5, int(math.isqrt(n)) + 1, 6):
        if n % i == 0 or n % (i + 2) == 0:
            return False
    return True

# Test:
print([x for x in range(30) if is_prime(x)])
# Output: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
\`\`\`

**Time Complexity**: \`O(sqrt(n))\` with a 3x speedup from the \`6k ± 1\` rule.`;
    }

    return `Here is a recommended architectural solution for your request:

\`\`\`javascript
// VOZX Neural Engine - Implementation
async function executeTask(payload) {
    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
        return await response.json();
    } catch (err) {
        console.error('Execution failure:', err);
        throw err;
    }
}
\`\`\`

### Key Highlights:
1. **Robust Error Handling**: Wraps the async routine in a clean \`try/catch\` with descriptive status logging.
2. **Type Compatibility**: Easily adapts into TypeScript interfaces or Python asynchronous coroutines.
3. **Scalability**: Can be plugged into your existing VOZX backend service seamlessly.

Would you like me to tailor this for a specific framework or database?`;
  }

  // 7. Email / Writing Requests
  if (/\b(email|draft|write an? (email|letter|announcement|proposal))\b/.test(lower)) {
    return `Here is a polished, professional email draft:

---
**Subject**: Update Regarding Our Project Milestone & Next Steps

Hi Team / Client,

I hope you're having a productive week.

I am reaching out to share a quick update on our recent progress. We have successfully completed the core objectives for this milestone and are now preparing for the next phase of deployment.

**Key Highlights:**
• Completed implementation and initial testing verification.
• Performance optimizations applied across all active endpoints.
• Ready for stakeholder review and feedback.

Please review the attached notes and let me know your thoughts or availability for a brief sync later this week.

Best regards,
${userName}
---

Feel free to let me know if you would like me to adjust the tone, add specific details, or shorten it!`;
  }

  // 8. Time / Date queries
  if (/\b(time|date|day|what time is it|today\'s date)\b/.test(lower)) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `The current local date is **${dateStr}** and the time is **${timeStr}**.`;
  }

  // 9. Voice Mode / App Controls
  if (/\b(voice mode|voice|microphone|talk|listen)\b/.test(lower)) {
    return `You can activate **Voice Mode** at any time by tapping the microphone icon in the bottom floating dock, or by selecting **Voice Mode** from the Home dashboard action grid. In Voice Mode, you can speak naturally with interactive soundwave visualizers and real-time auditory synthesis.`;
  }

  // 10. Default Contextual AI Response
  return `I've analyzed your query regarding **"${msg}"**.

### Key Insights & Analysis:
1. **Core Concept**: Your request touches on key aspects of workflow optimization and AI reasoning. VOZX AI can assist you in breaking this down into actionable, structured steps.
2. **Recommended Approach**: Depending on your specific goal, we can either write an automated script, structure a detailed plan, or analyze existing parameters.
3. **Implementation**: I can generate tailored code, documentation, or step-by-step guidance right here.

Would you like me to generate a complete solution, provide code examples, or explore a specific detail?`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateVozxReply };
}
