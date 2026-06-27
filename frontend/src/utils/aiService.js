/**
 * aiService.js
 * ------------------------------------------------------------------
 * Handles communicating with LLMs (Google Gemini, Anthropic Claude)
 * or simulating a response via Mock Mode when no API key is provided.
 * Supports Retrieval-Augmented Generation (RAG) by accepting retrieved
 * policy context and prompting the model to use it.
 * ------------------------------------------------------------------
 */

import { validateGrievance } from "./ragEngine";
import { USE_REMOTE, API_BASE_URL } from "../data/dataSource";

const VALID_CATEGORIES = [
  "Personal Legal Consultation",
  "Consumer Rights Assistance",
  "Will & Estate Guidance",
  "Affidavit & Notarization",
  "Attestation Support",
  "Employment Law Advisory",
  "Disciplinary Advisory",
  "Harassment & POSH Complaint",
  "Workplace Conduct Complaint",
  "Vendor & Service Complaint",
  "Anonymous Whistleblower Report"
];

const SYSTEM_PROMPT = `You are a helpful, professional AI Advocate and Intake Assistant for an internal Legal & Grievance support desk at a company.

Your capabilities:
1. Answer employee questions about company policies, notice periods, ethics, or civil consultations. Ground your responses strictly in the provided "Company Policy Context" sections. Use Markdown formatting (lists, bold text) in your replies.
2. If the user describes a grievance or issue they are facing, do NOT immediately file a case. First answer their question or explain the policy, then explicitly ask them: "Would you like me to file a formal case and assign a lawyer to assist you with this, or are you just asking about the issue?"
3. If the user responds to that question by saying "yes", "please file it", "assign a lawyer", or similar confirmation, then set "shouldFileCase" to true.
4. When confirming a case filing, explain in the "replyText" how long it typically takes to respond and other information (e.g. Critical priority cases like harassment/POSH are actioned and reviewed within 24 hours; standard cases are reviewed and assigned within 1-2 business days; you will receive a notification and can track progress under "My Cases" from the sidebar).

Valid intake categories:
${VALID_CATEGORIES.map(c => `- "${c}"`).join("\n")}

Rule for "isUserFault": Assess as true if: (a) the issue is caused by the employee's own direct policy violation, negligence, or misconduct (e.g. lost personal items, trying to hide fraud, admitting breaking rules); (b) the employee wants to cause purposeful suffering/revenge to someone else without validations/proof/evidence; (c) the provided information is admitted to be wrong/falsified.
If "isUserFault" is true, you must still respond with "shouldFileCase": true, but set the "replyText" to strictly tell them "We can't take this case." followed by the detailed reasoning why it is rejected, and do not ask to assign a lawyer. Otherwise, default to false.

You must ALWAYS respond with ONLY valid JSON in this exact structure:
{
  "replyText": "<warm, professional markdown reply to the user. Explain details, answer questions, or ask if they want to assign a lawyer. If filing, mention you are filing and display response times (24h for critical, 1-2 days for standard) and case tracking details>",
  "shouldFileCase": true | false,
  "triageData": {
    "category": "<one of the categories above, or null if shouldFileCase is false>",
    "priority": "Critical" | "High" | "Medium" | "Low",
    "isUserFault": true | false,
    "reasoning": "<1-2 sentences of internal reasoning regarding this classification>",
    "summary": "<concise 6-10 word case subject/title>"
  }
}`;

/**
 * Sends a message to the chosen AI provider or falls back to the local Mock Engine.
 */
