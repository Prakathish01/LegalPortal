using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59WhistleblowerReports")]
    public class WhistleblowerReport
    {
        [DynamoDBHashKey(typeof(IntToStringConverter))]
        public int ReportID { get; set; }
        
        public string ReferenceNumber { get; set; } = string.Empty;
        
        public string Subject { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string Category { get; set; } = string.Empty;
        
        public string Status { get; set; } = string.Empty;
        
        public string SubmittedDate { get; set; } = string.Empty;
    }
}
