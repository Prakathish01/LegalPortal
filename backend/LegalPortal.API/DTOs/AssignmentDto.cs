namespace LegalPortal.API.DTOs
{
    public class CaseAssignmentDto
    {
        public string AssignmentID { get; set; } = string.Empty;
        public int CaseID { get; set; }
        public int AssignedToUserID { get; set; }
        public string AssignedToName { get; set; } = string.Empty;
        public int AssignedByUserID { get; set; }
        public string AssignedByName { get; set; } = string.Empty;
        public string AssignedDate { get; set; } = string.Empty;
    }

    public class CreateCaseAssignmentDto
    {
        public int CaseID { get; set; }
        public int AssignedToUserID { get; set; }
        public int AssignedByUserID { get; set; }
    }

    public class UpdateCaseAssignmentDto
    {
        public int AssignedToUserID { get; set; }
        public int AssignedByUserID { get; set; }
    }
}
