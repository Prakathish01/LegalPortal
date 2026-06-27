namespace LegalPortal.API.DTOs
{
    public class UpdateCaseStatusDto
    {
        public int CaseID { get; set; }
        public string NewStatus { get; set; } = string.Empty;
        public int ActorUserID { get; set; }
    }
}
