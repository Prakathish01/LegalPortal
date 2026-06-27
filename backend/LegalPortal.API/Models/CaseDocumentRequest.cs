using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59CaseDocumentRequests")]
    public class CaseDocumentRequest
    {
        [DynamoDBHashKey]
        public string RequestID { get; set; } = string.Empty;

        public int CaseID { get; set; }

        public int RequestedByOfficialID { get; set; }

        public string DocumentType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string DeadlineDate { get; set; } = string.Empty;

        public string? FulfilledAt { get; set; }

        public string? S3Key { get; set; }
    }
}
