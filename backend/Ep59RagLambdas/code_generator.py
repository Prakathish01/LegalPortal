import os
import io
import json
import zipfile
import re
import urllib.request
import traceback
import boto3
from common_rag import retrieve_policies, call_nova_micro

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT"
}

lambda_client = boto3.client('lambda')

def update_lambda_code(target_name, filename, retrieved_policies):
    print(f"Starting code update for {target_name} ({filename})...")
    
    # 1. Get the current function configuration and code location URL
    try:
        func_info = lambda_client.get_function(FunctionName=target_name)
    except Exception as e:
        print(f"Error getting function info for {target_name}: {e}")
        return False, f"Failed to locate Lambda function: {e}"
        
    code_location = func_info.get('Code', {}).get('Location')
    if not code_location:
        return False, "Could not resolve code download URL from AWS Lambda."
        
    # 2. Download the deployment package ZIP bytes
    try:
        with urllib.request.urlopen(code_location) as response:
            zip_bytes = response.read()
    except Exception as e:
        print(f"Error downloading ZIP for {target_name}: {e}")
        return False, f"Failed to download Lambda ZIP package: {e}"
        
    # 3. Read zip in-memory and extract target file text
    current_code = None
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as read_zip:
            if filename not in read_zip.namelist():
                return False, f"Target file '{filename}' was not found in the deployment ZIP package."
            current_code = read_zip.read(filename).decode('utf-8')
    except Exception as e:
        print(f"Error reading ZIP contents: {e}")
        return False, f"Failed to extract current Lambda code from package: {e}"
        
    if not current_code:
        return False, f"Empty code read from target file '{filename}'."
        
    # 4. Formulate LLM Prompt to rewrite code
    context_str = "\n\n".join([
        f"[Policy: {p['title']}]\nCategory: {p['category']}\nContent: {p['content']}"
        for p in retrieved_policies
    ])
    
    system_prompt = f"""You are a senior software engineer. Your task is to update a Python AWS Lambda script to reflect new company policy rules retrieved from a Knowledge Base.
    
    Company Policy Context (RAG):
    {context_str}
    
    Instructions:
    1. Update the hardcoded prompt variables, guidelines, rules, categories, or system instruction text blocks inside the script below to strictly align with the retrieved policies.
    2. DO NOT change the AWS handler signature, dependencies, internal methods (such as boto3 calls or helper methods), or the structural JSON output schema.
    3. Return ONLY valid, executable Python source code. Do NOT enclose it in markdown blocks (e.g. do not use ```python or ```) and do not output any introductory or explanatory text.
    """
    
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "text": f"Here is the current python source code of the Lambda function:\n\n{current_code}"
                }
            ]
        }
    ]
    
    # 5. Call Bedrock Nova Micro to generate modified code
    try:
        new_code = call_nova_micro(system_prompt, messages, max_tokens=4000, temperature=0.0)
    except Exception as e:
        return False, f"Bedrock code generation call failed: {e}"
        
    # Clean the generated code if Bedrock accidentally wrapped it in markdown
    new_code_clean = new_code.strip()
    new_code_clean = re.sub(r"^```(?:python)?", "", new_code_clean, flags=re.IGNORECASE)
    new_code_clean = re.sub(r"```$", "", new_code_clean, flags=re.IGNORECASE).strip()
    
    if not new_code_clean or len(new_code_clean) < 100:
        return False, "Bedrock returned empty or invalid source code."
        
    # 6. Re-zip all the original files in-memory, replacing the target script with the newly generated code
    final_zip_buffer = io.BytesIO()
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as read_zip:
            with zipfile.ZipFile(final_zip_buffer, 'w', zipfile.ZIP_DEFLATED) as write_zip:
                for item in read_zip.infolist():
                    if item.filename == filename:
                        write_zip.writestr(filename, new_code_clean)
                    else:
                        write_zip.writestr(item, read_zip.read(item.filename))
    except Exception as e:
        print(f"Error copying and compiling ZIP package: {e}")
        return False, f"Failed to repackage deployment code: {e}"
            
    # 7. Upload/Update Function Code in AWS
    final_zip_bytes = final_zip_buffer.getvalue()
    try:
        lambda_client.update_function_code(
            FunctionName=target_name,
            ZipFile=final_zip_bytes
        )
        print(f"Successfully updated deployment code for Lambda: {target_name}")
        return True, "Successfully rewritten and updated function code."
    except Exception as e:
        print(f"Error calling update_function_code for {target_name}: {e}")
        return False, f"AWS Lambda update API failed: {e}"

def handler(event, context):
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
        
        query = body.get('query', '').strip()
        target = body.get('target', 'all').strip().lower()
        
        if not query:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({
                    "success": False,
                    "message": "Policy search query parameter is required."
                })
            }
            
        # 1. Retrieve matching policies from Knowledge Base
        print(f"Querying Bedrock KB with search query: {query}")
        retrieved_policies = retrieve_policies(query, max_results=3)
        if not retrieved_policies:
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({
                    "success": False,
                    "message": "No matching policy context was resolved from Knowledge Base. Aborting code rewrite to avoid corruption."
                })
            }
            
        targets = []
        if target == 'all':
            targets = [
                ("ep59-ai-response-lambda", "ai_response.py"),
                ("ep59-assign-lawyer-lambda", "assign_lawyer.py")
            ]
        elif target == 'ep59-ai-response-lambda':
            targets = [("ep59-ai-response-lambda", "ai_response.py")]
        elif target == 'ep59-assign-lawyer-lambda':
            targets = [("ep59-assign-lawyer-lambda", "assign_lawyer.py")]
        else:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({
                    "success": False,
                    "message": f"Invalid update target: {target}. Must be 'all', 'ep59-ai-response-lambda', or 'ep59-assign-lawyer-lambda'."
                })
            }
            
        results = []
        for target_name, filename in targets:
            success, message = update_lambda_code(target_name, filename, retrieved_policies)
            results.append({
                "function": target_name,
                "file": filename,
                "success": success,
                "message": message
            })
            
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "success": True,
                "message": "Code generation cycle completed",
                "data": {
                    "retrievedPolicies": retrieved_policies,
                    "results": results
                }
            })
        }
        
    except Exception as e:
        print(f"Exception in Code Generator: {e}")
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "success": False,
                "message": f"Internal Server Error: {str(e)}"
            })
        }
