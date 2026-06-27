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

            // 1. Initialize DynamoDB Client with Region fallback
            var regionName = Environment.GetEnvironmentVariable("AWS_REGION") ?? "eu-west-1";
            var region = Amazon.RegionEndpoint.GetBySystemName(regionName);
            var client = new AmazonDynamoDBClient(region);
            var context = new DynamoDBContext(client);

            // 2. Define Tables to Create
            var tables = new List<(string Name, string HashKey, string HashKeyType)>
            {
                (TableSettings.RolesTable, "RoleID", "String"),
                (TableSettings.UsersTable, "UserID", "String"),
                (TableSettings.OfficialsTable, "StaffID", "String"),
                (TableSettings.CasesTable, "CaseID", "String"),
                (TableSettings.CategoriesTable, "CategoryID", "String"),
                (TableSettings.CommentsTable, "CommentID", "String"),
                (TableSettings.CaseAssignmentsTable, "AssignmentID", "String"),
                (TableSettings.CaseStatusHistoryTable, "HistoryID", "String"),
                (TableSettings.AttachmentsTable, "AttachmentID", "String"),
                (TableSettings.NotificationsTable, "NotificationID", "String"),
                (TableSettings.WhistleblowerReportsTable, "ReportID", "String"),
                (TableSettings.CountersTable, "SequenceName", "String"),
                (TableSettings.CaseMessagesTable, "MessageID", "String"),
                (TableSettings.CaseDocumentRequestsTable, "RequestID", "String"),
                (TableSettings.SlaConfigTable, "CategoryID", "String"),
                (TableSettings.AuditLogsTable, "LogID", "String"),
                (TableSettings.RefreshTokensTable, "TokenHash", "String")
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

            // 3. Create Tables
            foreach (var table in tables)
            {
                await CreateTableIfNotExistsAsync(client, table.Name, table.HashKey, table.HashKeyType);
            }

            // 4. Wait for tables to become ACTIVE
            foreach (var table in tables)
            {
                await WaitForTableActiveAsync(client, table.Name);
            }

            // 5. Locate grievanceData.json
            string jsonPath = ResolveSeedJsonPath();
            if (string.IsNullOrEmpty(jsonPath))
            {
                Console.WriteLine("ERROR: Could not find grievanceData.json in the workspace.");
                return;
            }
            Console.WriteLine($"Found seed data at: {jsonPath}");

            // 6. Parse Seed Data
            var jsonContent = File.ReadAllText(jsonPath);
            var seedData = JsonSerializer.Deserialize<SeedDataModel>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (seedData == null)
            {
                Console.WriteLine("ERROR: Failed to deserialize grievanceData.json.");
                return;
            }

            string officialsJsonPath = jsonPath.Replace("grievanceData.json", "officials.json");
            if (File.Exists(officialsJsonPath))
            {
                var officialsContent = File.ReadAllText(officialsJsonPath);
                var officials = JsonSerializer.Deserialize<List<Official>>(officialsContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                seedData.Officials = officials;
                Console.WriteLine($"Found officials seed data at: {officialsJsonPath}");
            }

            // 7. Seed Tables
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
                string testPasswordHash = PasswordHasher.HashPassword("password123");
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
                string testPasswordHash = PasswordHasher.HashPassword("password123");
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

            // 8. Seed Sequence Counters
            Console.WriteLine("\nInitializing sequence counters...");
            var countersConfig = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CountersTable };
            
            var counterSeeds = new List<SequenceCounter>
            {
                new SequenceCounter { SequenceName = "RoleID", CurrentValue = seedData.Roles != null && seedData.Roles.Any() ? seedData.Roles.Max(x => x.RoleID) : 10 },
                new SequenceCounter { SequenceName = "UserID", CurrentValue = seedData.Users != null && seedData.Users.Any() ? seedData.Users.Max(x => x.UserID) : 50 },
                new SequenceCounter { SequenceName = "OfficialID", CurrentValue = seedData.Officials != null && seedData.Officials.Any() ? seedData.Officials.Max(x => x.OfficialID) : 50 },
                new SequenceCounter { SequenceName = "CaseID", CurrentValue = seedData.Cases != null && seedData.Cases.Any() ? seedData.Cases.Max(x => x.CaseID) : 100 },
                new SequenceCounter { SequenceName = "CategoryID", CurrentValue = seedData.Categories != null && seedData.Categories.Any() ? seedData.Categories.Max(x => x.CategoryID) : 20 },
                new SequenceCounter { SequenceName = "CommentID", CurrentValue = seedData.Comments != null && seedData.Comments.Any() ? seedData.Comments.Max(x => x.CommentID) : 100 },
                new SequenceCounter { SequenceName = "AttachmentID", CurrentValue = seedData.Attachments != null && seedData.Attachments.Any() ? seedData.Attachments.Max(x => x.AttachmentID) : 100 },
                new SequenceCounter { SequenceName = "NotificationID", CurrentValue = seedData.Notifications != null && seedData.Notifications.Any() ? seedData.Notifications.Max(x => x.NotificationID) : 100 },
                new SequenceCounter { SequenceName = "ReportID", CurrentValue = seedData.WhistleblowerReports != null && seedData.WhistleblowerReports.Any() ? seedData.WhistleblowerReports.Max(x => x.ReportID) : 20 }
            };

            foreach (var counter in counterSeeds)
            {
                await context.SaveAsync(counter, countersConfig);
                Console.WriteLine($"Sequence counter '{counter.SequenceName}' initialized to {counter.CurrentValue}.");
            }

            // 9. Fetch and Print API Gateway Endpoint
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
                Console.WriteLine($"Table '{tableName}' already exists. Status: {description.Table.TableStatus}");
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
                        new AttributeDefinition(hashKeyName, hashKeyType == "Number" ? ScalarAttributeType.N : ScalarAttributeType.S)
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
                var newPath = Path.Combine(currentDir, "frontend", "src", "data", "grievanceData.json");
                if (File.Exists(newPath))
                {
                    return newPath;
                }
                var testPath = Path.Combine(currentDir, "src", "data", "grievanceData.json");
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
        public List<Role>? Roles { get; set; }
        public List<User>? Users { get; set; }
        public List<Category>? Categories { get; set; }
        public List<Case>? Cases { get; set; }
        public List<CaseAssignment>? CaseAssignments { get; set; }
        public List<Comment>? Comments { get; set; }
        public List<Attachment>? Attachments { get; set; }
        public List<Notification>? Notifications { get; set; }
        public List<CaseStatusHistory>? CaseStatusHistory { get; set; }
        public List<WhistleblowerReport>? WhistleblowerReports { get; set; }
        public List<Official>? Officials { get; set; }
    }
}