export async function sendMessageToAi(userMessage, conversationHistory, { model = "mock", apiKey = "", retrievedContext = [], authUser = null }) {
  if (USE_REMOTE) {
    const res = await fetch(`${API_BASE_URL}/ai/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        history: conversationHistory,
        user: authUser
      })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`AI remote API error: ${res.status} ${errText}`);
    }
    const result = await res.json();
    return result.data;
  }

  const contextStr = retrievedContext.length > 0 
    ? retrievedContext.map(c => `[Policy: ${c.title}]\nCategory: ${c.category}\nContent: ${c.content}`).join("\n\n")
    : "No matching company policies found. Answer using standard, helpful guidelines, making sure to advise that a formal case can be filed if needed.";

  // 1. Handle Mock Model
  if (model === "mock" || !apiKey) {
    return simulateMockAi(userMessage, conversationHistory, retrievedContext, authUser);
  }

  // 2. Handle Google Gemini
  if (model === "gemini") {
    return callGemini(userMessage, conversationHistory, contextStr, apiKey);
  }

  // 3. Handle Anthropic Claude
  if (model === "claude") {
    return callClaude(userMessage, conversationHistory, contextStr, apiKey);
  }

  throw new Error("Unsupported model type configured.");
}

/**
 * Sends a grievance to the triage API endpoint.
 */
export async function triageGrievanceRemote(subject, description) {
  const res = await fetch(`${API_BASE_URL}/ai/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      description
    })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Triage remote API error: ${res.status} ${errText}`);
  }
  const result = await res.json();
  return result.data;
}

/**
 * Google Gemini API Handler
 */
async function callGemini(userMessage, conversationHistory, contextStr, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  // Format history
  const historyText = conversationHistory
    .map(msg => `${msg.role === "user" ? "User" : "AI"}: ${msg.text}`)
    .join("\n");

  const promptText = `Company Policy Context (RAG):\n${contextStr}\n\nConversation History:\n${historyText}\n\nUser Message:\n${userMessage}\n\nGenerate your reply strictly following the JSON format.`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ],
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => "");
    throw new Error(`Gemini API error: ${response.status} ${errorDetails}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty response from Gemini.");

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Anthropic Claude API Handler
 */
async function callClaude(userMessage, conversationHistory, contextStr, apiKey) {
  const url = "https://api.anthropic.com/v1/messages";
  
  // Convert messages to Anthropic format
  const anthropicMessages = conversationHistory
    .filter(msg => msg.role === "user" || msg.role === "bot")
    .map(msg => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.text
    }));

  // Append current user message
  anthropicMessages.push({ role: "user", content: userMessage });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "dangerouslyAllowBrowser": "true" // In client apps, anthropic client/API requires this acknowledgment if direct fetch
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: SYSTEM_PROMPT + `\n\nCompany Policy Context:\n${contextStr}`,
      messages: anthropicMessages,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => "");
    throw new Error(`Claude API error: ${response.status} ${errorDetails}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find(b => b.type === "text");
  if (!textBlock) throw new Error("Empty response from Claude.");

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Local simulation of RAG + Classification (Mock Mode)
 */
function simulateMockAi(userMessage, conversationHistory, retrievedContext, authUser) {
  const queryLower = userMessage.toLowerCase();
  const userName = authUser?.FullName?.split(" ")[0] || "there";

  // Check history to see if the user was just asked about assigning a lawyer
  const lastBotMessage = [...conversationHistory].reverse().find(msg => msg.role === "bot" || msg.role === "assistant");
  const wasAskedAboutLawyer = lastBotMessage && lastBotMessage.text.includes("Would you like me to file a formal case and assign a lawyer");

  // Helper: check if query triggers filing a case
  const isFilingRequest = 
    queryLower.includes("file") || 
    queryLower.includes("lodge") || 
    queryLower.includes("submit") || 
    queryLower.includes("report") || 
    queryLower.includes("grievance") || 
    queryLower.includes("complaint") || 
    queryLower.includes("charge sheet") || 
    queryLower.includes("harassment");

  // Determine category based on matched policy or keywords
  let category = "Employment Law Advisory";
  let priority = "Medium";
  let summary = "Grievance query for advisory";
  let isUserFault = false;
  let reasoning = "Determined via local mock RAG parser.";

  let matchedPolicy = retrievedContext[0] || null;

  if (matchedPolicy) {
    const pId = String(matchedPolicy.id);
    const pTitle = (matchedPolicy.title || "").toLowerCase();
    const pContent = (matchedPolicy.content || "").toLowerCase();

    if (pId === "policy_posh" || pId === "8" || pTitle.includes("posh") || pTitle.includes("harassment")) {
      category = "Harassment & POSH Complaint";
      priority = "Critical";
      summary = "Workplace harassment concern";
    } else if (pId === "policy_whistleblower" || pId === "11" || pTitle.includes("whistleblower")) {
      category = "Anonymous Whistleblower Report";
      priority = "High";
      summary = "Ethics violation report";
    } else if (pId === "policy_notice_period" || pId === "6" || pTitle.includes("notice") || pTitle.includes("employment")) {
      category = "Employment Law Advisory";
      priority = "High";
      summary = "Notice period / resignation dispute";
    } else if (pId === "policy_appraisal_appeal" || (pId === "9" && (pTitle.includes("appraisal") || pContent.includes("appraisal") || pContent.includes("rating") || pContent.includes("bias")))) {
      category = "Workplace Conduct Complaint";
      priority = "Medium";
      summary = "Performance rating appeal and review";
    } else if (pId === "policy_ppe_safety" || (pId === "9" && (pTitle.includes("safety") || pContent.includes("safety") || pTitle.includes("ppe") || pContent.includes("ppe") || pContent.includes("harness")))) {
      category = "Workplace Conduct Complaint";
      priority = "Critical";
      summary = "Safety hazard and PPE shortage complaint";
    } else if (pId === "policy_vendor_sla" || pId === "10" || pTitle.includes("vendor") || pTitle.includes("canteen") || pTitle.includes("transport")) {
      category = "Vendor & Service Complaint";
      priority = "Medium";
      summary = "Substandard service vendor complaint";
    } else if (pId === "policy_will_nominations" || pId === "3" || pTitle.includes("will") || pTitle.includes("nomination") || pTitle.includes("estate")) {
      category = "Will & Estate Guidance";
      priority = "Low";
      summary = "Will drafting and nomination assistance";
    } else if (pId === "policy_property_disputes" || pId === "1" || pTitle.includes("property") || pTitle.includes("civil") || pTitle.includes("boundary")) {
      category = "Personal Legal Consultation";
      priority = "Medium";
      summary = "Civil property boundary dispute consultation";
    }
  }

  // Helper to extract case description in mock mode
  const getMockCaseDescription = (history) => {
    return history
      .filter(m => m.role === "user" || m.role === "client")
      .map(m => m.text)
      .join("\n\n");
  };

  // Assess user fault and malice using the validateGrievance helper
  const fullDesc = getMockCaseDescription(conversationHistory.concat({ role: "user", text: userMessage }));
  const validation = validateGrievance(userMessage, fullDesc);
  if (validation.isInvalid) {
    isUserFault = true;
    reasoning = validation.message;
  }

  let replyText = "";
  let shouldFileCase = false;

  if (wasAskedAboutLawyer) {
    const isAffirmative = 
      queryLower === "yes" || 
      queryLower === "y" || 
      queryLower.includes("please") || 
      queryLower.includes("sure") || 
      queryLower.includes("ok") || 
      queryLower.includes("yep") || 
      queryLower.includes("do it") || 
      queryLower.includes("assign") ||
      queryLower.includes("need a lawyer") ||
      queryLower.includes("yes, please") ||
      queryLower.includes("yes i do");

    if (isAffirmative) {
      shouldFileCase = !isUserFault;
      if (isUserFault) {
        replyText = `Dear ${userName}, **we can't take this case.** ${reasoning}`;
      } else {
        replyText = `Understood. I am indexing the company policies for **${category}** to proceed with your request. I will auto-generate your case, assign a qualified advocate, and set the priority to **${priority}**. The case has been successfully filed in the system.

**Response Time & Case Information:**
* **Critical priority cases** (such as POSH/harassment or workplace safety hazards) are typically actioned and reviewed within **24 hours**.
* **Standard priority cases** are reviewed and assigned within **1-2 business days**.
* Once assigned, the lawyer will review your files and contact you directly via the case comments. You can check updates, add attachments, or chat with the advocate under **My Cases** from the sidebar.`;
      }
    } else {
      replyText = `Understood! I will not file a case or assign a lawyer. Let me know if you need any other information or want to ask another question!`;
    }
  } else {
    // If the query is an explicit request to file or is describing an issue, ask the confirmation question first
    const describesProblem = isFilingRequest || matchedPolicy || queryLower.includes("problem") || queryLower.includes("issue") || queryLower.includes("help") || queryLower.includes("dispute") || queryLower.includes("unfair");

    if (describesProblem) {
      if (isUserFault) {
        replyText = `Dear ${userName}, **we can't take this case.** ${reasoning}`;
      } else {
        let baseReply = "";
        if (matchedPolicy) {
          baseReply = `Here is what I found in our **${matchedPolicy.title}**:\n\n* ${matchedPolicy.content}\n\n`;
        } else {
          baseReply = `I can help you with matters related to company policies, notice period disputes, harassment complaints, safety hazards, and personal legal consultations. `;
        }
        
        replyText = baseReply + `Would you like me to file a formal case and assign a lawyer to assist you with this, or are you just asking about the issue?`;
      }
    } else {
      replyText = `Hello ${userName}! I'm here to assist you with company policies, notice queries, POSH, whistleblower reports, or general legal consults. 

Could you please describe what's going on or specify what policy you would like to retrieve? You can ask questions like:
- *"What is the notice period for engineers?"*
- *"Is a whistleblower report confidential?"*
- *"I need help drafting a simple will."*

If you have a concrete complaint, I can also file a case directly.`;
    }
  }

  return {
    replyText,
    shouldFileCase,
    triageData: shouldFileCase ? {
      category,
      priority,
      isUserFault,
      reasoning,
      summary: summary
    } : null
  };
}
