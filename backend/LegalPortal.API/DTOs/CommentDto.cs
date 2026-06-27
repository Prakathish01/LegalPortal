namespace LegalPortal.API.DTOs
{
    public class CommentDto
    {
        public string CommentID { get; set; } = string.Empty;
        public string CaseID { get; set; } = string.Empty;
        public string UserID { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public string CreatedDate { get; set; } = string.Empty;
    }

    public class CreateCommentDto
    {
        public string CaseID { get; set; } = string.Empty;
        public string UserID { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
    }
}
