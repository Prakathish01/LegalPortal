using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59CaseDocumentRequests")]
    public class CaseDocumentRequest
    {
        [DynamoDBHashKey]
        public string RequestID { get; set; } = string.Empty;

        public string CaseID { get; set; } = string.Empty;

        public string RequestedByOfficialID { get; set; } = string.Empty;

        public string DocumentType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string DeadlineDate { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string? FulfilledAt { get; set; }

        public string? FulfilledByUserID { get; set; }

        public string? S3Key { get; set; }

        public string? FileName { get; set; }

        public long? FileSizeBytes { get; set; }

        public string CreatedAt { get; set; } = string.Empty;

        public string UpdatedAt { get; set; } = string.Empty;
    }
}
