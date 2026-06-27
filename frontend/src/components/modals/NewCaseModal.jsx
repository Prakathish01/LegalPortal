import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GrievanceContext } from "../../context/GrievanceContext";
import { searchPolicies, validateGrievance } from "../../utils/ragEngine";
import companyPolicies from "../../data/companyPolicies.json";
import { USE_REMOTE } from "../../data/dataSource";
import { triageGrievanceRemote } from "../../utils/aiService";

const caseSchema = z.object({
  subject: z.string().trim().min(1, "Please enter a subject."),
  categoryId: z.string().min(1, "Please select a service type / category."),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  description: z.string().trim().min(1, "Please enter a detailed description."),
});

const NewCaseModal = ({ onClose, actingUserId }) => {
  const { categories, addCase, currentUser } = useContext(GrievanceContext);

  const [error, setError] = useState("");
  const [createdCaseId, setCreatedCaseId] = useState(null);

  // ── Multi-step state ──
  const [step, setStep] = useState("form"); // "form" | "verifying" | "review" | "submitting" | "success"
  const [ragResult, setRagResult] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      subject: "",
      categoryId: "",
      priority: "Medium",
      description: "",
    }
  });

  const subject = watch("subject");
  const categoryId = watch("categoryId");
  const priority = watch("priority");
  const description = watch("description");

  // ── Step 1 → RAG Verification ──
  const onVerify = (data) => {
    setError("");
    setStep("verifying");

    // Simulate a brief delay for UX, then run RAG
    setTimeout(async () => {
      try {
        if (USE_REMOTE) {
          const triageData = await triageGrievanceRemote(data.subject.trim(), data.description.trim());
          
          let suggestedCategory = null;
          if (triageData.suggestedCategory) {
            suggestedCategory = categories.find(
              (c) => c.CategoryName === triageData.suggestedCategory.CategoryName
            );
          }

          const userSelectedCat = categories.find(
            (c) => c.CategoryID === Number(data.categoryId)
          );

          const categoryMismatch =
            suggestedCategory &&
            userSelectedCat &&
            suggestedCategory.CategoryID !== userSelectedCat.CategoryID;

          setRagResult({
            matchedPolicies: triageData.matchedPolicies || [],
            suggestedCategory,
            suggestedPriority: triageData.suggestedPriority,
            isUserFault: triageData.isUserFault,
            faultReason: triageData.faultReason,
            categoryMismatch,
            userSelectedCategory: userSelectedCat,
          });
          setStep("review");
          return;
        }

        const queryText = `${data.subject.trim()} ${data.description.trim()}`;

        // 1. Run RAG search against company policies
        const matchedPolicies = searchPolicies(queryText, companyPolicies, 3);

        // 2. Determine AI-suggested category from matched policies
        let suggestedCategory = null;
        let suggestedPriority = data.priority;
        let isUserFault = false;
        let faultReason = "";

        if (matchedPolicies.length > 0) {
          const top = matchedPolicies[0];
          // Find the matching category from our categories list
          const matchedCat = categories.find(
            (c) => c.CategoryName === top.category
          );
          if (matchedCat) {
            suggestedCategory = matchedCat;
          }

          // Check for priority escalation
          const topTitle = (top.title || "").toLowerCase();
          if (
            topTitle.includes("posh") ||
            topTitle.includes("harassment") ||
            topTitle.includes("safety")
          ) {
            suggestedPriority = "Critical";
          } else if (
            topTitle.includes("whistleblower") ||
            topTitle.includes("employment") ||
            topTitle.includes("notice")
          ) {
            suggestedPriority = "High";
          }
        }

        // 3. Robust user-fault and malice detection
        const validation = validateGrievance(data.subject.trim(), data.description.trim());
        if (validation.isInvalid) {
          isUserFault = true;
          faultReason = validation.message;
        }

        // 4. Check if user-selected category matches the RAG suggestion
        const userSelectedCat = categories.find(
          (c) => c.CategoryID === Number(data.categoryId)
        );
        const categoryMismatch =
          suggestedCategory &&
          userSelectedCat &&
          suggestedCategory.CategoryID !== userSelectedCat.CategoryID;

        setRagResult({
          matchedPolicies,
          suggestedCategory,
          suggestedPriority,
          isUserFault,
          faultReason,
          categoryMismatch,
          userSelectedCategory: userSelectedCat,
        });
        setStep("review");
      } catch (err) {
        console.error("RAG verification error:", err);
        // If RAG fails, skip verification and go straight to submit
        setRagResult(null);
        setStep("review");
      }
    }, 600);
  };

  // ── Accept AI suggestions ──
  const handleAcceptSuggestions = () => {
    if (ragResult?.suggestedCategory) {
      setValue("categoryId", String(ragResult.suggestedCategory.CategoryID));
    }
    if (ragResult?.suggestedPriority) {
      setValue("priority", ragResult.suggestedPriority);
    }
  };

  // ── Step 2 → Final Submit ──
  const handleConfirmSubmit = async () => {
    setStep("submitting");
    try {
      const finalCatId = ragResult?.suggestedCategory?.CategoryID || Number(categoryId);
      const finalPriority = ragResult?.suggestedPriority || priority;

      const caseId = await addCase({
        subject: subject.trim(),
        categoryId: Number(finalCatId),
        priority: finalPriority,
        description: description.trim(),
        userId: actingUserId || currentUser?.UserID || 1,
      });

      if (caseId) {
        setCreatedCaseId(caseId);
        setStep("success");
      } else {
        setError("Failed to submit case. Please try again.");
        setStep("review");
      }
    } catch (err) {
      setError("Failed to submit case. Please try again.");
      setStep("review");
    }
  };

  // ── Render Helpers ──
  const renderPolicyCard = (policy, idx) => (
    <div
      key={idx}
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--color-navy-dark)",
          marginBottom: 4,
        }}
      >
        📋 {policy.title}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "hsl(215, 15%, 50%)",
          lineHeight: 1.5,
        }}
      >
        {policy.content.length > 180
          ? policy.content.substring(0, 180) + "…"
          : policy.content}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--color-blue)",
          fontWeight: 600,
          marginTop: 6,
        }}
      >
        Relevance Score: {policy.relevanceScore.toFixed(1)}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 31, 61, 0.4)",
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
          maxWidth: 560,
          borderRadius: 16,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F8FAFC",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--color-navy-dark)",
              margin: 0,
            }}
          >
            {step === "review" || step === "submitting"
              ? "⚖️ RAG Verification Review"
              : step === "verifying"
              ? "🔍 Verifying Complaint…"
              : "File New Grievance Case"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "hsl(215, 10%, 60%)",
              padding: 4,
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* ═══════ SUCCESS ═══════ */}
        {step === "success" && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "hsl(142, 70%, 95%)",
                color: "hsl(142, 70%, 35%)",
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              ✓
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--color-navy-dark)",
                margin: "0 0 8px",
              }}
            >
              Grievance Filed Successfully!
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "hsl(215, 15%, 50%)",
                margin: 0,
              }}
            >
              Your case has been verified by RAG and submitted. A legal officer
              will review it shortly.
            </p>
          </div>
        )}

        {/* ═══════ VERIFYING (spinner) ═══════ */}
        {step === "verifying" && (
          <div
            style={{
              padding: "56px 24px",
              textAlign: "center",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <div className="data-loading-spinner"></div>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-navy-dark)",
                margin: "0 0 6px",
              }}
            >
              Running RAG Verification
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "hsl(215, 15%, 55%)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Scanning company policies and validating your complaint
              details&hellip;
            </p>
          </div>
        )}

        {/* ═══════ RAG REVIEW ═══════ */}
        {(step === "review" || step === "submitting") && (
          <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            {error && (
              <div
                style={{
                  backgroundColor: "hsl(0, 100%, 97%)",
                  border: "1px solid hsl(0, 100%, 90%)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "var(--color-red)",
                  fontWeight: 500,
                  marginBottom: 16,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* User Fault / Rejection Alert */}
            {ragResult?.isUserFault && (
              <div
                style={{
                  background: "hsl(0, 100%, 96%)",
                  border: "1px solid hsl(0, 85%, 85%)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "hsl(0, 80%, 35%)",
                    marginBottom: 4,
                  }}
                >
                  ❌ Case Filing Rejected
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "hsl(0, 50%, 40%)",
                    lineHeight: 1.5,
                  }}
                >
                  {ragResult.faultReason}
                </div>
              </div>
            )}

            {/* Category Mismatch Suggestion */}
            {ragResult?.categoryMismatch && (
              <div
                style={{
                  background: "hsl(217, 100%, 97%)",
                  border: "1px solid hsl(217, 80%, 85%)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-blue)",
                    marginBottom: 6,
                  }}
                >
                  💡 Category Suggestion
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "hsl(215, 20%, 40%)",
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                >
                  You selected{" "}
                  <strong>{ragResult.userSelectedCategory?.CategoryName}</strong>
                  , but based on your complaint description, our RAG engine
                  suggests{" "}
                  <strong>
                    {ragResult.suggestedCategory?.CategoryName}
                  </strong>{" "}
                  might be a better fit.
                </div>
                {ragResult.suggestedPriority !== priority && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "hsl(215, 20%, 40%)",
                      marginBottom: 10,
                    }}
                  >
                    Priority suggestion:{" "}
                    <strong>{ragResult.suggestedPriority}</strong> (you selected{" "}
                    {priority})
                  </div>
                )}
                <button
                  onClick={handleAcceptSuggestions}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--color-blue)",
                    background: "rgba(59, 130, 246, 0.08)",
                    color: "var(--color-blue)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✓ Accept Suggestions
                </button>
              </div>
            )}

            {/* Matched Policies */}
            {ragResult?.matchedPolicies?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-navy-dark)",
                    marginBottom: 10,
                  }}
                >
                  📚 Matched Company Policies (
                  {ragResult.matchedPolicies.length})
                </div>
                {ragResult.matchedPolicies.map(renderPolicyCard)}
              </div>
            )}

            {ragResult?.matchedPolicies?.length === 0 && (
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 16,
                  fontSize: 12,
                  color: "hsl(35, 60%, 35%)",
                  lineHeight: 1.5,
                }}
              >
                ℹ️ No closely matching company policies were found for your
                complaint. Your case will still be filed and reviewed by a legal
                officer.
              </div>
            )}

            {/* Summary of what will be filed */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-navy-dark)",
                  marginBottom: 10,
                }}
              >
                📝 Case Summary
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, color: "hsl(215, 15%, 45%)" }}>
                  <strong>Subject:</strong> {subject}
                </div>
                <div style={{ fontSize: 12, color: "hsl(215, 15%, 45%)" }}>
                  <strong>Category:</strong>{" "}
                  {categories.find((c) => c.CategoryID === Number(categoryId))
                    ?.CategoryName || "—"}
                </div>
                <div style={{ fontSize: 12, color: "hsl(215, 15%, 45%)" }}>
                  <strong>Priority:</strong>{" "}
                  <span
                    style={{
                      color:
                        priority === "Critical"
                          ? "var(--color-red)"
                          : priority === "High"
                          ? "hsl(35, 85%, 45%)"
                          : "var(--color-navy-dark)",
                      fontWeight: 600,
                    }}
                  >
                    {priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                borderTop: "1px solid #F1F5F9",
                paddingTop: 16,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setRagResult(null);
                  setError("");
                }}
                disabled={step === "submitting"}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  color: "hsl(215, 15%, 35%)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: step === "submitting" ? "not-allowed" : "pointer",
                  opacity: step === "submitting" ? 0.5 : 1,
                }}
              >
                ← Edit Form
              </button>
              {ragResult?.isUserFault ? (
                <button
                  type="button"
                  disabled
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#E2E8F0",
                    color: "#94A3B8",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "not-allowed",
                  }}
                >
                  🚫 Case Blocked
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={step === "submitting"}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      "linear-gradient(135deg, var(--color-green), hsl(142, 72%, 38%))",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: step === "submitting" ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 10px rgba(22, 163, 74, 0.25)",
                    opacity: step === "submitting" ? 0.7 : 1,
                  }}
                >
                  {step === "submitting"
                    ? "Filing Case…"
                    : "✓ Confirm & File Case"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══════ FORM ═══════ */}
        {step === "form" && (
          <form onSubmit={handleSubmit(onVerify)} style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            {(error || Object.keys(errors).length > 0) && (
              <div
                style={{
                  backgroundColor: "hsl(0, 100%, 97%)",
                  border: "1px solid hsl(0, 100%, 90%)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "var(--color-red)",
                  fontWeight: 500,
                  marginBottom: 16,
                }}
              >
                ⚠️ {error || errors.subject?.message || errors.categoryId?.message || errors.description?.message}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "hsl(215, 20%, 40%)",
                  marginBottom: 6,
                }}
              >
                Subject / Brief Title
              </label>
              <input
                type="text"
                placeholder="e.g. Property boundary encroachment, unauthorized bank fee..."
                {...register("subject")}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "hsl(215, 20%, 40%)",
                    marginBottom: 6,
                  }}
                >
                  Category / Service Type
                </label>
                <select
                  {...register("categoryId")}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #D1D5DB",
                    fontSize: 13,
                    background: "#fff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select Service Type</option>
                  {categories.map((c) => (
                    <option key={c.CategoryID} value={c.CategoryID}>
                      {c.CategoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "hsl(215, 20%, 40%)",
                    marginBottom: 6,
                  }}
                >
                  Priority
                </label>
                <select
                  {...register("priority")}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #D1D5DB",
                    fontSize: 13,
                    background: "#fff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "hsl(215, 20%, 40%)",
                  marginBottom: 6,
                }}
              >
                Detailed Description
              </label>
              <textarea
                placeholder="Describe the background details, parties involved, and any specific assistance required..."
                rows={5}
                {...register("description")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  fontSize: 13,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Info banner */}
            <div
              style={{
                background: "hsl(217, 100%, 97%)",
                border: "1px solid hsl(217, 80%, 90%)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 11.5,
                color: "hsl(217, 40%, 45%)",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              🔍 Your complaint will be verified against company policies using
              our RAG engine before submission. This ensures the right category
              and priority are applied.
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                borderTop: "1px solid #F1F5F9",
                paddingTop: 16,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  color: "hsl(215, 15%, 35%)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    "linear-gradient(135deg, var(--color-blue), #2563EB)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(59, 130, 246, 0.25)",
                }}
              >
                🔍 Verify & Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewCaseModal;
