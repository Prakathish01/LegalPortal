namespace LegalPortal.API.DTOs
{
    public class NotificationDto
    {
        public int NotificationID { get; set; }
        public int UserID { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string CreatedDate { get; set; } = string.Empty;
    }

    public class CreateNotificationDto
    {
        public int UserID { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
