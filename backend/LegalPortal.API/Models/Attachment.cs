using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Attachments")]
    public class Attachment
    {
        [DynamoDBHashKey(typeof(IntToStringConverter))]
        public int AttachmentID { get; set; }
        public int CaseID { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int UploadedBy { get; set; }
        public string UploadedDate { get; set; } = string.Empty;
    }
}
