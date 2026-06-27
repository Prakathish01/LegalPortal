import os
import json
import boto3
from botocore.exceptions import ClientError

def load_env_file():
    """
    Loads simple KEY=VALUE pairs from the workspace .env file for local scripts.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_root = os.path.dirname(os.path.dirname(base_dir))
    env_path = os.path.join(workspace_root, ".env")
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

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

def find_knowledge_base_details(agent_client):
    """
    Resolves the configured ep59 Knowledge Base ID and its data source.
    """
    kb_id = os.environ.get("BEDROCK_KNOWLEDGE_BASE_ID") or os.environ.get("KNOWLEDGE_BASE_ID")
    ds_id = None

    try:
        if not kb_id:
            kbs_resp = agent_client.list_knowledge_bases(maxResults=50)
            for kb in kbs_resp.get('knowledgeBaseSummaries', []):
                if kb.get('name') == 'ep59-knowledge-base':
                    kb_id = kb.get('knowledgeBaseId')
                    break

        if kb_id:
            ds_resp = agent_client.list_data_sources(knowledgeBaseId=kb_id, maxResults=50)
            for ds in ds_resp.get('dataSourceSummaries', []):
                if ds.get('name') == 'ep59-data-source' or not ds_id:
                    ds_id = ds.get('dataSourceId')
                    if ds.get('name') == 'ep59-data-source':
                        break
    except Exception as e:
        print(f"Error listing Bedrock Knowledge Base resources: {e}")

    return kb_id, ds_id
def main():
    load_env_file()
    print("==================================================")
    print("ep59 RAG Policy Seeder and Sync Utility")
    print("==================================================")

    # 1. Locate companyPolicies.json
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up to backend, then workspace root
    workspace_root = os.path.dirname(os.path.dirname(base_dir))
    policies_path = os.path.join(workspace_root, "frontend", "src", "data", "companyPolicies.json")
    
    if not os.path.exists(policies_path):
        print(f"ERROR: Could not find companyPolicies.json at: {policies_path}")
        return

    print(f"Found policies file at: {policies_path}")
    with open(policies_path, 'r', encoding='utf-8') as f:
        policies = json.load(f)

    # 2. Initialize AWS clients
    region = os.environ.get("AWS_REGION", "eu-west-1")
    s3_client = boto3.client('s3', region_name=region)
    agent_client = boto3.client('bedrock-agent', region_name=region)

    # 3. Resolve S3 Bucket
    bucket_name = find_s3_bucket(s3_client)
    if not bucket_name:
        print("ERROR: Could not find any S3 bucket matching prefix 'ep59-policies-bucket-'.")
        print("Please ensure your CloudFormation/SAM stack is deployed first.")
        return
    
    print(f"Resolved target S3 Bucket: {bucket_name}")

    # 4. Resolve Bedrock Knowledge Base details, if configured
    kb_id, ds_id = find_knowledge_base_details(agent_client)
    if kb_id:
        print(f"Resolved Bedrock Knowledge Base ID: {kb_id}")
    else:
        print("WARNING: No Bedrock Knowledge Base ID was resolved. S3 upload will still complete.")

    if ds_id:
        print(f"Resolved Bedrock Data Source ID: {ds_id}")
    elif kb_id:
        print("WARNING: Knowledge Base found, but no data source was resolved. Ingestion will be skipped.")

    # 5. Compile and upload policies as a single consolidated text file
    print("\nCompiling policies into a single consolidated file...")
    consolidated_text = ""
    for idx, p in enumerate(policies):
        title = p.get('title', 'Unknown Title')
        category = p.get('category', 'General')
        keywords = ", ".join(p.get('keywords', []))
        content = p.get('content', '')

        # Format matches the parsing schema in common_rag.py
        consolidated_text += f"POLICY: {title}\n"
        consolidated_text += f"Category: {category}\n"
        consolidated_text += f"Keywords: {keywords}\n"
        consolidated_text += f"Content:\n{content}\n"
        consolidated_text += "==================================================\n"

    s3_key = "policies/company_policies.txt"
    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=consolidated_text.encode('utf-8'),
            ContentType='text/plain'
        )
        print(f"Successfully compiled and uploaded policies file -> s3://{bucket_name}/{s3_key}")
    except ClientError as e:
        print(f"Failed to upload consolidated policies: {e}")
        return

    if kb_id and ds_id:
        try:
            ingestion = agent_client.start_ingestion_job(
                knowledgeBaseId=kb_id,
                dataSourceId=ds_id
            )
            job = ingestion.get("ingestionJob", {})
            print(f"Started Bedrock KB ingestion job: {job.get('ingestionJobId', 'unknown')}")
        except ClientError as e:
            print(f"Failed to start Bedrock KB ingestion job: {e}")
            return

    print("\nInitialization and seeding completed successfully!")

if __name__ == "__main__":
    main()

