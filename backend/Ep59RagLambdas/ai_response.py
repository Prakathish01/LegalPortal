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
    Lambda function handler for AI chatbot responses (/ai/response).
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
        
        user_message = body.get('message', '').strip()
        history = body.get('history', [])
        user_info = body.get('user', {})
        
        user_name = user_info.get('FullName', 'there').split(' ')[0] if user_info else 'there'

        # 1. Run local safety validator (user fault and malice detection)
        # Extract full cumulative description from history to ensure consistency
        description_parts = [m.get('text', '') for m in history if m.get('role') == 'user']
        if user_message and (not description_parts or description_parts[-1] != user_message):
            description_parts.append(user_message)
        full_description = "\n\n".join(description_parts)
        
        safety_check = validate_grievance_local(user_message, full_description)
        if safety_check.get('isInvalid'):
            rejection_message = f"Dear {user_name}, **we can't take this case.** {safety_check.get('message')}"
            
            # Immediately return a structured rejection matching frontend expectations
            rejection_payload = {
                "replyText": rejection_message,
                "shouldFileCase": True,
                "triageData": {
                    "category": "Employment Law Advisory",
                    "priority": "Medium",
                    "isUserFault": True,
                    "reasoning": safety_check.get('message'),
                    "summary": "Case Rejected"
                }
            }
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({
                    "success": True,
                    "message": "Safety policy validation rejected the input",
                    "data": rejection_payload
                })
            }

        # 2. Perform RAG Policy Search
        retrieved_policies = retrieve_policies(user_message, max_results=3)
        if retrieved_policies:
            context_str = "\n\n".join([
                f"[Policy: {p['title']}]\nCategory: {p['category']}\nContent: {p['content']}"
                for p in retrieved_policies
            ])
        else:
            context_str = "No matching company policies found. Answer using standard, helpful guidelines, making sure to advise that a formal case can be filed if needed."

        # 3. Formulate the system prompt
        system_prompt = f"""You are a helpful, professional AI Advocate and Intake Assistant for an internal Legal & Grievance support desk at a company.

Your capabilities:
1. Answer employee questions about company policies, notice periods, ethics, or civil consultations. Ground your responses strictly in the provided "Company Policy Context" sections. Use Markdown formatting (lists, bold text) in your replies.
2. If the user describes a grievance or issue they are facing, do NOT immediately file a case. First answer their question or explain the policy, then explicitly ask them: "Would you like me to file a formal case and assign a lawyer to assist you with this, or are you just asking about the issue?"
3. If the user responds to that question by saying "yes", "please file it", "assign a lawyer", or similar confirmation, then set "shouldFileCase" to true.
4. When confirming a case filing, explain in the "replyText" how long it typically takes to respond and other information (e.g. Critical priority cases like harassment/POSH are actioned and reviewed within 24 hours; standard cases are reviewed and assigned within 1-2 business days; you will receive a notification and can track progress under "My Cases" from the sidebar).

Valid intake categories:
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

Rule for "isUserFault": Assess as true if: (a) the issue is caused by the employee's own direct policy violation, negligence, or misconduct (e.g. lost personal items, trying to hide fraud, admitting breaking rules); (b) the employee wants to cause purposeful suffering/revenge to someone else without validations/proof/evidence; (c) the provided information is admitted to be wrong/falsified.
If "isUserFault" is true, you must still respond with "shouldFileCase": true, but set the "replyText" to strictly tell them "We can't take this case." followed by the detailed reasoning why it is rejected, and do not ask to assign a lawyer. Otherwise, default to false.

You must ALWAYS respond with ONLY valid JSON in this exact structure:
{{
  "replyText": "<warm, professional markdown reply to the user. Explain details, answer questions, or ask if they want to assign a lawyer. If filing, mention you are filing and display response times (24h for critical, 1-2 days for standard) and case tracking details>",
  "shouldFileCase": true | false,
  "triageData": {{
    "category": "<one of the categories above, or null if shouldFileCase is false>",
    "priority": "Critical" | "High" | "Medium" | "Low",
    "isUserFault": true | false,
    "reasoning": "<1-2 sentences of internal reasoning regarding this classification>",
    "summary": "<concise 6-10 word case subject/title>"
  }}
}}

Company Policy Context (RAG):
{context_str}
"""

        # 4. Map message history into boto3 Converse format with strict validation/alternation
        temp_messages = []
        for msg in history:
            role = 'user' if msg.get('role') == 'user' else 'assistant'
            text = msg.get('text', '').strip()
            if text:
                temp_messages.append({
                    'role': role,
                    'text': text
                })
        
        # Add current user message if it's not the last one in temp_messages
        if not temp_messages or temp_messages[-1]['role'] != 'user' or temp_messages[-1]['text'] != user_message:
            temp_messages.append({
                'role': 'user',
                'text': user_message
            })
            
        # Filter and alternate
        formatted_messages = []
        for msg in temp_messages:
            role = msg['role']
            text = msg['text']
            
            # A conversation must start with a user message
            if not formatted_messages and role == 'assistant':
                continue
                
            if formatted_messages and formatted_messages[-1]['role'] == role:
                # Merge consecutive messages with the same role
                formatted_messages[-1]['content'][0]['text'] += f"\n\n{text}"
            else:
                formatted_messages.append({
                    'role': role,
                    'content': [{'text': text}]
                })

        # 5. Call Nova Micro
        llm_response = call_nova_micro(system_prompt, formatted_messages)
        parsed_response = clean_and_parse_json(llm_response)

        # Secondary safety double-check if the LLM flagged isUserFault
        if parsed_response.get('triageData', {}).get('isUserFault'):
            parsed_response['replyText'] = f"Dear {user_name}, **we can't take this case.** {parsed_response['triageData'].get('reasoning', 'Admitted negligence or policy violation.')}"
            parsed_response['shouldFileCase'] = True

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "success": True,
                "message": "AI reply generated successfully",
                "data": parsed_response
            })
        }

    except Exception as e:
        print(f"Exception in AI Response handler: {e}")
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "success": False,
                "message": f"Internal Server Error: {str(e)}"
            })
        }
