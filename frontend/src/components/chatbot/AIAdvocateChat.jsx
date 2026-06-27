import React, { useState, useContext, useRef, useEffect } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import { CATEGORY_TO_ROLE_PREFERENCE, getCategoryIcon } from "../../utils/categoryMeta";
import { searchPolicies, validateGrievance } from "../../utils/ragEngine";
import { sendMessageToAi } from "../../utils/aiService";

/**
 * Helper: Extracts actual case description from user message history by ignoring short confirmation messages.
 */
const getCaseDescription = (messages) => {
  const isConfirmation = (text) => {
    const t = text.trim().toLowerCase();
    return (
      t === "yes" ||
      t === "y" ||
      t === "please" ||
      t === "sure" ||
      t === "ok" ||
      t === "yep" ||
      t === "do it" ||
      t === "assign" ||
      t === "yes, please" ||
      t === "yes i do"
    );
  };
  
  const relevantUserMessages = messages
    .filter(m => m.role === "user" && !isConfirmation(m.text))
    .map(m => m.text);
    
  if (relevantUserMessages.length > 0) {
    return relevantUserMessages.join("\n\n");
  }
  return "Filed via AI Advocate Chatbot";
};

/**
 * Helper: simple Markdown-to-HTML parser for bullet lists and bold text
 */
