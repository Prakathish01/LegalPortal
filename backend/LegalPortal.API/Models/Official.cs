using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Officials")]
    public class Official
    {
        [DynamoDBHashKey]
        public string OfficialID { get; set; } = string.Empty;
        
        public string StaffID { get; set; } = string.Empty;
        
        public string FullName { get; set; } = string.Empty;
        
        public string Email { get; set; } = string.Empty;
        
        public string Phone { get; set; } = string.Empty;
        
        public string Department { get; set; } = string.Empty;
        
        public string Designation { get; set; } = string.Empty;
        
        public string RoleID { get; set; } = string.Empty;
        
        public string? Specialization { get; set; }
        
        public string? BarCouncilID { get; set; }
        
        public string Status { get; set; } = string.Empty;
        
        public string JoinedDate { get; set; } = string.Empty;
        
        public string Password { get; set; } = string.Empty;
    }
}
