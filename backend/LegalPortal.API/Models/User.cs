using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Users")]
    public class User
    {
        [DynamoDBHashKey]
        public string UserID { get; set; } = string.Empty;
        
        public string EmployeeID { get; set; } = string.Empty;
        
        public string FullName { get; set; } = string.Empty;
        
        public string Email { get; set; } = string.Empty;
        
        public string Phone { get; set; } = string.Empty;
        
        public string Department { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;
        
        public string RoleID { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;
        
        public string Status { get; set; } = string.Empty;
        
        public string CreatedDate { get; set; } = string.Empty;
        
        public string Password { get; set; } = string.Empty;
    }
}
