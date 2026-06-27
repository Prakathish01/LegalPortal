using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59CaseMessages")]
    public class CaseMessage
    {
        [DynamoDBHashKey]
        public string MessageID { get; set; } = string.Empty;

        public int CaseID { get; set; }

        public int SenderID { get; set; }

        public string SenderRole { get; set; } = string.Empty;

        public int ReceiverID { get; set; }

        public string Body { get; set; } = string.Empty;

        public string SentAt { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public string? ReadAt { get; set; }

        public bool IsInternal { get; set; }
    }
}
