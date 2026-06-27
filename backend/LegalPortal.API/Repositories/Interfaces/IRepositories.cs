using System.Collections.Generic;
using System.Threading.Tasks;
using LegalPortal.API.Models;

namespace LegalPortal.API.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<Role?> GetByIdAsync(int roleId);
        Task<List<Role>> GetAllAsync();
        Task SaveAsync(Role role);
    }

    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int userId);
        Task<User?> GetByEmployeeIdAsync(string employeeId);
        Task<User?> GetByEmailAsync(string email);
        Task<List<User>> GetAllAsync();
        Task SaveAsync(User user);
        Task DeleteAsync(int userId);
    }

    public interface IOfficialRepository
    {
        Task<Official?> GetByIdAsync(int officialId);
        Task<Official?> GetByStaffIDAsync(string staffId);
        Task<Official?> GetByEmailAsync(string email);
        Task<List<Official>> GetAllAsync();
        Task SaveAsync(Official official);
        Task DeleteAsync(string staffId);
    }

    public interface ICaseRepository
    {
        Task<Case?> GetByIdAsync(int caseId);
        Task<List<Case>> GetAllAsync();
        Task<List<Case>> GetByUserIdAsync(int userId);
        Task SaveAsync(Case @case);
        Task DeleteAsync(int caseId);
    }

    public interface ICategoryRepository
    {
        Task<Category?> GetByIdAsync(int categoryId);
        Task<List<Category>> GetAllAsync();
        Task SaveAsync(Category category);
        Task DeleteAsync(int categoryId);
    }

    public interface ICommentRepository
    {
        Task<Comment?> GetByIdAsync(int commentId);
        Task<List<Comment>> GetByCaseIdAsync(int caseId);
        Task SaveAsync(Comment comment);
        Task DeleteAsync(int commentId);
    }

    public interface ICaseAssignmentRepository
    {
        Task<CaseAssignment?> GetByIdAsync(string assignmentId);
        Task<CaseAssignment?> GetByCaseIdAsync(int caseId);
        Task<List<CaseAssignment>> GetAllAsync();
        Task SaveAsync(CaseAssignment assignment);
        Task DeleteAsync(string assignmentId);
    }

    public interface ICaseStatusHistoryRepository
    {
        Task<List<CaseStatusHistory>> GetByCaseIdAsync(int caseId);
        Task SaveAsync(CaseStatusHistory history);
    }

    public interface IAttachmentRepository
    {
        Task<Attachment?> GetByIdAsync(int attachmentId);
        Task<List<Attachment>> GetByCaseIdAsync(int caseId);
        Task SaveAsync(Attachment attachment);
        Task DeleteAsync(int attachmentId);
    }

    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(int notificationId);
        Task<List<Notification>> GetByUserIdAsync(int userId);
        Task SaveAsync(Notification notification);
        Task DeleteAsync(int notificationId);
    }

    public interface IWhistleblowerRepository
    {
        Task<WhistleblowerReport?> GetByIdAsync(int reportId);
        Task<WhistleblowerReport?> GetByReferenceNumberAsync(string referenceNumber);
        Task<List<WhistleblowerReport>> GetAllAsync();
        Task SaveAsync(WhistleblowerReport report);
    }

    public interface ICaseMessageRepository
    {
        Task<CaseMessage?> GetByIdAsync(string messageId);
        Task<List<CaseMessage>> GetByCaseIdAsync(int caseId);
        Task SaveAsync(CaseMessage message);
        Task DeleteAsync(string messageId);
    }

    public interface ICaseDocumentRequestRepository
    {
        Task<CaseDocumentRequest?> GetByIdAsync(string requestId);
        Task<List<CaseDocumentRequest>> GetByCaseIdAsync(int caseId);
        Task SaveAsync(CaseDocumentRequest request);
        Task DeleteAsync(string requestId);
    }

    public interface ISlaConfigRepository
    {
        Task<SlaConfig?> GetByCategoryIdAsync(int categoryId);
        Task<List<SlaConfig>> GetAllAsync();
        Task SaveAsync(SlaConfig config);
        Task DeleteAsync(int categoryId);
    }

    public interface IAuditLogRepository
    {
        Task<AuditLog?> GetByIdAsync(string logId);
        Task<List<AuditLog>> GetByActorIdAsync(int actorId);
        Task SaveAsync(AuditLog log);
    }

    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task SaveAsync(RefreshToken token);
        Task DeleteAsync(string tokenHash);
    }
}
