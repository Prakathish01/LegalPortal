using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Notifications")]
    public class Notification
    {
        [DynamoDBHashKey(typeof(IntToStringConverter))]
        public int NotificationID { get; set; }
        public int UserID { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string CreatedDate { get; set; } = string.Empty;
    }
}
