namespace LegalPortal.API.Constants
{
    public static class PortalConstants
    {
        public static class Roles
        {
            public const int Admin = 1;
            public const int LegalManager = 2;
            public const int LegalAgent = 3;
            public const int HRManager = 4;
            public const int ICCMember = 5;
            public const int Employee = 6;
            public const int EmpanelledLawyer = 7;
            public const int Auditor = 8;
        }

        public static class CasePriority
        {
            public const string Low = "Low";
            public const string Medium = "Medium";
            public const string High = "High";
            public const string Critical = "Critical";
        }

        public static class CaseStatus
        {
            public const string Open = "Open";
            public const string InProgress = "In Progress";
            public const string UnderReview = "Under Review";
            public const string Closed = "Closed";
        }
        
        public static class WhistleblowerStatus
        {
            public const string Submitted = "Submitted";
            public const string UnderInvestigation = "Under Investigation";
            public const string Closed = "Closed";
        }
    }
}
