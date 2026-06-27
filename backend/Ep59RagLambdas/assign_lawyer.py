import json
import traceback
from common_rag import (
    retrieve_policies,
    call_nova_micro,
    validate_grievance_local,
    clean_and_parse_json
)

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT"
}

def handler(event, context):
    """
    Lambda function handler for AI triage and lawyer assignment (/ai/triage).
    """
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": ""
        }

    try:
        body_str = event.get('body', '{}') or '{}'
        body = json.loads(body_str)
        
        subject = body.get('subject', '').strip()
        description = body.get('description', '').strip()

        # 1. Run local safety validator (user fault and malice checks)
        safety_check = validate_grievance_local(subject, description)
        if safety_check.get('isInvalid'):
            # Return user fault response block
            triage_payload = {
                "matchedPolicies": [],
                "suggestedCategory": None,
                "suggestedPriority": "Medium",
                "isUserFault": True,
                "faultReason": safety_check.get('message')
            }
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({
                    "success": True,
                    "message": "Safety policy validation flagged user fault or malice",
                    "data": triage_payload
                })
            }

        # 2. Perform RAG Policy Search
        query_text = f"{subject} {description}"
        retrieved_policies = retrieve_policies(query_text, max_results=3)
        
        if retrieved_policies:
            context_str = "\n\n".join([
                f"[Policy: {p['title']}]\nCategory: {p['category']}\nContent: {p['content']}"
                for p in retrieved_policies
            ])
        else:
            context_str = "No matching company policies found."

        # 3. Formulate the triage system prompt
        system_prompt = f"""You are a professional legal triage assistant. Your task is to analyze the grievance subject and description, compare it with the provided company policy context, and classify it.

Classify the grievance into one of the following exact categories:
- "Personal Legal Consultation"
- "Consumer Rights Assistance"
- "Will & Estate Guidance"
- "Affidavit & Notarization"
- "Attestation Support"
- "Employment Law Advisory"
- "Disciplinary Advisory"
- "Harassment & POSH Complaint"
- "Workplace Conduct Complaint"
- "Vendor & Service Complaint"
- "Anonymous Whistleblower Report"

Also determine the appropriate priority: "Critical", "High", "Medium", or "Low".
Use these guidelines:
- "Critical" priority: POSH, harassment, imminent safety/PPE issues, or life-threatening health insurance disputes.
- "High" priority: Whistleblower reports, notice period disputes, urgent legal affairs.
- "Medium" priority: General workplace issues, consumer disputes, civil disputes.
- "Low" priority: Will drafting, standard attestation/notary affairs.

Rule for "isUserFault": Assess as true if: (a) the issue is caused by the employee's own direct policy violation, negligence, or misconduct; (b) the employee wants to cause purposeful suffering/revenge to someone else without validations/proof/evidence; (c) the provided information is wrong/falsified.

Respond with ONLY a valid JSON object in this format:
{{
  "category": "<one of the categories listed above>",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "isUserFault": true | false,
  "reasoning": "<1-2 sentences of explanation for the classification>"
}}

Company Policy Context (RAG):
{context_str}
"""

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "text": f"Subject: {subject}\nDescription: {description}"
                    }
                ]
            }
        ]

        # 4. Call Nova Micro for classification
        llm_response = call_nova_micro(system_prompt, messages)
        parsed_response = clean_and_parse_json(llm_response)

        # 5. Build final payload for frontend
        is_user_fault = parsed_response.get('isUserFault', False)
        fault_reason = parsed_response.get('reasoning', '') if is_user_fault else ''
        
        suggested_category_name = parsed_response.get('category', 'Employment Law Advisory')
        suggested_priority = parsed_response.get('priority', 'Medium')
        
        triage_payload = {
            "matchedPolicies": retrieved_policies,
            "suggestedCategory": {
                "CategoryName": suggested_category_name
            },
            "suggestedPriority": suggested_priority,
            "isUserFault": is_user_fault,
            "faultReason": fault_reason if fault_reason else "Admitted employee negligence or policy violation."
        }

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "success": True,
                "message": "Triage analysis completed successfully",
                "data": triage_payload
            })
        }

    except Exception as e:
        print(f"Exception in AI Triage handler: {e}")
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "success": False,
                "message": f"Internal Server Error: {str(e)}"
            })
        }
