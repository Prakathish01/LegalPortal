namespace LegalPortal.API.DTOs
{
    public class CaseDto
    {
        public string CaseID { get; set; } = string.Empty;
        public string? UserID { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string CategoryID { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CreatedDate { get; set; } = string.Empty;
        public string? ClosedDate { get; set; }
        public string AssignedToName { get; set; } = string.Empty;
        public string? AssignedToUserID { get; set; }
    }

    public class CreateCaseDto
    {
        public string? UserID { get; set; }
        public string CategoryID { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium";
    }

    public class UpdateCaseDto
    {
        public string CategoryID { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
