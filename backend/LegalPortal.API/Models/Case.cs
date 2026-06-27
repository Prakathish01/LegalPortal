using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Cases")]
    public class Case
    {
        [DynamoDBHashKey]
        public string CaseID { get; set; } = string.Empty;
        
        public string? UserID { get; set; }
        
        public string CategoryID { get; set; } = string.Empty;
        
        public string Subject { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string Priority { get; set; } = string.Empty;
        
        public string Status { get; set; } = string.Empty;
        
        public string CreatedDate { get; set; } = string.Empty;
        
        public string? ClosedDate { get; set; }

        public string? AssignedOfficialID { get; set; }

        public string? AssignedAt { get; set; }

        public string? DueDate { get; set; }

        public int SLADays { get; set; }

        public bool IsAnonymous { get; set; }

        public string? AnonymousTrackingToken { get; set; }

        public string? SLABreachedAt { get; set; }

        public string? WithdrawalReason { get; set; }

        public string? WithdrawnAt { get; set; }

        public string? ClosedBy { get; set; }

        public int? SatisfactionScore { get; set; }

        public string? SatisfactionComment { get; set; }

        public string? Department { get; set; }

        public string? IncidentDate { get; set; }

        public string? UpdatedAt { get; set; }

        public string? ClosedAt { get; set; }
    }
}
