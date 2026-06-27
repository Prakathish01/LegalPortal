using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using LegalPortal.API.Configuration;
using LegalPortal.API.Helpers;
using LegalPortal.API.Models;

namespace LegalPortal.Seeder
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("Legal & Grievance Support Portal - Seeder Utility");
            Console.WriteLine("==================================================");

            // 1. Initialize DynamoDB Client
            var regionName = Environment.GetEnvironmentVariable("AWS_REGION") ?? "eu-west-1";
            var region = Amazon.RegionEndpoint.GetBySystemName(regionName);
            var client = new AmazonDynamoDBClient(region);
            var context = new DynamoDBContext(client);

            // 2. Define All 19 Tables to Create
            var tables = new List<(string Name, string HashKey, string HashKeyType)>
            {
                (TableSettings.RolesTable, "RoleID", "String"),
                (TableSettings.UsersTable, "UserID", "String"),
                (TableSettings.OfficialsTable, "OfficialID", "String"),
                (TableSettings.CasesTable, "CaseID", "String"),
                (TableSettings.CategoriesTable, "CategoryID", "String"),
                (TableSettings.CommentsTable, "CommentID", "String"),
                (TableSettings.CaseAssignmentsTable, "AssignmentID", "String"),
                (TableSettings.CaseStatusHistoryTable, "HistoryID", "String"),
                (TableSettings.AttachmentsTable, "AttachmentID", "String"),
                (TableSettings.NotificationsTable, "NotificationID", "String"),
                (TableSettings.WhistleblowerReportsTable, "ReportID", "String"),
                (TableSettings.CaseMessagesTable, "MessageID", "String"),
                (TableSettings.CaseDocumentRequestsTable, "RequestID", "String"),
                (TableSettings.SlaConfigTable, "ConfigID", "String"),
                (TableSettings.AuditLogsTable, "LogID", "String"),
                (TableSettings.RefreshTokensTable, "TokenHash", "String"),
                (TableSettings.EscalationRulesTable, "RuleID", "String"),
                (TableSettings.AIChatSessionsTable, "SessionID", "String"),
                (TableSettings.AIQueryLogTable, "QueryID", "String"),
                (TableSettings.PolicyDocumentsTable, "DocumentID", "String"),
                (TableSettings.HearingsTable, "HearingID", "String"),
                (TableSettings.ICCMembersTable, "MemberID", "String"),
                (TableSettings.CountersTable, "SequenceName", "String")
            };

            // 3. Diagnostic Key Check for existing tables
            Console.WriteLine("--- Database Key Diagnostics ---");
            foreach (var table in tables)
            {
                try
                {
                    var res = await client.DescribeTableAsync(table.Name);
                    var key = res.Table.KeySchema.FirstOrDefault();
                    var attr = res.Table.AttributeDefinitions.FirstOrDefault(a => a.AttributeName == key.AttributeName);
                    Console.WriteLine($"Table: {table.Name} -> PK: {key?.AttributeName} ({attr?.AttributeType})");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Table: {table.Name} -> Error: {ex.Message}");
                }
            }
            Console.WriteLine("--------------------------------\n");

            // 4. Create Tables (with automatic recreate if partition keys are different)
            foreach (var table in tables)
            {
                await CreateTableIfNotExistsAsync(client, table.Name, table.HashKey, table.HashKeyType);
            }

            // 5. Wait for tables to become ACTIVE
            foreach (var table in tables)
            {
                await WaitForTableActiveAsync(client, table.Name);
            }

            // 6. Locate ep59_dynamodb_seed_data.json
            string jsonPath = ResolveSeedJsonPath();
            if (string.IsNullOrEmpty(jsonPath))
            {
                Console.WriteLine("ERROR: Could not find ep59_dynamodb_seed_data.json in the workspace.");
                return;
            }
            Console.WriteLine($"Found seed data at: {jsonPath}");

            // 7. Parse Seed Data
            var jsonContent = File.ReadAllText(jsonPath);
            var seedData = JsonSerializer.Deserialize<SeedDataModel>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (seedData == null)
            {
                Console.WriteLine("ERROR: Failed to deserialize seed data JSON.");
                return;
            }

            // 8. Seed Tables
            string testPasswordHash = PasswordHasher.HashPassword("password123");

            Console.WriteLine("\nSeeding roles...");
            if (seedData.Roles != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.RolesTable };
                foreach (var item in seedData.Roles)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Roles.Count} roles.");
            }

            Console.WriteLine("\nSeeding categories...");
            if (seedData.Categories != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CategoriesTable };
                foreach (var item in seedData.Categories)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Categories.Count} categories.");
            }

            Console.WriteLine("\nSeeding users with default hashed password ('password123')...");
            if (seedData.Users != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
                foreach (var item in seedData.Users)
                {
                    item.Password = testPasswordHash;
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Users.Count} users.");
            }

            Console.WriteLine("\nSeeding officials with default hashed password ('password123')...");
            if (seedData.Officials != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
                foreach (var item in seedData.Officials)
                {
                    item.Password = testPasswordHash;
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Officials.Count} officials.");
            }

            Console.WriteLine("\nSeeding cases...");
            if (seedData.Cases != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
                foreach (var item in seedData.Cases)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Cases.Count} cases.");
            }

            Console.WriteLine("\nSeeding assignments...");
            if (seedData.CaseAssignments != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseAssignmentsTable };
                foreach (var item in seedData.CaseAssignments)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.CaseAssignments.Count} assignments.");
            }

            Console.WriteLine("\nSeeding comments...");
            if (seedData.Comments != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
                foreach (var item in seedData.Comments)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Comments.Count} comments.");
            }

            Console.WriteLine("\nSeeding attachments...");
            if (seedData.Attachments != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
                foreach (var item in seedData.Attachments)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Attachments.Count} attachments.");
            }

            Console.WriteLine("\nSeeding notifications...");
            if (seedData.Notifications != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
                foreach (var item in seedData.Notifications)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Notifications.Count} notifications.");
            }

            Console.WriteLine("\nSeeding case status histories...");
            if (seedData.CaseStatusHistory != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseStatusHistoryTable };
                foreach (var item in seedData.CaseStatusHistory)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.CaseStatusHistory.Count} case status histories.");
            }

            Console.WriteLine("\nSeeding whistleblower reports...");
            if (seedData.WhistleblowerReports != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.WhistleblowerReportsTable };
                foreach (var item in seedData.WhistleblowerReports)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.WhistleblowerReports.Count} whistleblower reports.");
            }

            Console.WriteLine("\nSeeding case messages...");
            if (seedData.CaseMessages != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseMessagesTable };
                foreach (var item in seedData.CaseMessages)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.CaseMessages.Count} messages.");
            }

            Console.WriteLine("\nSeeding document requests...");
            if (seedData.DocumentRequests != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseDocumentRequestsTable };
                foreach (var item in seedData.DocumentRequests)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.DocumentRequests.Count} document requests.");
            }

            Console.WriteLine("\nSeeding SLA config...");
            if (seedData.SlaConfig != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.SlaConfigTable };
                foreach (var item in seedData.SlaConfig)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.SlaConfig.Count} SLA config items.");
            }

            Console.WriteLine("\nSeeding audit logs...");
            if (seedData.AuditLogs != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AuditLogsTable };
                foreach (var item in seedData.AuditLogs)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.AuditLogs.Count} audit logs.");
            }

            Console.WriteLine("\nSeeding refresh tokens...");
            if (seedData.RefreshTokens != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.RefreshTokensTable };
                foreach (var item in seedData.RefreshTokens)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.RefreshTokens.Count} refresh tokens.");
            }

            Console.WriteLine("\nSeeding escalation rules...");
            if (seedData.EscalationRules != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.EscalationRulesTable };
                foreach (var item in seedData.EscalationRules)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.EscalationRules.Count} escalation rules.");
            }

            Console.WriteLine("\nSeeding AI chat sessions...");
            if (seedData.AIChatSessions != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIChatSessionsTable };
                foreach (var item in seedData.AIChatSessions)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.AIChatSessions.Count} AI chat sessions.");
            }

            Console.WriteLine("\nSeeding AI query logs...");
            if (seedData.AIQueryLogs != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIQueryLogTable };
                foreach (var item in seedData.AIQueryLogs)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.AIQueryLogs.Count} AI query logs.");
            }

            Console.WriteLine("\nSeeding policy documents...");
            if (seedData.PolicyDocuments != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.PolicyDocumentsTable };
                foreach (var item in seedData.PolicyDocuments)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.PolicyDocuments.Count} policy documents.");
            }

            Console.WriteLine("\nSeeding hearings...");
            if (seedData.Hearings != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.HearingsTable };
                foreach (var item in seedData.Hearings)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.Hearings.Count} hearings.");
            }

            Console.WriteLine("\nSeeding ICC members...");
            if (seedData.ICCMembers != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.ICCMembersTable };
                foreach (var item in seedData.ICCMembers)
                {
                    await context.SaveAsync(item, config);
                }
                Console.WriteLine($"Seeded {seedData.ICCMembers.Count} ICC members.");
            }

            // 9. Seed Sequence Counters
            Console.WriteLine("\nInitializing sequence counters...");
            var countersConfig = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CountersTable };
            var counterSeeds = new List<SequenceCounter>
            {
                new SequenceCounter { SequenceName = "RoleID", CurrentValue = 100 },
                new SequenceCounter { SequenceName = "UserID", CurrentValue = 100 },
                new SequenceCounter { SequenceName = "OfficialID", CurrentValue = 100 },
                new SequenceCounter { SequenceName = "CaseID", CurrentValue = 100 },
                new SequenceCounter { SequenceName = "CategoryID", CurrentValue = 100 },
                new SequenceCounter { SequenceName = "CommentID", CurrentValue = 100 },
                new SequenceCounter { SequenceName = "AttachmentID", CurrentValue = 100 },
                new SequenceCounter { SequenceName = "NotificationID", CurrentValue = 100 },
                new SequenceCounter { SequenceName = "ReportID", CurrentValue = 100 }
            };

            foreach (var counter in counterSeeds)
            {
                await context.SaveAsync(counter, countersConfig);
                Console.WriteLine($"Sequence counter '{counter.SequenceName}' initialized to {counter.CurrentValue}.");
            }

            // 10. Fetch and Print API Gateway Endpoint
            try
            {
                var apigwClient = new Amazon.APIGateway.AmazonAPIGatewayClient(region);
                var apis = await apigwClient.GetRestApisAsync(new Amazon.APIGateway.Model.GetRestApisRequest());
                var api = apis.Items.FirstOrDefault(a => a.Name.Contains("ep59-legal-portal-backend-stack"));
                if (api != null)
                {
                    Console.WriteLine("\n==================================================");
                    Console.WriteLine("API Gateway Endpoint Details:");
                    Console.WriteLine($"API Name: {api.Name}");
                    Console.WriteLine($"API ID: {api.Id}");
                    Console.WriteLine($"Base URL: https://{api.Id}.execute-api.{regionName}.amazonaws.com/Prod");
                    Console.WriteLine("==================================================");
                }
                else
                {
                    Console.WriteLine("\nCould not find stack's API Gateway REST API. Deployed REST APIs found:");
                    foreach (var item in apis.Items)
                    {
                        Console.WriteLine($"- {item.Name} ({item.Id})");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nCould not fetch API Gateway endpoint: {ex.Message}");
            }

            Console.WriteLine("\n==================================================");
            Console.WriteLine("Database seeding completed successfully!");
            Console.WriteLine("==================================================");
        }

        private static async Task CreateTableIfNotExistsAsync(IAmazonDynamoDB client, string tableName, string hashKeyName, string hashKeyType)
        {
            try
            {
                var description = await client.DescribeTableAsync(tableName);
                var existingHashKey = description.Table.KeySchema.FirstOrDefault(k => k.KeyType == KeyType.HASH)?.AttributeName;
                
                if (existingHashKey != hashKeyName)
                {
                    Console.WriteLine($"WARNING: Table '{tableName}' has PK '{existingHashKey}' but expected '{hashKeyName}'. Deleting table to recreate...");
                    await client.DeleteTableAsync(tableName);
                    
                    Console.WriteLine($"Waiting for table '{tableName}' to be deleted...");
                    while (true)
                    {
                        try
                        {
                            await client.DescribeTableAsync(tableName);
                            await Task.Delay(1000);
                        }
                        catch (ResourceNotFoundException)
                        {
                            break;
                        }
                    }
                    Console.WriteLine($"Table '{tableName}' deleted. Recreating...");
                    throw new ResourceNotFoundException("Trigger recreate");
                }

                Console.WriteLine($"Table '{tableName}' already exists with correct PK '{hashKeyName}'. Status: {description.Table.TableStatus}");
                return;
            }
            catch (ResourceNotFoundException)
            {
                Console.WriteLine($"Creating table '{tableName}'...");
                var request = new CreateTableRequest
                {
                    TableName = tableName,
                    KeySchema = new List<KeySchemaElement>
                    {
                        new KeySchemaElement(hashKeyName, KeyType.HASH)
                    },
                    AttributeDefinitions = new List<AttributeDefinition>
                    {
                        new AttributeDefinition(hashKeyName, ScalarAttributeType.S)
                    },
                    ProvisionedThroughput = new ProvisionedThroughput
                    {
                        ReadCapacityUnits = 5,
                        WriteCapacityUnits = 5
                    }
                };
                await client.CreateTableAsync(request);
                Console.WriteLine($"Table '{tableName}' creation request sent.");
            }
        }

        private static async Task WaitForTableActiveAsync(IAmazonDynamoDB client, string tableName)
        {
            Console.WriteLine($"Waiting for table '{tableName}' to become ACTIVE...");
            while (true)
            {
                try
                {
                    var res = await client.DescribeTableAsync(tableName);
                    if (res.Table.TableStatus == TableStatus.ACTIVE)
                    {
                        Console.WriteLine($"Table '{tableName}' is ACTIVE.");
                        break;
                    }
                }
                catch (Exception)
                {
                    // Catch transient exceptions during describe
                }
                await Task.Delay(1000);
            }
        }

        private static string ResolveSeedJsonPath()
        {
            string currentDir = Directory.GetCurrentDirectory();
            while (!string.IsNullOrEmpty(currentDir))
            {
                var newPath = Path.Combine(currentDir, "frontend", "src", "data", "ep59_dynamodb_seed_data.json");
                if (File.Exists(newPath))
                {
                    return newPath;
                }
                var testPath = Path.Combine(currentDir, "src", "data", "ep59_dynamodb_seed_data.json");
                if (File.Exists(testPath))
                {
                    return testPath;
                }
                currentDir = Path.GetDirectoryName(currentDir) ?? string.Empty;
            }
            return string.Empty;
        }
    }

    public class SeedDataModel
    {
        [System.Text.Json.Serialization.JsonPropertyName("ep59_Roles")]
        public List<Role>? Roles { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_Users")]
        public List<User>? Users { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_Categories")]
        public List<Category>? Categories { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_Cases")]
        public List<Case>? Cases { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_CaseAssignments")]
        public List<CaseAssignment>? CaseAssignments { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_CaseComments")]
        public List<Comment>? Comments { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_Attachments")]
        public List<Attachment>? Attachments { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_Notifications")]
        public List<Notification>? Notifications { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_CaseStatusHistory")]
        public List<CaseStatusHistory>? CaseStatusHistory { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_WhistleblowerReports")]
        public List<WhistleblowerReport>? WhistleblowerReports { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_Officials")]
        public List<Official>? Officials { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_CaseMessages")]
        public List<CaseMessage>? CaseMessages { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_DocumentRequests")]
        public List<CaseDocumentRequest>? DocumentRequests { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_SLAConfig")]
        public List<SlaConfig>? SlaConfig { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_AuditLog")]
        public List<AuditLog>? AuditLogs { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_RefreshTokens")]
        public List<RefreshToken>? RefreshTokens { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_EscalationRules")]
        public List<EscalationRule>? EscalationRules { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_AIChatSessions")]
        public List<AIChatSession>? AIChatSessions { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_AIQueryLog")]
        public List<AIQueryLog>? AIQueryLogs { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_PolicyDocuments")]
        public List<PolicyDocument>? PolicyDocuments { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_Hearings")]
        public List<Hearing>? Hearings { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("ep59_ICCMembers")]
        public List<ICCMember>? ICCMembers { get; set; }
    }
}
