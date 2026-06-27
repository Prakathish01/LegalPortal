using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59WhistleblowerReports")]
    public class WhistleblowerReport
    {
        [DynamoDBHashKey]
        public string ReportID { get; set; } = string.Empty;
        
        public string ReferenceNumber { get; set; } = string.Empty;
        
        public string Subject { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string Category { get; set; } = string.Empty;
        
        public string Status { get; set; } = string.Empty;
        
        public string SubmittedDate { get; set; } = string.Empty;
    }
}
