namespace LegalPortal.API.DTOs
{
    public class CaseAssignmentDto
    {
        public string AssignmentID { get; set; } = string.Empty;
        public string CaseID { get; set; } = string.Empty;
        public string AssignedToUserID { get; set; } = string.Empty;
        public string AssignedToName { get; set; } = string.Empty;
        public string AssignedByUserID { get; set; } = string.Empty;
        public string AssignedByName { get; set; } = string.Empty;
        public string AssignedDate { get; set; } = string.Empty;
    }

    public class CreateCaseAssignmentDto
    {
        public string CaseID { get; set; } = string.Empty;
        public string AssignedToUserID { get; set; } = string.Empty;
        public string AssignedByUserID { get; set; } = string.Empty;
    }

    public class UpdateCaseAssignmentDto
    {
        public string AssignedToUserID { get; set; } = string.Empty;
        public string AssignedByUserID { get; set; } = string.Empty;
    }
}
