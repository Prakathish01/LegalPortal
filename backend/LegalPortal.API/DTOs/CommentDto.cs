namespace LegalPortal.API.DTOs
{
    public class CommentDto
    {
        public int CommentID { get; set; }
        public int CaseID { get; set; }
        public int UserID { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public string CreatedDate { get; set; } = string.Empty;
    }

    public class CreateCommentDto
    {
        public int CaseID { get; set; }
        public int UserID { get; set; }
        public string CommentText { get; set; } = string.Empty;
    }
}
