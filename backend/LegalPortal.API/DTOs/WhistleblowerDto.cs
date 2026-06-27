namespace LegalPortal.API.DTOs
{
    public class WhistleblowerReportDto
    {
        public string ReportID { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string SubmittedDate { get; set; } = string.Empty;
    }

    public class CreateWhistleblowerReportDto
    {
        public string Subject { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
