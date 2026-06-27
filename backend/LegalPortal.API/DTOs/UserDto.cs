namespace LegalPortal.API.DTOs
{
    public class UserDto
    {
        public string UserID { get; set; } = string.Empty;
        public string EmployeeID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string RoleID { get; set; } = string.Empty;
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
        public string RoleID { get; set; } = "Employee";
        public string Status { get; set; } = "Active";
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string RoleID { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Password { get; set; } // Optional password update
    }
}
