namespace LegalPortal.API.DTOs
{
    public class CaseDto
    {
        public int CaseID { get; set; }
        public int UserID { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CreatedDate { get; set; } = string.Empty;
        public string? ClosedDate { get; set; }
        public string AssignedToName { get; set; } = string.Empty;
        public int? AssignedToUserID { get; set; }
    }

    public class CreateCaseDto
    {
        public int UserID { get; set; }
        public int CategoryID { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium";
    }

    public class UpdateCaseDto
    {
        public int CategoryID { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
