using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Comments")]
    public class Comment
    {
        [DynamoDBHashKey]
        public string CommentID { get; set; } = string.Empty;

        public string CaseID { get; set; } = string.Empty;

        public string UserID { get; set; } = string.Empty;

        public string UserRole { get; set; } = string.Empty;

        public string CommentText { get; set; } = string.Empty;

        public bool IsEdited { get; set; }

        public string? EditedAt { get; set; }

        public string CreatedAt { get; set; } = string.Empty;

        [DynamoDBIgnore]
        public string CreatedDate
        {
            get => CreatedAt;
            set => CreatedAt = value;
        }
    }
}
