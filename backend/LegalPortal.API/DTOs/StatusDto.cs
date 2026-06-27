namespace LegalPortal.API.DTOs
{
    public class UpdateCaseStatusDto
    {
        public string CaseID { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public string ActorUserID { get; set; } = string.Empty;
    }
}
