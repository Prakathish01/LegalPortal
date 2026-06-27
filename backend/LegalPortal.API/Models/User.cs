using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Users")]
    public class User
    {
        [DynamoDBHashKey(typeof(IntToStringConverter))]
        public int UserID { get; set; }
        
        public string EmployeeID { get; set; } = string.Empty;
        
        public string FullName { get; set; } = string.Empty;
        
        public string Email { get; set; } = string.Empty;
        
        public string Phone { get; set; } = string.Empty;
        
        public string Department { get; set; } = string.Empty;
        
        public int RoleID { get; set; }
        
        public string Status { get; set; } = string.Empty;
        
        public string CreatedDate { get; set; } = string.Empty;
        
        public string Password { get; set; } = string.Empty;
    }
}
