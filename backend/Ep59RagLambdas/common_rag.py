import os
import re
import json
import boto3
from botocore.config import Config

# Setup AWS client configurations with adequate timeouts
BOTO_CONFIG = Config(
    read_timeout=60,
    connect_timeout=10,
    retries={'max_attempts': 3}
)

def get_bedrock_runtime_client():
    region = os.environ.get("AWS_REGION", "eu-west-1")
    return boto3.client('bedrock-runtime', region_name=region, config=BOTO_CONFIG)

def get_s3_client():
    region = os.environ.get("AWS_REGION", "eu-west-1")
    return boto3.client('s3', region_name=region, config=BOTO_CONFIG)

def get_bedrock_agent_runtime_client():
    region = os.environ.get("AWS_REGION", "eu-west-1")
    return boto3.client('bedrock-agent-runtime', region_name=region, config=BOTO_CONFIG)

def find_s3_bucket(s3_client):
    """
    Lists S3 buckets and finds the one starting with ep59-policies-bucket-.
    """
    try:
        response = s3_client.list_buckets()
        for bucket in response.get('Buckets', []):
            name = bucket['Name']
            if name == 'ep59-policies-bucket' or name.startswith('ep59-policies-bucket-'):
                return name
    except Exception as e:
        print(f"Error listing S3 buckets: {e}")
    return None

def retrieve_policies_from_s3():
    """
    Retrieves the raw policies file text directly from the S3 bucket.
    """
    s3 = get_s3_client()
    bucket_name = find_s3_bucket(s3)
    if not bucket_name:
        print("Warning: Could not locate ep59 policies S3 bucket.")
        return ""

    try:
        # Find the text file under policies/
        objects = s3.list_objects_v2(Bucket=bucket_name, Prefix='policies/').get('Contents', [])
        txt_key = None
        for obj in objects:
            if obj['Key'].endswith('.txt'):
                txt_key = obj['Key']
                break
        
        if txt_key:
            print(f"Loading policies file from S3: s3://{bucket_name}/{txt_key}")
            resp = s3.get_object(Bucket=bucket_name, Key=txt_key)
            return resp['Body'].read().decode('utf-8')
    except Exception as e:
        print(f"Error reading policies from S3: {e}")
    return ""

def retrieve_policies_from_knowledge_base(query_text, max_results=3):
    """
    Retrieves policy passages from Amazon Bedrock Knowledge Bases.
    """
    knowledge_base_id = (
        os.environ.get("BEDROCK_KNOWLEDGE_BASE_ID")
        or os.environ.get("KNOWLEDGE_BASE_ID")
    )
    if not knowledge_base_id:
        print("Warning: KNOWLEDGE_BASE_ID is not configured; falling back to S3 policy search.")
        return []

    try:
        client = get_bedrock_agent_runtime_client()
        response = client.retrieve(
            knowledgeBaseId=knowledge_base_id,
            retrievalQuery={"text": query_text},
            retrievalConfiguration={
                "managedSearchConfiguration": {
                    "numberOfResults": max_results
                }
            }
        )

        policies = []
        for idx, item in enumerate(response.get("retrievalResults", []), start=1):
            content = item.get("content", {}).get("text", "").strip()
            if not content:
                continue

            metadata = item.get("metadata") or {}
            location = item.get("location") or {}
            s3_uri = location.get("s3Location", {}).get("uri", "")
            source = metadata.get("title") or metadata.get("source") or s3_uri
            title = source.split("/")[-1] if source else f"Knowledge Base Result {idx}"

            policies.append({
                "title": title,
                "category": metadata.get("category", "Company Policy Knowledge Base"),
                "content": content,
                "relevanceScore": round(float(item.get("score", 0.0)) * 100, 2)
            })

        return policies
    except Exception as e:
        print(f"Error retrieving policies from Bedrock Knowledge Base: {e}")
        return []

