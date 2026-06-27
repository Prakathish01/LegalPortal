using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Hearings")]
    public class Hearing
    {
        [DynamoDBHashKey]
        public string HearingID { get; set; } = string.Empty;

        public string CaseID { get; set; } = string.Empty;

        public string ScheduledDate { get; set; } = string.Empty;

        public string ScheduledTime { get; set; } = string.Empty;

        public int DurationMinutes { get; set; }

        public string Mode { get; set; } = string.Empty;

        public string? Location { get; set; }

        public string? MeetingLink { get; set; }

        public string ScheduledByOfficialID { get; set; } = string.Empty;

        public string AttendeeUserID { get; set; } = string.Empty;

        public string AttendeeOfficialID { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string? Minutes { get; set; }

        public string? OutcomeDocS3Key { get; set; }

        public string CreatedAt { get; set; } = string.Empty;

        public string UpdatedAt { get; set; } = string.Empty;
    }
}
