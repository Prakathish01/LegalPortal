using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59CaseMessages")]
    public class CaseMessage
    {
        [DynamoDBHashKey]
        public string MessageID { get; set; } = string.Empty;

        public string CaseID { get; set; } = string.Empty;

        public string SenderID { get; set; } = string.Empty;

        public string SenderRole { get; set; } = string.Empty;

        public string? SenderName { get; set; }

        public string ReceiverID { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public string? AttachmentS3Key { get; set; }

        public string? AttachmentFileName { get; set; }

        public string SentAt { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public string? ReadAt { get; set; }

        public bool IsInternal { get; set; }
    }
}
