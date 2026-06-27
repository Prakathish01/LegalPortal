using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Notifications")]
    public class Notification
    {
        [DynamoDBHashKey]
        public string NotificationID { get; set; } = string.Empty;

        public string ReceiverID { get; set; } = string.Empty;

        public string ReceiverRole { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public string? CaseID { get; set; }

        public bool IsRead { get; set; }

        public string? ReadAt { get; set; }

        public string CreatedAt { get; set; } = string.Empty;

        public string? ExpiresAt { get; set; }

        [DynamoDBIgnore]
        public string UserID
        {
            get => ReceiverID;
            set => ReceiverID = value;
        }

        [DynamoDBIgnore]
        public string Message
        {
            get => Body;
            set => Body = value;
        }

        [DynamoDBIgnore]
        public string CreatedDate
        {
            get => CreatedAt;
            set => CreatedAt = value;
        }
    }
}