def retrieve_policies_from_s3_search(query_text, max_results=3):
    """
    Parses and searches the S3 policies file locally as a fallback.
    """
    raw_content = retrieve_policies_from_s3()
    if not raw_content:
        return []

    # Parse policies split by line separator
    segments = raw_content.split("==================================================")
    parsed_policies = []
    
    for segment in segments:
        lines = segment.strip().split("\n")
        if len(lines) < 2:
            continue
        
        title = ""
        category = ""
        keywords = ""
        content_lines = []
        
        for line in lines:
            if line.startswith("POLICY:"):
                title = line.replace("POLICY:", "").strip()
            elif line.startswith("Category:"):
                category = line.replace("Category:", "").strip()
            elif line.startswith("Keywords:"):
                keywords = line.replace("Keywords:", "").strip()
            elif not line.startswith("=================================================="):
                content_lines.append(line)
        
        content = "\n".join(content_lines).strip()
        if title and content:
            parsed_policies.append({
                "title": title,
                "category": category,
                "keywords": [k.strip() for k in keywords.split(",") if k.strip()],
                "content": content
            })

    # Perform TF-IDF like keyword search
    query_words = set(re.findall(r'\w+', query_text.lower()))
    scored = []
    for p in parsed_policies:
        score = 0.0
        title_lower = p['title'].lower()
        content_lower = p['content'].lower()
        
        for word in query_words:
            if len(word) < 3:
                continue
            if word in title_lower:
                score += 3.0
            if word in content_lower:
                score += 1.0
            for kw in p['keywords']:
                if word in kw.lower():
                    score += 2.0
                    
        if score > 0:
            scored.append({
                "title": p['title'],
                "category": p['category'],
                "content": p['content'],
                "relevanceScore": score
            })

    # Sort descending by relevance
    scored.sort(key=lambda x: x['relevanceScore'], reverse=True)
    return scored[:max_results]

def retrieve_policies(query_text, max_results=3):
    """
    Retrieves policies from Bedrock Knowledge Bases first, then falls back to S3.
    """
    kb_results = retrieve_policies_from_knowledge_base(query_text, max_results=max_results)
    if kb_results:
        return kb_results
    return retrieve_policies_from_s3_search(query_text, max_results=max_results)

def call_nova_micro(system_prompt, messages, max_tokens=1000, temperature=0.1):
    """
    Calls the Amazon Bedrock Nova Micro model using the Converse API.
    """
    model_id = "eu.amazon.nova-micro-v1:0"
    client = get_bedrock_runtime_client()

    # System prompts must be structured in a list of dicts for converse API
    system = [{"text": system_prompt}]

    try:
        response = client.converse(
            modelId=model_id,
            messages=messages,
            system=system,
            inferenceConfig={
                'maxTokens': max_tokens,
                'temperature': temperature
            }
        )
        
        # Extract the content text from response
        output_msg = response.get('output', {}).get('message', {})
        content_list = output_msg.get('content', [])
        if content_list and 'text' in content_list[0]:
            return content_list[0]['text']
        return ""
    except Exception as e:
        print(f"Error calling Bedrock Nova Micro: {e}")
        raise e

def validate_grievance_local(subject, description):
    """
    Performs local validation for user fault and malice.
    This mirrors client-side checks to guarantee backend-level safety.
    """
    text = f"{subject or ''} {description or ''}".lower()

    # Check for personal fault / policy violation admission
    personal_fault_keywords = [
        "lost my own",
        "overtime fraud",
        "hide my mistake",
        "i broke the",
        "my own negligence",
        "my fault",
        "was my fault",
        "i am at fault",
        "my mistake",
        "my carelessness",
        "carelessness",
        "falsified",
        "fabricated",
        "cheated",
        "stole",
        "embezzled",
        "lied",
        "admit i violated",
        "admit i broke",
        "my direct violation"
    ]

    # Check for malice / intent to cause purposeful suffering
    malice_keywords = [
        "revenge",
        "make them pay",
        "make them suffer",
        "ruin them",
        "get them fired",
        "teach them a lesson",
        "punish them",
        "destroy their career",
        "without proof",
        "don't have proof",
        "no proof",
        "no evidence",
        "purposefully suffer",
        "without validation",
        "without any validation",
        "ruin their life"
    ]

    has_fault = any(kw in text for kw in personal_fault_keywords)
    has_malice = any(kw in text for kw in malice_keywords)

    if has_fault:
        return {
            "isInvalid": True,
            "reason": "user_fault",
            "message": "We can't take this case. Our Legal & Grievance desk does not handle cases where the issue arises from an employee's own admitted negligence, policy violation, or personal misconduct."
        }

    if has_malice:
        return {
            "isInvalid": True,
            "reason": "malice",
            "message": "We can't take this case. Submitting complaints to purposefully make someone suffer, seek personal revenge, or without any objective proof/validations is strictly prohibited under our Ethical Code of Conduct."
        }

    return {"isInvalid": False}

def clean_and_parse_json(text):
    """
    Safely strips formatting and parses a JSON string response from the LLM.
    """
    if not text:
        return None
        
    cleaned = text.strip()
    
    # Strip markdown JSON fences if present
    cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"```$", "", cleaned, flags=re.IGNORECASE).strip()
    
    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        # Fallback: Find matching boundaries of the JSON object
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1:
            try:
                return json.loads(cleaned[start_idx:end_idx + 1], strict=False)
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Failed to parse JSON content from: {text}")

