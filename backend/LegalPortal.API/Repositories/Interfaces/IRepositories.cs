using System.Collections.Generic;
using System.Threading.Tasks;
using LegalPortal.API.Models;

namespace LegalPortal.API.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<Role?> GetByIdAsync(string roleId);
        Task<List<Role>> GetAllAsync();
        Task SaveAsync(Role role);
    }

    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(string userId);
        Task<User?> GetByEmployeeIdAsync(string employeeId);
        Task<User?> GetByEmailAsync(string email);
        Task<List<User>> GetAllAsync();
        Task SaveAsync(User user);
        Task DeleteAsync(string userId);
    }

    public interface IOfficialRepository
    {
        Task<Official?> GetByIdAsync(string officialId);
        Task<Official?> GetByStaffIDAsync(string staffId);
        Task<Official?> GetByEmailAsync(string email);
        Task<List<Official>> GetAllAsync();
        Task SaveAsync(Official official);
        Task DeleteAsync(string staffId);
    }

    public interface ICaseRepository
    {
        Task<Case?> GetByIdAsync(string caseId);
        Task<List<Case>> GetAllAsync();
        Task<List<Case>> GetByUserIdAsync(string userId);
        Task SaveAsync(Case @case);
        Task DeleteAsync(string caseId);
    }

    public interface ICategoryRepository
    {
        Task<Category?> GetByIdAsync(string categoryId);
        Task<List<Category>> GetAllAsync();
        Task SaveAsync(Category category);
        Task DeleteAsync(string categoryId);
    }

    public interface ICommentRepository
    {
        Task<Comment?> GetByIdAsync(string commentId);
        Task<List<Comment>> GetByCaseIdAsync(string caseId);
        Task SaveAsync(Comment comment);
        Task DeleteAsync(string commentId);
    }

    public interface ICaseAssignmentRepository
    {
        Task<CaseAssignment?> GetByIdAsync(string assignmentId);
        Task<CaseAssignment?> GetByCaseIdAsync(string caseId);
        Task<List<CaseAssignment>> GetAllAsync();
        Task SaveAsync(CaseAssignment assignment);
        Task DeleteAsync(string assignmentId);
    }

    public interface ICaseStatusHistoryRepository
    {
        Task<List<CaseStatusHistory>> GetByCaseIdAsync(string caseId);
        Task SaveAsync(CaseStatusHistory history);
    }

    public interface IAttachmentRepository
    {
        Task<Attachment?> GetByIdAsync(string attachmentId);
        Task<List<Attachment>> GetByCaseIdAsync(string caseId);
        Task SaveAsync(Attachment attachment);
        Task DeleteAsync(string attachmentId);
    }

    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(string notificationId);
        Task<List<Notification>> GetByUserIdAsync(string userId);
        Task SaveAsync(Notification notification);
        Task DeleteAsync(string notificationId);
    }

    public interface IWhistleblowerRepository
    {
        Task<WhistleblowerReport?> GetByIdAsync(string reportId);
        Task<WhistleblowerReport?> GetByReferenceNumberAsync(string referenceNumber);
        Task<List<WhistleblowerReport>> GetAllAsync();
        Task SaveAsync(WhistleblowerReport report);
    }

    public interface ICaseMessageRepository
    {
        Task<CaseMessage?> GetByIdAsync(string messageId);
        Task<List<CaseMessage>> GetByCaseIdAsync(string caseId);
        Task SaveAsync(CaseMessage message);
        Task DeleteAsync(string messageId);
    }

    public interface ICaseDocumentRequestRepository
    {
        Task<CaseDocumentRequest?> GetByIdAsync(string requestId);
        Task<List<CaseDocumentRequest>> GetByCaseIdAsync(string caseId);
        Task SaveAsync(CaseDocumentRequest request);
        Task DeleteAsync(string requestId);
    }

    public interface ISlaConfigRepository
    {
        Task<SlaConfig?> GetByConfigIdAsync(string configId);
        Task<SlaConfig?> GetByCategoryIdAsync(string categoryId);
        Task<List<SlaConfig>> GetAllAsync();
        Task SaveAsync(SlaConfig config);
        Task DeleteAsync(string configId);
    }

    public interface IAuditLogRepository
    {
        Task<AuditLog?> GetByIdAsync(string logId);
        Task<List<AuditLog>> GetByActorIdAsync(string actorId);
        Task SaveAsync(AuditLog log);
    }

    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task SaveAsync(RefreshToken token);
        Task DeleteAsync(string tokenHash);
    }

    public interface IEscalationRuleRepository
    {
        Task<EscalationRule?> GetByIdAsync(string ruleId);
        Task<List<EscalationRule>> GetAllAsync();
        Task SaveAsync(EscalationRule rule);
        Task DeleteAsync(string ruleId);
    }

    public interface IAIChatSessionRepository
    {
        Task<AIChatSession?> GetByIdAsync(string sessionId);
        Task<List<AIChatSession>> GetByUserIdAsync(string userId);
        Task SaveAsync(AIChatSession session);
        Task DeleteAsync(string sessionId);
    }

    public interface IAIQueryLogRepository
    {
        Task<AIQueryLog?> GetByIdAsync(string queryId);
        Task<List<AIQueryLog>> GetBySessionIdAsync(string sessionId);
        Task SaveAsync(AIQueryLog log);
    }

    public interface IPolicyDocumentRepository
    {
        Task<PolicyDocument?> GetByIdAsync(string documentId);
        Task<List<PolicyDocument>> GetAllAsync();
        Task SaveAsync(PolicyDocument document);
        Task DeleteAsync(string documentId);
    }

    public interface IHearingRepository
    {
        Task<Hearing?> GetByIdAsync(string hearingId);
        Task<List<Hearing>> GetByCaseIdAsync(string caseId);
        Task SaveAsync(Hearing hearing);
        Task DeleteAsync(string hearingId);
    }

    public interface IICCMemberRepository
    {
        Task<ICCMember?> GetByIdAsync(string memberId);
        Task<List<ICCMember>> GetAllAsync();
        Task SaveAsync(ICCMember member);
        Task DeleteAsync(string memberId);
    }
}