const parseMarkdown = (text) => {
  if (!text) return "";
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Format bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Format bullet lists
  const lines = formatted.split("\n");
  let inList = false;
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("* ")) {
      const content = trimmed.substring(2);
      if (!inList) {
        inList = true;
        return `<ul style="margin: 4px 0; padding-left: 20px;"><li>${content}</li>`;
      }
      return `<li>${content}</li>`;
    } else {
      if (inList) {
        inList = false;
        return `</ul>${line}<br />`;
      }
      return line + "<br />";
    }
  });
  if (inList) {
    processed.push("</ul>");
  }
  return processed.join("");
};

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, padding: "10px 4px" }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#94A3B8",
          animation: `bounceDot 1.2s ${i * 0.15}s infinite ease-in-out`,
        }}
      />
    ))}
    <style>{`
      @keyframes bounceDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
);

const AIAdvocateChat = ({ onClose, onCaseCreated }) => {
  const { categories, officials, cases, assignments, fileCaseWithAdvocate } = useContext(GrievanceContext);
  const { authUser } = useAuth();

  // Load settings from localStorage
  const [model, setModel] = useState(() => localStorage.getItem("ai_model") || "mock");
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [claudeKey, setClaudeKey] = useState(() => localStorage.getItem("claude_api_key") || "");
  
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: `Hi ${authUser?.FullName?.split(" ")[0] || "there"} 👋 I'm your AI Advocate & Policy Guide. Ask me anything about our company guidelines (POSH, notice periods, safety, appraisals, estate planning) or describe an issue you are facing. 

I can retrieve policy segments to answer your questions and automatically draft a formal grievance case if needed.`,
    },
  ]);
  
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [filedCaseId, setFiledCaseId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // Save settings helpers
  const saveSettings = (selectedModel, gKey, cKey) => {
    setModel(selectedModel);
    setGeminiKey(gKey);
    setClaudeKey(cKey);
    localStorage.setItem("ai_model", selectedModel);
    localStorage.setItem("gemini_api_key", gKey);
    localStorage.setItem("claude_api_key", cKey);
    setShowSettings(false);
  };

  const getActiveKey = (tgtModel) => {
    if (tgtModel === "gemini") return geminiKey;
    if (tgtModel === "claude") return claudeKey;
    return "";
  };

  // Live load balancing for advocate picking
  const assignmentLoad = (advocateUserId) => {
    return assignments.filter((a) => {
      if (a.AssignedToUserID !== advocateUserId) return false;
      const relatedCase = cases.find((c) => c.CaseID === a.CaseID);
      return relatedCase && relatedCase.Status !== "Closed";
    }).length;
  };

  const pickAdvocate = (categoryName) => {
    const cat = categories.find((c) => c.CategoryName === categoryName);
    if (!cat) return null;
    const preferredRoles = CATEGORY_TO_ROLE_PREFERENCE[cat.CategoryID] || [3];

    // Gather all active candidates from any preferred roles
    const candidates = officials.filter(
      (o) => preferredRoles.includes(o.RoleID) && o.Status === "Active"
    );

    if (!candidates.length) return null;

    // Helper to calculate specialization match score
    const getSpecMatchScore = (official) => {
      if (!official.Specialization) return 0;
      const specWords = official.Specialization.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
      const catWords = (cat.CategoryName + " " + (cat.Description || "")).toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
      
      // Count matching non-trivial words (length > 2)
      let matches = 0;
      specWords.forEach(w => {
        if (w.length > 2 && catWords.includes(w)) {
          matches += 1;
        }
      });
      return matches;
    };

    // Sort candidates:
    // 1. Highest specialization match score (relevance)
    // 2. Lowest current active case load (availability)
    const sorted = [...candidates].sort((a, b) => {
      const scoreA = getSpecMatchScore(a);
      const scoreB = getSpecMatchScore(b);
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Descending matches (higher score first)
      }
      return assignmentLoad(a.OfficialID) - assignmentLoad(b.OfficialID); // Ascending load (lower load first)
    });

    return sorted[0];
  };


  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking || resolved) return;

    // Append user message
    const newMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(newMessages);
    setInput("");
    setIsThinking(true);

    try {
      // 1. Map categories to policies list dynamically (avoids static JSON file reads)
      const policiesData = categories.map(c => ({
        id: c.CategoryID,
        title: c.CategoryName,
        content: c.Description || "",
        category: c.CategoryName
      }));

      // 2. Perform Local RAG retrieval
      const matchedPolicies = searchPolicies(trimmed, policiesData, 2);

      // 2. Fetch AI Response
      const activeKey = getActiveKey(model);
      
      // format history for backend API
      const conversationHistory = newMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const responseJson = await sendMessageToAi(trimmed, conversationHistory, {
        model,
        apiKey: activeKey,
        retrievedContext: matchedPolicies,
        authUser
      });

      // 3. Process AI Response
      const caseDesc = getCaseDescription(newMessages);
      const localVal = validateGrievance(responseJson.triageData?.summary, caseDesc);
      
      const isInvalid = localVal.isInvalid || responseJson.triageData?.isUserFault;
      const rejectionReason = localVal.isInvalid ? localVal.message : (responseJson.triageData?.reasoning || "Admitted user fault or policy violation.");

      if (isInvalid) {
        const replyText = `Dear ${authUser?.FullName?.split(" ")[0] || "there"}, **we can't take this case.** ${rejectionReason}`;
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: replyText,
            meta: { type: "rejected", reasoning: rejectionReason },
            sources: matchedPolicies
          },
        ]);
        setResolved(true);
        // Automatically close/end the chat after 5 seconds to let the user read the message
        setTimeout(() => {
          onClose();
        }, 5000);
        return;
      }

      if (responseJson.shouldFileCase && responseJson.triageData) {
        const tData = responseJson.triageData;
        // File Case in context
        const advocate = pickAdvocate(tData.category);
        const category = categories.find((c) => c.CategoryName === tData.category);
        const triageNote = `🤖 AI Triage: Classified as "${tData.category}" with ${tData.priority} priority. ${tData.reasoning}`;

        const newCaseId = await fileCaseWithAdvocate({
          subject: tData.summary,
          categoryId: category?.CategoryID || 1,
          priority: tData.priority,
          description: caseDesc,
          userId: authUser?.UserID,
          advocateUserId: advocate?.OfficialID || null,
          triageNote,
        });

        setFiledCaseId(newCaseId);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: responseJson.replyText,
            meta: {
              type: "assigned",
              caseId: newCaseId,
              categoryId: category?.CategoryID,
              category: tData.category,
              priority: tData.priority,
              advocate,
            },
            sources: matchedPolicies
          },
        ]);
        setResolved(true);
        if (onCaseCreated) onCaseCreated(newCaseId);
      } else {
        // Normal conversational reply
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: responseJson.replyText,
            sources: matchedPolicies
          }
        ]);
      }
    } catch (err) {
      console.error("AI Assistant error: ", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I encountered an error communicating with the AI. Please verify your API Key in the settings (gear icon) or try Mock Mode.",
          meta: { type: "error" },
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "bot",
        text: "Let's start fresh. Describe any query or request a formal case filing.",
      },
    ]);
    setResolved(false);
    setFiledCaseId(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 31, 61, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          width: "92%",
          maxWidth: 580,
          height: "min(740px, 90vh)",
          borderRadius: 18,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, var(--color-navy), #1E3A8A)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>AI Advocate Assistant</div>
              <div style={{ fontSize: 10.5, color: "hsl(217, 30%, 78%)", marginTop: 1 }}>
                RAG-powered Policy Expert & Triage
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                fontSize: 16,
                transition: "background 0.2s"
              }}
              title="AI Settings"
            >
              ⚙️
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 22,
                color: "rgba(255,255,255,0.7)",
                padding: 4,
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Settings Overlay Drawer */}
        {showSettings && (
          <SettingsPanel
            initialModel={model}
            initialGeminiKey={geminiKey}
            initialClaudeKey={claudeKey}
            onClose={() => setShowSettings(false)}
            onSave={saveSettings}
          />
        )}

        {/* Active Engine Badge */}
        <div
          style={{
            background: "hsl(215, 15%, 95%)",
            borderBottom: "1px solid #E2E8F0",
            padding: "6px 20px",
            fontSize: 11,
            color: "hsl(215, 15%, 45%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0
          }}
        >
          <span>Engine: <strong>{model === "mock" ? "Mock Simulation" : model === "gemini" ? "Google Gemini 1.5" : "Anthropic Claude"}</strong></span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: model === "mock" ? "#F59E0B" : "#10B981" }} />
            Active
          </span>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "#F8FAFC",
          }}
        >
          {messages.map((m, idx) => (
            <ChatBubble key={idx} message={m} authUser={authUser} />
          ))}
          {isThinking && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--color-navy)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "4px 14px 14px 14px",
                  padding: "2px 12px",
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ borderTop: "1px solid #E5E7EB", padding: 14, flexShrink: 0, background: "#fff" }}>
          {resolved ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={resetChat}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  color: "var(--color-navy-dark)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Start New Chat / Q&A
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--color-blue)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about policies, notice period waiver, POSH, or file a case..."
                rows={2}
                disabled={isThinking}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #D1D5DB",
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleSend}
                disabled={isThinking || !input.trim()}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: "none",
                  background: isThinking || !input.trim() ? "#CBD5E1" : "var(--color-blue)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isThinking || !input.trim() ? "default" : "pointer",
                  height: 42,
                }}
              >
                Send
              </button>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "hsl(215, 10%, 60%)", marginTop: 8 }}>
            <span>RAG is active — policies will be searched automatically.</span>
            {!resolved && (
              <button
                onClick={() => setInput("I want to file a formal case.")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-blue)",
                  cursor: "pointer",
                  fontSize: 10,
                  textDecoration: "underline",
                  padding: 0
                }}
              >
                Direct Triage File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- ChatBubble Subcomponent --- */
