using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59AuditLogs")]
    public class AuditLog
    {
        [DynamoDBHashKey]
        public string LogID { get; set; } = string.Empty;

        public string ActorID { get; set; } = string.Empty;

        public string ActorRole { get; set; } = string.Empty;

        public string? ActorName { get; set; }

        public string Action { get; set; } = string.Empty;

        public string EntityType { get; set; } = string.Empty;

        public string EntityID { get; set; } = string.Empty;

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        public string Timestamp { get; set; } = string.Empty;

        public string IPAddress { get; set; } = string.Empty;

        public string? UserAgent { get; set; }

        public long TTL { get; set; }
    }
}
