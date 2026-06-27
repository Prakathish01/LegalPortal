using System.Collections.Generic;
using System.Threading.Tasks;
using LegalPortal.API.DTOs;
using LegalPortal.API.Models;

namespace LegalPortal.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
    }

    public interface IOfficialService
    {
        Task<List<OfficialDto>> GetAllAsync();
        Task<OfficialDto> GetByStaffIdAsync(string staffId);
        Task<OfficialDto> CreateAsync(CreateOfficialDto dto);
        Task<OfficialDto> UpdateAsync(string staffId, UpdateOfficialDto dto);
        Task DeleteAsync(string staffId);
    }

    public interface IUserService
    {
        Task<List<UserDto>> GetAllAsync();
        Task<UserDto> GetByIdAsync(string id);
        Task<UserDto> CreateAsync(CreateUserDto dto);
        Task<UserDto> UpdateAsync(string id, UpdateUserDto dto);
        Task DeleteAsync(string id);
    }

    public interface ICaseService
    {
        Task<List<CaseDto>> GetAllAsync();
        Task<CaseDto> GetByIdAsync(string id);
        Task<CaseDto> CreateAsync(CreateCaseDto dto);
        Task<CaseDto> UpdateAsync(string id, UpdateCaseDto dto);
        Task DeleteAsync(string id);
        Task UpdateStatusAsync(UpdateCaseStatusDto dto);
    }

    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllAsync();
        Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
        Task<CategoryDto> UpdateAsync(string id, UpdateCategoryDto dto);
        Task DeleteAsync(string id);
    }

    public interface ICommentService
    {
        Task<List<CommentDto>> GetByCaseIdAsync(string caseId);
        Task<CommentDto> CreateAsync(CreateCommentDto dto);
        Task DeleteAsync(string commentId);
    }

    public interface IAttachmentService
    {
        Task<List<AttachmentDto>> GetByCaseIdAsync(string caseId);
        Task<AttachmentDto> CreateAsync(CreateAttachmentDto dto);
        Task DeleteAsync(string id);
    }

    public interface ICaseAssignmentService
    {
        Task<List<CaseAssignmentDto>> GetAllAsync();
        Task<CaseAssignmentDto?> GetByCaseIdAsync(string caseId);
        Task<CaseAssignmentDto> CreateAsync(CreateCaseAssignmentDto dto);
        Task<CaseAssignmentDto> UpdateAsync(string assignmentId, UpdateCaseAssignmentDto dto);
    }

    public interface INotificationService
    {
        Task<List<NotificationDto>> GetByUserIdAsync(string userId);
        Task<NotificationDto> CreateAsync(CreateNotificationDto dto);
        Task MarkAsReadAsync(string id);
    }

    public interface IWhistleblowerService
    {
        Task<WhistleblowerReportDto> CreateAsync(CreateWhistleblowerReportDto dto);
        Task<WhistleblowerReportDto> GetByReferenceNumberAsync(string referenceNumber);
        Task<List<WhistleblowerReportDto>> GetAllAsync();
    }

    public interface ICaseMessageService
    {
        Task<CaseMessage> GetByIdAsync(string messageId);
        Task<List<CaseMessage>> GetByCaseIdAsync(string caseId);
        Task<CaseMessage> CreateAsync(CaseMessage message);
        Task DeleteAsync(string messageId);
    }

    public interface ICaseDocumentRequestService
    {
        Task<CaseDocumentRequest> GetByIdAsync(string requestId);
        Task<List<CaseDocumentRequest>> GetByCaseIdAsync(string caseId);
        Task<CaseDocumentRequest> CreateAsync(CaseDocumentRequest request);
        Task<CaseDocumentRequest> UpdateAsync(string requestId, CaseDocumentRequest request);
        Task DeleteAsync(string requestId);
    }

    public interface ISlaConfigService
    {
        Task<SlaConfig?> GetByConfigIdAsync(string configId);
        Task<SlaConfig?> GetByCategoryIdAsync(string categoryId);
        Task<List<SlaConfig>> GetAllAsync();
        Task SaveAsync(SlaConfig config);
        Task DeleteAsync(string configId);
    }

    public interface IAuditLogService
    {
        Task<AuditLog?> GetByIdAsync(string logId);
        Task<List<AuditLog>> GetByActorIdAsync(string actorId);
        Task SaveAsync(AuditLog log);
    }

    public interface IRefreshTokenService
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task SaveAsync(RefreshToken token);
        Task DeleteAsync(string tokenHash);
    }
}
