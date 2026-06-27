namespace LegalPortal.API.DTOs
{
    public class UserDto
    {
        public int UserID { get; set; }
        public string EmployeeID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int RoleID { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CreatedDate { get; set; } = string.Empty;
    }

    public class CreateUserDto
    {
        public string EmployeeID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int RoleID { get; set; } = 6; // Defaults to Employee
        public string Status { get; set; } = "Active";
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int RoleID { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Password { get; set; } // Optional password update
    }
}
