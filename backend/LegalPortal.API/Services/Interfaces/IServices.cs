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
        Task<UserDto> GetByIdAsync(int id);
        Task<UserDto> CreateAsync(CreateUserDto dto);
        Task<UserDto> UpdateAsync(int id, UpdateUserDto dto);
        Task DeleteAsync(int id);
    }

    public interface ICaseService
    {
        Task<List<CaseDto>> GetAllAsync();
        Task<CaseDto> GetByIdAsync(int id);
        Task<CaseDto> CreateAsync(CreateCaseDto dto);
        Task<CaseDto> UpdateAsync(int id, UpdateCaseDto dto);
        Task DeleteAsync(int id);
        Task UpdateStatusAsync(UpdateCaseStatusDto dto);
    }

    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllAsync();
        Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
        Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto);
        Task DeleteAsync(int id);
    }

    public interface ICommentService
    {
        Task<List<CommentDto>> GetByCaseIdAsync(int caseId);
        Task<CommentDto> CreateAsync(CreateCommentDto dto);
        Task DeleteAsync(int commentId);
    }

    public interface IAttachmentService
    {
        Task<List<AttachmentDto>> GetByCaseIdAsync(int caseId);
        Task<AttachmentDto> CreateAsync(CreateAttachmentDto dto);
        Task DeleteAsync(int id);
    }

    public interface ICaseAssignmentService
    {
        Task<List<CaseAssignmentDto>> GetAllAsync();
        Task<CaseAssignmentDto?> GetByCaseIdAsync(int caseId);
        Task<CaseAssignmentDto> CreateAsync(CreateCaseAssignmentDto dto);
        Task<CaseAssignmentDto> UpdateAsync(string assignmentId, UpdateCaseAssignmentDto dto);
    }

    public interface INotificationService
    {
        Task<List<NotificationDto>> GetByUserIdAsync(int userId);
        Task<NotificationDto> CreateAsync(CreateNotificationDto dto);
        Task MarkAsReadAsync(int id);
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
        Task<List<CaseMessage>> GetByCaseIdAsync(int caseId);
        Task<CaseMessage> CreateAsync(CaseMessage message);
        Task DeleteAsync(string messageId);
    }

    public interface ICaseDocumentRequestService
    {
        Task<CaseDocumentRequest> GetByIdAsync(string requestId);
        Task<List<CaseDocumentRequest>> GetByCaseIdAsync(int caseId);
        Task<CaseDocumentRequest> CreateAsync(CaseDocumentRequest request);
        Task<CaseDocumentRequest> UpdateAsync(string requestId, CaseDocumentRequest request);
        Task DeleteAsync(string requestId);
    }

    public interface ISlaConfigService
    {
        Task<SlaConfig?> GetByCategoryIdAsync(int categoryId);
        Task<List<SlaConfig>> GetAllAsync();
        Task SaveAsync(SlaConfig config);
        Task DeleteAsync(int categoryId);
    }

    public interface IAuditLogService
    {
        Task<AuditLog?> GetByIdAsync(string logId);
        Task<List<AuditLog>> GetByActorIdAsync(int actorId);
        Task SaveAsync(AuditLog log);
    }

    public interface IRefreshTokenService
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task SaveAsync(RefreshToken token);
        Task DeleteAsync(string tokenHash);
    }
}
