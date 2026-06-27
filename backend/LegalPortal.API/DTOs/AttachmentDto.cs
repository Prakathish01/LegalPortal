namespace LegalPortal.API.DTOs
{
    public class AttachmentDto
    {
        public int AttachmentID { get; set; }
        public int CaseID { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int UploadedBy { get; set; }
        public string UploadedByName { get; set; } = string.Empty;
        public string UploadedDate { get; set; } = string.Empty;
    }

    public class CreateAttachmentDto
    {
        public int CaseID { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int UploadedBy { get; set; }
    }
}
