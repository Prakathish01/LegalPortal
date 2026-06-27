using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59PolicyDocuments")]
    public class PolicyDocument
    {
        [DynamoDBHashKey]
        public string DocumentID { get; set; } = string.Empty;

        public string DocumentName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string S3Key { get; set; } = string.Empty;

        public long FileSizeBytes { get; set; }

        public string IngestionStatus { get; set; } = string.Empty;

        public string IngestionJobID { get; set; } = string.Empty;

        public int? ChunkCount { get; set; }

        public string UploadedByAdminID { get; set; } = string.Empty;

        public string UploadedAt { get; set; } = string.Empty;

        public string? LastSyncedAt { get; set; }

        public bool IsActive { get; set; }
    }
}
