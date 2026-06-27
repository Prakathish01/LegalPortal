using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Comments")]
    public class Comment
    {
        [DynamoDBHashKey(typeof(IntToStringConverter))]
        public int CommentID { get; set; }
        public int CaseID { get; set; }
        public int UserID { get; set; }
        public string CommentText { get; set; } = string.Empty;
        public string CreatedDate { get; set; } = string.Empty;
    }
}
