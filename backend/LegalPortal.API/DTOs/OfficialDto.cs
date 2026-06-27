namespace LegalPortal.API.DTOs
{
    public class OfficialDto
    {
        public int OfficialID { get; set; }
        public string StaffID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public int RoleID { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? Specialization { get; set; }
        public string? BarCouncilID { get; set; }
        public string Status { get; set; } = string.Empty;
        public string JoinedDate { get; set; } = string.Empty;
    }

    public class CreateOfficialDto
    {
        public string StaffID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public int RoleID { get; set; }
        public string? Specialization { get; set; }
        public string? BarCouncilID { get; set; }
        public string Status { get; set; } = "Active";
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateOfficialDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public int RoleID { get; set; }
        public string? Specialization { get; set; }
        public string? BarCouncilID { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Password { get; set; } // Optional password update
    }
}
