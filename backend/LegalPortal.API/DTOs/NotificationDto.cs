namespace LegalPortal.API.DTOs
{
    public class NotificationDto
    {
        public string NotificationID { get; set; } = string.Empty;
        public string UserID { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string CreatedDate { get; set; } = string.Empty;
    }

    public class CreateNotificationDto
    {
        public string UserID { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
