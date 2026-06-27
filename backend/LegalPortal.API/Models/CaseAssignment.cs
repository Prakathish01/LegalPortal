using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59CaseAssignments")]
    public class CaseAssignment
    {
        [DynamoDBHashKey]
        public string AssignmentID { get; set; } = string.Empty;
        
        public int CaseID { get; set; }
        
        public int OfficialID { get; set; }
        
        public int AssignedByAdminID { get; set; }
        
        public string AssignedAt { get; set; } = string.Empty;

        public string HandoffNotes { get; set; } = string.Empty;

        public int? TransferredFromOfficialID { get; set; }

        [DynamoDBIgnore]
        public int AssignedToUserID 
        { 
            get => OfficialID; 
            set => OfficialID = value; 
        }

        [DynamoDBIgnore]
        public int AssignedByUserID 
        { 
            get => AssignedByAdminID; 
            set => AssignedByAdminID = value; 
        }

        [DynamoDBIgnore]
        public string AssignedDate 
        { 
            get => AssignedAt; 
            set => AssignedAt = value; 
        }
    }
}
