namespace LegalPortal.API.DTOs
{
    public class LoginRequest
    {
        public string Identifier { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public int UserID { get; set; }
        public string EmployeeID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int RoleID { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CreatedDate { get; set; } = string.Empty;
        public string PersonType { get; set; } = string.Empty; // "official" or "user"
        public string RoleName { get; set; } = string.Empty;
    }
}
