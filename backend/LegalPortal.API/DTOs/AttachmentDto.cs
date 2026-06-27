namespace LegalPortal.API.DTOs
{
    public class AttachmentDto
    {
        public string AttachmentID { get; set; } = string.Empty;
        public string CaseID { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty;
        public string UploadedByName { get; set; } = string.Empty;
        public string UploadedDate { get; set; } = string.Empty;
    }

    public class CreateAttachmentDto
    {
        public string CaseID { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty;
    }
}