const ChatBubble = ({ message, authUser }) => {
  const isUser = message.role === "user";
  const [showSources, setShowSources] = useState(false);

  if (isUser) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "flex-end" }}>
        <div
          style={{
            background: "var(--color-blue)",
            color: "#fff",
            borderRadius: "14px 14px 4px 14px",
            padding: "10px 14px",
            fontSize: 13,
            lineHeight: 1.5,
            maxWidth: "78%",
          }}
        >
          {message.text}
        </div>
        <Avatar name={authUser?.FullName || "You"} size={28} />
      </div>
    );
  }

  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--color-navy)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          flexShrink: 0,
          marginTop: 4
        }}
      >
        🤖
      </div>
      <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Main Bubble */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "4px 14px 14px 14px",
            padding: "10px 14px",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--color-navy-dark)",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }} />

          {/* RAG Policy Sources Drawer */}
          {hasSources && (
            <div style={{ marginTop: 8, borderTop: "1px dashed #E2E8F0", paddingTop: 8 }}>
              <button
                onClick={() => setShowSources(!showSources)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1E3A8A",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                📚 Grounded on: {message.sources.map(s => s.title).join(", ")} {showSources ? "▲" : "▼"}
              </button>
              {showSources && (
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  {message.sources.map((source, sidx) => (
                    <div
                      key={sidx}
                      style={{
                        background: "hsl(215, 30%, 97%)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontSize: 11,
                        color: "hsl(215, 20%, 35%)",
                        borderLeft: "3px solid #1E3A8A"
                      }}
                    >
                      <strong>{source.title} ({source.category})</strong>
                      <div style={{ marginTop: 4, fontStyle: "italic" }}>
                        "{source.content.substring(0, 160)}..."
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filed Case Notification Block */}
        {message.meta?.type === "assigned" && (
          <div
            style={{
              marginTop: 4,
              background: "hsl(142, 70%, 97%)",
              border: "1px solid hsl(142, 70%, 88%)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>{getCategoryIcon(message.meta.categoryId)}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "hsl(142, 70%, 25%)" }}>
                Case #{message.meta.caseId} filed & assigned
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "hsl(142, 30%, 30%)", marginBottom: 8 }}>
              {message.meta.category} · {message.meta.priority} priority
            </div>
            {message.meta.advocate && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Avatar name={message.meta.advocate.FullName} size={26} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-navy-dark)" }}>
                    {message.meta.advocate.FullName}
                  </div>
                  <div style={{ fontSize: 10, color: "hsl(215, 10%, 50%)" }}>{message.meta.advocate.Department}</div>
                </div>
              </div>
            )}
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px dashed hsl(142, 40%, 80%)",
                fontSize: 11,
                color: "hsl(142, 50%, 25%)",
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 600 }}>⏱️ Response SLA:</div>
              {message.meta.priority === "Critical" 
                ? "This is a critical concern and will be reviewed within 24 hours." 
                : "This standard priority case will be reviewed within 1-2 business days."}
              <div style={{ marginTop: 4, fontStyle: "italic", opacity: 0.85 }}>
                You can track updates and chat with the advocate in "My Cases".
              </div>
            </div>
          </div>
        )}

        {message.meta?.type === "rejected" && (
          <div
            style={{
              marginTop: 4,
              background: "hsl(35, 100%, 97%)",
              border: "1px solid hsl(35, 100%, 88%)",
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 11.5,
              color: "hsl(35, 85%, 30%)",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <span>ℹ️</span>
            <span>This issue was not filed as a case. If you believe this is a mistake, you can still file manually. Reason: {message.meta.reasoning}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- SettingsPanel Component --- */
const SettingsPanel = ({ initialModel, initialGeminiKey, initialClaudeKey, onClose, onSave }) => {
  const [model, setModel] = useState(initialModel);
  const [gKey, setGKey] = useState(initialGeminiKey);
  const [cKey, setCKey] = useState(initialClaudeKey);

  return (
    <div
      style={{
        position: "absolute",
        top: 68,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderBottom: "1px solid #CBD5E1",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        zIndex: 50,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animation: "slideDown 0.2s ease-out"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)" }}>AI Engine Configuration</h4>
        <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16 }}>×</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(215, 15%, 40%)" }}>Select AI Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid #D1D5DB",
            fontSize: 12,
            outline: "none"
          }}
        >
          <option value="mock">Mock Simulator (Offline, No Keys Required)</option>
          <option value="gemini">Google Gemini 1.5 Flash (API Key Required)</option>
          <option value="claude">Anthropic Claude 3.5 Sonnet (API Key Required)</option>
        </select>
      </div>

      {model === "gemini" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(215, 15%, 40%)" }}>Gemini API Key</label>
          <input
            type="password"
            value={gKey}
            onChange={(e) => setGKey(e.target.value)}
            placeholder="AIzaSy..."
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>
      )}

      {model === "claude" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(215, 15%, 40%)" }}>Claude API Key</label>
          <input
            type="password"
            value={cKey}
            onChange={(e) => setCKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              fontSize: 12,
              outline: "none"
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onSave(model, gKey, cKey)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--color-blue)",
            color: "#fff",
            border: "none",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Save Configuration
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#fff",
            color: "#475569",
            border: "1px solid #D1D5DB",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AIAdvocateChat;
