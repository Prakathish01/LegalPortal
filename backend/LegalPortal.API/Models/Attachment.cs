using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Attachments")]
    public class Attachment
    {
        [DynamoDBHashKey]
        public string AttachmentID { get; set; } = string.Empty;

        public string CaseID { get; set; } = string.Empty;

        public string FileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        public string UploadedBy { get; set; } = string.Empty;

        public string UploadedDate { get; set; } = string.Empty;
    }
}
