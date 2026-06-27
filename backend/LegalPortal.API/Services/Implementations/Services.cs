using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LegalPortal.API.DTOs;
using LegalPortal.API.Exceptions;
using LegalPortal.API.Helpers;
using LegalPortal.API.Models;
using LegalPortal.API.Repositories.Interfaces;
using LegalPortal.API.Services.Interfaces;

namespace LegalPortal.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IOfficialRepository _officialRepository;
        private readonly IUserRepository _userRepository;

        public AuthService(IOfficialRepository officialRepository, IUserRepository userRepository)
        {
            _officialRepository = officialRepository;
            _userRepository = userRepository;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Identifier) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ValidationException("Identifier and Password are required.");
            }

            // 1. Try Authenticating against Officials
            var official = await _officialRepository.GetByStaffIDAsync(request.Identifier);
            if (official == null)
            {
                official = await _officialRepository.GetByEmailAsync(request.Identifier);
            }

            if (official != null)
            {
                if (!PasswordHasher.VerifyPassword(request.Password, official.Password))
                {
                    throw new UnauthorizedException("Incorrect password.");
                }

                if (official.Status != "Active")
                {
                    throw new ForbiddenException("This account is inactive. Contact the Legal Operations team.");
                }

                return new LoginResponse
                {
                    UserID = official.OfficialID,
                    EmployeeID = official.StaffID,
                    FullName = official.FullName,
                    Email = official.Email,
                    Phone = official.Phone,
                    Department = official.Department,
                    RoleID = official.RoleID,
                    Status = official.Status,
                    CreatedDate = official.JoinedDate,
                    PersonType = "official",
                    RoleName = ResolveRoleName(official.RoleID)
                };
            }

            // 2. Try Authenticating against Users
            var user = await _userRepository.GetByEmployeeIdAsync(request.Identifier);
            if (user == null)
            {
                user = await _userRepository.GetByEmailAsync(request.Identifier);
            }

            if (user != null)
            {
                if (!PasswordHasher.VerifyPassword(request.Password, user.Password))
                {
                    throw new UnauthorizedException("Incorrect password.");
                }

                if (user.Status != "Active")
                {
                    throw new ForbiddenException("This account is inactive. Contact HR/Admin.");
                }

                return new LoginResponse
                {
                    UserID = user.UserID,
                    EmployeeID = user.EmployeeID,
                    FullName = user.FullName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Department = user.Department,
                    RoleID = user.RoleID,
                    Status = user.Status,
                    CreatedDate = user.CreatedDate,
                    PersonType = "user",
                    RoleName = ResolveRoleName(user.RoleID)
                };
            }

            throw new UnauthorizedException("No account found for that Employee ID / Staff ID / Email.");
        }

        private static string ResolveRoleName(string roleId)
        {
            if (string.IsNullOrEmpty(roleId)) return "Unknown";
            string normalized = roleId.Replace("_", " ").ToUpper();
            return normalized switch
            {
                "ADMIN" => "Admin",
                "ICC_PRESIDING_OFFICER" => "ICC Presiding Officer",
                "EMPANELLED_LAWYER" => "Empanelled Lawyer",
                "EMPLOYEE" => "Employee",
                "HR_MANAGER" => "HR Manager",
                _ => normalized
            };
        }
    }

    public class OfficialService : IOfficialService
    {
        private readonly IOfficialRepository _officialRepository;

        public OfficialService(IOfficialRepository officialRepository)
        {
            _officialRepository = officialRepository;
        }

        public async Task<List<OfficialDto>> GetAllAsync()
        {
            var officials = await _officialRepository.GetAllAsync();
            return officials.Select(MapToDto).ToList();
        }

        public async Task<OfficialDto> GetByStaffIdAsync(string staffId)
        {
            var official = await _officialRepository.GetByStaffIDAsync(staffId);
            if (official == null) throw new NotFoundException($"Official with Staff ID {staffId} not found.");
            return MapToDto(official);
        }

        public async Task<OfficialDto> CreateAsync(CreateOfficialDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.StaffID) || string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
            {
                throw new ValidationException("Staff ID, Full Name, and Email are required.");
            }

            var existing = await _officialRepository.GetByStaffIDAsync(dto.StaffID);
            if (existing != null) throw new ValidationException($"Official with Staff ID {dto.StaffID} already exists.");

            string id = $"OFF-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
            var official = new Official
            {
                OfficialID = id,
                StaffID = dto.StaffID,
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Department = dto.Department,
                Designation = dto.Designation,
                RoleID = dto.RoleID,
                Specialization = dto.Specialization,
                BarCouncilID = dto.BarCouncilID,
                Status = dto.Status,
                JoinedDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Password = PasswordHasher.HashPassword(dto.Password)
            };

            await _officialRepository.SaveAsync(official);
            return MapToDto(official);
        }

        public async Task<OfficialDto> UpdateAsync(string staffId, UpdateOfficialDto dto)
        {
            var official = await _officialRepository.GetByStaffIDAsync(staffId);
            if (official == null) throw new NotFoundException($"Official with Staff ID {staffId} not found.");

            official.FullName = dto.FullName;
            official.Email = dto.Email;
            official.Phone = dto.Phone;
            official.Department = dto.Department;
            official.Designation = dto.Designation;
            official.RoleID = dto.RoleID;
            official.Specialization = dto.Specialization;
            official.BarCouncilID = dto.BarCouncilID;
            official.Status = dto.Status;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                official.Password = PasswordHasher.HashPassword(dto.Password);
            }

            await _officialRepository.SaveAsync(official);
            return MapToDto(official);
        }

        public async Task DeleteAsync(string staffId)
        {
            var official = await _officialRepository.GetByStaffIDAsync(staffId);
            if (official == null) throw new NotFoundException($"Official with Staff ID {staffId} not found.");
            await _officialRepository.DeleteAsync(staffId);
        }

        private static OfficialDto MapToDto(Official official)
        {
            return new OfficialDto
            {
                OfficialID = official.OfficialID,
                StaffID = official.StaffID,
                FullName = official.FullName,
                Email = official.Email,
                Phone = official.Phone,
                Department = official.Department,
                Designation = official.Designation,
                RoleID = official.RoleID,
                RoleName = ResolveRoleName(official.RoleID),
                Specialization = official.Specialization,
                BarCouncilID = official.BarCouncilID,
                Status = official.Status,
                JoinedDate = official.JoinedDate
            };
        }

        private static string ResolveRoleName(string roleId)
        {
            if (string.IsNullOrEmpty(roleId)) return "Unknown";
            string normalized = roleId.Replace("_", " ").ToUpper();
            return normalized switch
            {
                "ADMIN" => "Admin",
                "ICC_PRESIDING_OFFICER" => "ICC Presiding Officer",
                "EMPANELLED_LAWYER" => "Empanelled Lawyer",
                "EMPLOYEE" => "Employee",
                "HR_MANAGER" => "HR Manager",
                _ => normalized
            };
        }
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<List<UserDto>> GetAllAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(MapToDto).ToList();
        }

        public async Task<UserDto> GetByIdAsync(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) throw new NotFoundException($"User with ID {id} not found.");
            return MapToDto(user);
        }

        public async Task<UserDto> CreateAsync(CreateUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.EmployeeID) || string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
            {
                throw new ValidationException("Employee ID, Full Name, and Email are required.");
            }

            var existing = await _userRepository.GetByEmployeeIdAsync(dto.EmployeeID);
            if (existing != null) throw new ValidationException($"User with Employee ID {dto.EmployeeID} already exists.");

            string id = $"USR-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
            var user = new User
            {
                UserID = id,
                EmployeeID = dto.EmployeeID,
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Department = dto.Department,
                RoleID = dto.RoleID,
                Status = dto.Status,
                CreatedDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                Password = PasswordHasher.HashPassword(dto.Password)
            };

            await _userRepository.SaveAsync(user);
            return MapToDto(user);
        }

        public async Task<UserDto> UpdateAsync(string id, UpdateUserDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) throw new NotFoundException($"User with ID {id} not found.");

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Phone = dto.Phone;
            user.Department = dto.Department;
            user.RoleID = dto.RoleID;
            user.Status = dto.Status;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.Password = PasswordHasher.HashPassword(dto.Password);
            }

            await _userRepository.SaveAsync(user);
            return MapToDto(user);
        }

        public async Task DeleteAsync(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) throw new NotFoundException($"User with ID {id} not found.");
            await _userRepository.DeleteAsync(id);
        }

        private static UserDto MapToDto(User user)
        {
            return new UserDto
            {
                UserID = user.UserID,
                EmployeeID = user.EmployeeID,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Department = user.Department,
                RoleID = user.RoleID,
                RoleName = ResolveRoleName(user.RoleID),
                Status = user.Status,
                CreatedDate = user.CreatedDate
            };
        }

        private static string ResolveRoleName(string roleId)
        {
            if (string.IsNullOrEmpty(roleId)) return "Unknown";
            string normalized = roleId.Replace("_", " ").ToUpper();
            return normalized switch
            {
                "ADMIN" => "Admin",
                "ICC_PRESIDING_OFFICER" => "ICC Presiding Officer",
                "EMPANELLED_LAWYER" => "Empanelled Lawyer",
                "EMPLOYEE" => "Employee",
                "HR_MANAGER" => "HR Manager",
                _ => normalized
            };
        }
    }

    public class CaseService : ICaseService
    {
        private readonly ICaseRepository _caseRepository;
        private readonly IUserRepository _userRepository;
        private readonly IOfficialRepository _officialRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ICaseAssignmentRepository _assignmentRepository;
        private readonly ICaseStatusHistoryRepository _statusHistoryRepository;
        private readonly INotificationRepository _notificationRepository;

        public CaseService(
            ICaseRepository caseRepository,
            IUserRepository userRepository,
            IOfficialRepository officialRepository,
            ICategoryRepository categoryRepository,
            ICaseAssignmentRepository assignmentRepository,
            ICaseStatusHistoryRepository statusHistoryRepository,
            INotificationRepository notificationRepository)
        {
            _caseRepository = caseRepository;
            _userRepository = userRepository;
            _officialRepository = officialRepository;
            _categoryRepository = categoryRepository;
            _assignmentRepository = assignmentRepository;
            _statusHistoryRepository = statusHistoryRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<List<CaseDto>> GetAllAsync()
        {
            var cases = await _caseRepository.GetAllAsync();
            var dtos = new List<CaseDto>();
            foreach (var c in cases)
            {
                dtos.Add(await MapToDtoAsync(c));
            }
            return dtos;
        }

        public async Task<CaseDto> GetByIdAsync(string id)
        {
            var @case = await _caseRepository.GetByIdAsync(id);
            if (@case == null) throw new NotFoundException($"Case with ID {id} not found.");
            return await MapToDtoAsync(@case);
        }

        public async Task<CaseDto> CreateAsync(CreateCaseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Subject) || string.IsNullOrWhiteSpace(dto.Description))
            {
                throw new ValidationException("Subject and Description are required.");
            }

            string id = $"CASE-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
            var @case = new Case
            {
                CaseID = id,
                UserID = dto.UserID,
                CategoryID = dto.CategoryID,
                Subject = dto.Subject,
                Description = dto.Description,
                Priority = dto.Priority,
                Status = Constants.PortalConstants.CaseStatus.Open,
                CreatedDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                ClosedDate = null
            };

            await _caseRepository.SaveAsync(@case);

            // Log status history (creation)
            var history = new CaseStatusHistory
            {
                HistoryID = Guid.NewGuid().ToString(),
                CaseID = id,
                OldStatus = null,
                NewStatus = Constants.PortalConstants.CaseStatus.Open,
                ChangedByUserID = dto.UserID ?? "Anonymous",
                ChangedByRole = "Employee",
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                Notes = "Case filed initially."
            };
            await _statusHistoryRepository.SaveAsync(history);

            // Create notification
            if (!string.IsNullOrEmpty(dto.UserID))
            {
                string notifId = $"NOTIF-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
                var notif = new Notification
                {
                    NotificationID = notifId,
                    ReceiverID = dto.UserID,
                    ReceiverRole = "Employee",
                    Type = "CASE_STATUS_CHANGED",
                    Title = "Case Filed Successfully",
                    Body = $"Your new case #{id} (\"{dto.Subject.Substring(0, Math.Min(30, dto.Subject.Length))}...\") has been successfully filed.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                };
                await _notificationRepository.SaveAsync(notif);
            }

            return await MapToDtoAsync(@case);
        }

        public async Task<CaseDto> UpdateAsync(string id, UpdateCaseDto dto)
        {
            var @case = await _caseRepository.GetByIdAsync(id);
            if (@case == null) throw new NotFoundException($"Case with ID {id} not found.");

            @case.CategoryID = dto.CategoryID;
            @case.Subject = dto.Subject;
            @case.Description = dto.Description;
            @case.Priority = dto.Priority;

            if (@case.Status != dto.Status && !string.IsNullOrEmpty(dto.Status))
            {
                // Trigger status update logic
                var statusDto = new UpdateCaseStatusDto
                {
                    CaseID = id,
                    NewStatus = dto.Status,
                    ActorUserID = @case.UserID ?? "System"
                };
                await UpdateStatusAsync(statusDto);
            }
            else
            {
                await _caseRepository.SaveAsync(@case);
            }

            return await MapToDtoAsync(@case);
        }

        public async Task DeleteAsync(string id)
        {
            var @case = await _caseRepository.GetByIdAsync(id);
            if (@case == null) throw new NotFoundException($"Case with ID {id} not found.");
            await _caseRepository.DeleteAsync(id);
        }

        public async Task UpdateStatusAsync(UpdateCaseStatusDto dto)
        {
            var @case = await _caseRepository.GetByIdAsync(dto.CaseID);
            if (@case == null) throw new NotFoundException($"Case with ID {dto.CaseID} not found.");

            string oldStatus = @case.Status;
            @case.Status = dto.NewStatus;
            if (dto.NewStatus == Constants.PortalConstants.CaseStatus.Closed)
            {
                @case.ClosedDate = DateTime.UtcNow.ToString("yyyy-MM-dd");
            }
            else
            {
                @case.ClosedDate = null;
            }

            await _caseRepository.SaveAsync(@case);

            // Log status history
            var history = new CaseStatusHistory
            {
                HistoryID = Guid.NewGuid().ToString(),
                CaseID = dto.CaseID,
                OldStatus = oldStatus,
                NewStatus = dto.NewStatus,
                ChangedByUserID = dto.ActorUserID,
                ChangedByRole = "Official",
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                Notes = $"Status updated to {dto.NewStatus}."
            };
            await _statusHistoryRepository.SaveAsync(history);

            // Create notification for owner
            if (!string.IsNullOrEmpty(@case.UserID))
            {
                string notifId = $"NOTIF-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
                var notif = new Notification
                {
                    NotificationID = notifId,
                    ReceiverID = @case.UserID,
                    ReceiverRole = "Employee",
                    Type = "CASE_STATUS_CHANGED",
                    Title = "Case Status Updated",
                    Body = $"Case #{dto.CaseID} status updated from \"{oldStatus}\" to \"{dto.NewStatus}\".",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                };
                await _notificationRepository.SaveAsync(notif);
            }
        }

        private async Task<CaseDto> MapToDtoAsync(Case @case)
        {
            var category = await _categoryRepository.GetByIdAsync(@case.CategoryID);
            var reporter = string.IsNullOrEmpty(@case.UserID) ? null : await _userRepository.GetByIdAsync(@case.UserID);
            
            var assignment = await _assignmentRepository.GetByCaseIdAsync(@case.CaseID);
            string assignedToName = "";
            string? assignedToUserId = null;

            if (assignment != null)
            {
                assignedToUserId = assignment.OfficialID;
                var official = await _officialRepository.GetByIdAsync(assignment.OfficialID);
                if (official != null)
                {
                    assignedToName = official.FullName;
                }
                else
                {
                    var user = await _userRepository.GetByIdAsync(assignment.OfficialID);
                    if (user != null) assignedToName = user.FullName;
                }
            }

            return new CaseDto
            {
                CaseID = @case.CaseID,
                UserID = @case.UserID,
                ReporterName = @case.IsAnonymous ? "Anonymous Complainant" : (reporter?.FullName ?? "Unknown"),
                CategoryID = @case.CategoryID,
                CategoryName = category?.CategoryName ?? "Unknown",
                Subject = @case.Subject,
                Description = @case.Description,
                Priority = @case.Priority,
                Status = @case.Status,
                CreatedDate = @case.CreatedDate,
                ClosedDate = @case.ClosedDate,
                AssignedToName = assignedToName,
                AssignedToUserID = assignedToUserId
            };
        }
    }

    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<List<CategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(c => new CategoryDto
            {
                CategoryID = c.CategoryID,
                CategoryName = c.CategoryName,
                Description = c.Description
            }).ToList();
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                throw new ValidationException("Category Name is required.");
            }

            string id = $"CAT-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
            var category = new Category
            {
                CategoryID = id,
                CategoryName = dto.CategoryName,
                Description = dto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            };

            await _categoryRepository.SaveAsync(category);
            return new CategoryDto
            {
                CategoryID = category.CategoryID,
                CategoryName = category.CategoryName,
                Description = category.Description
            };
        }

        public async Task<CategoryDto> UpdateAsync(string id, UpdateCategoryDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) throw new NotFoundException($"Category with ID {id} not found.");

            category.CategoryName = dto.CategoryName;
            category.Description = dto.Description;

            await _categoryRepository.SaveAsync(category);
            return new CategoryDto
            {
                CategoryID = category.CategoryID,
                CategoryName = category.CategoryName,
                Description = category.Description
            };
        }

        public async Task DeleteAsync(string id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) throw new NotFoundException($"Category with ID {id} not found.");
            await _categoryRepository.DeleteAsync(id);
        }
    }

    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IOfficialRepository _officialRepository;

        public CommentService(
            ICommentRepository commentRepository,
            IUserRepository userRepository,
            IOfficialRepository officialRepository)
        {
            _commentRepository = commentRepository;
            _userRepository = userRepository;
            _officialRepository = officialRepository;
        }

        public async Task<List<CommentDto>> GetByCaseIdAsync(string caseId)
        {
            var comments = await _commentRepository.GetByCaseIdAsync(caseId);
            var dtos = new List<CommentDto>();
            foreach (var c in comments)
            {
                string userName = "Unknown";
                var official = await _officialRepository.GetByIdAsync(c.UserID);
                if (official != null)
                {
                    userName = official.FullName;
                }
                else
                {
                    var user = await _userRepository.GetByIdAsync(c.UserID);
                    if (user != null) userName = user.FullName;
                }

                dtos.Add(new CommentDto
                {
                    CommentID = c.CommentID,
                    CaseID = c.CaseID,
                    UserID = c.UserID,
                    UserFullName = userName,
                    CommentText = c.CommentText,
                    CreatedDate = c.CreatedAt
                });
            }
            return dtos.OrderBy(c => c.CreatedDate).ToList();
        }

        public async Task<CommentDto> CreateAsync(CreateCommentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CommentText))
            {
                throw new ValidationException("Comment Text cannot be empty.");
            }

            string id = $"CMT-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
            var comment = new Comment
            {
                CommentID = id,
                CaseID = dto.CaseID,
                UserID = dto.UserID,
                CommentText = dto.CommentText,
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            await _commentRepository.SaveAsync(comment);

            string userName = "Unknown";
            var official = await _officialRepository.GetByIdAsync(dto.UserID);
            if (official != null)
            {
                userName = official.FullName;
            }
            else
            {
                var user = await _userRepository.GetByIdAsync(dto.UserID);
                if (user != null) userName = user.FullName;
            }

            return new CommentDto
            {
                CommentID = comment.CommentID,
                CaseID = comment.CaseID,
                UserID = comment.UserID,
                UserFullName = userName,
                CommentText = comment.CommentText,
                CreatedDate = comment.CreatedAt
            };
        }

        public async Task DeleteAsync(string commentId)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null) throw new NotFoundException($"Comment with ID {commentId} not found.");
            await _commentRepository.DeleteAsync(commentId);
        }
    }

    public class AttachmentService : IAttachmentService
    {
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IOfficialRepository _officialRepository;

        public AttachmentService(
            IAttachmentRepository attachmentRepository,
            IUserRepository userRepository,
            IOfficialRepository officialRepository)
        {
            _attachmentRepository = attachmentRepository;
            _userRepository = userRepository;
            _officialRepository = officialRepository;
        }

        public async Task<List<AttachmentDto>> GetByCaseIdAsync(string caseId)
        {
            var attachments = await _attachmentRepository.GetByCaseIdAsync(caseId);
            var dtos = new List<AttachmentDto>();
            foreach (var a in attachments)
            {
                string uploaderName = "Unknown";
                var official = await _officialRepository.GetByIdAsync(a.UploadedBy);
                if (official != null)
                {
                    uploaderName = official.FullName;
                }
                else
                {
                    var user = await _userRepository.GetByIdAsync(a.UploadedBy);
                    if (user != null) uploaderName = user.FullName;
                }

                dtos.Add(new AttachmentDto
                {
                    AttachmentID = a.AttachmentID,
                    CaseID = a.CaseID,
                    FileName = a.FileName,
                    FilePath = a.FilePath,
                    UploadedBy = a.UploadedBy,
                    UploadedByName = uploaderName,
                    UploadedDate = a.UploadedDate
                });
            }
            return dtos;
        }

        public async Task<AttachmentDto> CreateAsync(CreateAttachmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FileName) || string.IsNullOrWhiteSpace(dto.FilePath))
            {
                throw new ValidationException("File Name and File Path are required.");
            }

            string id = $"ATT-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
            var attachment = new Attachment
            {
                AttachmentID = id,
                CaseID = dto.CaseID,
                FileName = dto.FileName,
                FilePath = dto.FilePath,
                UploadedBy = dto.UploadedBy,
                UploadedDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            await _attachmentRepository.SaveAsync(attachment);

            string uploaderName = "Unknown";
            var official = await _officialRepository.GetByIdAsync(dto.UploadedBy);
            if (official != null)
            {
                uploaderName = official.FullName;
            }
            else
            {
                var user = await _userRepository.GetByIdAsync(dto.UploadedBy);
                if (user != null) uploaderName = user.FullName;
            }

            return new AttachmentDto
            {
                AttachmentID = attachment.AttachmentID,
                CaseID = attachment.CaseID,
                FileName = attachment.FileName,
                FilePath = attachment.FilePath,
                UploadedBy = attachment.UploadedBy,
                UploadedByName = uploaderName,
                UploadedDate = attachment.UploadedDate
            };
        }

        public async Task DeleteAsync(string id)
        {
            var attachment = await _attachmentRepository.GetByIdAsync(id);
            if (attachment == null) throw new NotFoundException($"Attachment with ID {id} not found.");
            await _attachmentRepository.DeleteAsync(id);
        }
    }

    public class CaseAssignmentService : ICaseAssignmentService
    {
        private readonly ICaseAssignmentRepository _assignmentRepository;
        private readonly ICaseRepository _caseRepository;
        private readonly IUserRepository _userRepository;
        private readonly IOfficialRepository _officialRepository;
        private readonly INotificationRepository _notificationRepository;

        public CaseAssignmentService(
            ICaseAssignmentRepository assignmentRepository,
            ICaseRepository caseRepository,
            IUserRepository userRepository,
            IOfficialRepository officialRepository,
            INotificationRepository notificationRepository)
        {
            _assignmentRepository = assignmentRepository;
            _caseRepository = caseRepository;
            _userRepository = userRepository;
            _officialRepository = officialRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<List<CaseAssignmentDto>> GetAllAsync()
        {
            var assignments = await _assignmentRepository.GetAllAsync();
            var dtos = new List<CaseAssignmentDto>();
            foreach (var a in assignments)
            {
                dtos.Add(await MapToDtoAsync(a));
            }
            return dtos;
        }

        public async Task<CaseAssignmentDto?> GetByCaseIdAsync(string caseId)
        {
            var assignment = await _assignmentRepository.GetByCaseIdAsync(caseId);
            if (assignment == null) return null;
            return await MapToDtoAsync(assignment);
        }

        public async Task<CaseAssignmentDto> CreateAsync(CreateCaseAssignmentDto dto)
        {
            var existing = await _assignmentRepository.GetByCaseIdAsync(dto.CaseID);
            if (existing != null)
            {
                // Treat creation request on existing assignment as update/reassign
                var updateDto = new UpdateCaseAssignmentDto
                {
                    AssignedToUserID = dto.AssignedToUserID,
                    AssignedByUserID = dto.AssignedByUserID
                };
                return await UpdateAsync(existing.AssignmentID, updateDto);
            }

            var assignment = new CaseAssignment
            {
                AssignmentID = Guid.NewGuid().ToString(),
                CaseID = dto.CaseID,
                OfficialID = dto.AssignedToUserID,
                AssignedByAdminID = dto.AssignedByUserID,
                AssignedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                IsActive = true
            };

            await _assignmentRepository.SaveAsync(assignment);

            // Update Case table to reflect assigned official ID
            var @case = await _caseRepository.GetByIdAsync(dto.CaseID);
            if (@case != null)
            {
                @case.AssignedOfficialID = dto.AssignedToUserID;
                @case.Status = Constants.PortalConstants.CaseStatus.UnderReview;
                await _caseRepository.SaveAsync(@case);
            }

            // Send notifications
            await SendAssignmentNotificationsAsync(dto.CaseID, dto.AssignedToUserID, dto.AssignedByUserID);

            return await MapToDtoAsync(assignment);
        }

        public async Task<CaseAssignmentDto> UpdateAsync(string assignmentId, UpdateCaseAssignmentDto dto)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(assignmentId);
            if (assignment == null) throw new NotFoundException($"Assignment with ID {assignmentId} not found.");

            string oldAssigneeID = assignment.OfficialID;
            assignment.OfficialID = dto.AssignedToUserID;
            assignment.AssignedByAdminID = dto.AssignedByUserID;
            assignment.AssignedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            assignment.TransferredFromOfficialID = oldAssigneeID;
            assignment.TransferredAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

            await _assignmentRepository.SaveAsync(assignment);

            // Update Case table to reflect assigned official ID
            var @case = await _caseRepository.GetByIdAsync(assignment.CaseID);
            if (@case != null)
            {
                @case.AssignedOfficialID = dto.AssignedToUserID;
                await _caseRepository.SaveAsync(@case);
            }

            // Send notifications
            await SendAssignmentNotificationsAsync(assignment.CaseID, dto.AssignedToUserID, dto.AssignedByUserID);

            return await MapToDtoAsync(assignment);
        }

        private async Task SendAssignmentNotificationsAsync(string caseId, string assignedToUserId, string assignedByUserId)
        {
            var @case = await _caseRepository.GetByIdAsync(caseId);
            if (@case == null) return;

            string assignerName = "Admin";
            var assigner = await _officialRepository.GetByIdAsync(assignedByUserId);
            if (assigner != null) assignerName = assigner.FullName;

            string assigneeName = "Agent";
            var assignee = await _officialRepository.GetByIdAsync(assignedToUserId);
            if (assignee != null) assigneeName = assignee.FullName;

            string caseSubjectSnippet = @case.Subject.Substring(0, Math.Min(30, @case.Subject.Length));

            // Notify Assignee
            string notifId1 = $"NOTIF-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
            var assigneeNotif = new Notification
            {
                NotificationID = notifId1,
                ReceiverID = assignedToUserId,
                ReceiverRole = "Official",
                Type = "CASE_ASSIGNED",
                Title = "New Case Assigned",
                Body = $"You have been assigned Case #{caseId} (\"{caseSubjectSnippet}...\") by {assignerName}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };
            await _notificationRepository.SaveAsync(assigneeNotif);

            // Notify Owner
            if (!string.IsNullOrEmpty(@case.UserID))
            {
                string notifId2 = $"NOTIF-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
                var ownerNotif = new Notification
                {
                    NotificationID = notifId2,
                    ReceiverID = @case.UserID,
                    ReceiverRole = "Employee",
                    Type = "CASE_STATUS_CHANGED",
                    Title = "Advocate Assigned to Case",
                    Body = $"Your case #{caseId} has been assigned to {assigneeName}.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                };
                await _notificationRepository.SaveAsync(ownerNotif);
            }
        }

        private async Task<CaseAssignmentDto> MapToDtoAsync(CaseAssignment a)
        {
            string assignedToName = "Unknown";
            if (!string.IsNullOrEmpty(a.OfficialID))
            {
                var officialTo = await _officialRepository.GetByIdAsync(a.OfficialID);
                if (officialTo != null)
                {
                    assignedToName = officialTo.FullName;
                }
                else
                {
                    var userTo = await _userRepository.GetByIdAsync(a.OfficialID);
                    if (userTo != null) assignedToName = userTo.FullName;
                }
            }

            string assignedByName = "Unknown";
            if (!string.IsNullOrEmpty(a.AssignedByAdminID))
            {
                var officialBy = await _officialRepository.GetByIdAsync(a.AssignedByAdminID);
                if (officialBy != null)
                {
                    assignedByName = officialBy.FullName;
                }
                else
                {
                    var userBy = await _userRepository.GetByIdAsync(a.AssignedByAdminID);
                    if (userBy != null) assignedByName = userBy.FullName;
                }
            }

            return new CaseAssignmentDto
            {
                AssignmentID = a.AssignmentID,
                CaseID = a.CaseID,
                AssignedToUserID = a.OfficialID,
                AssignedToName = assignedToName,
                AssignedByUserID = a.AssignedByAdminID,
                AssignedByName = assignedByName,
                AssignedDate = a.AssignedAt
            };
        }
    }

    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;

        public NotificationService(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<List<NotificationDto>> GetByUserIdAsync(string userId)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);
            return notifications.Select(n => new NotificationDto
            {
                NotificationID = n.NotificationID,
                UserID = n.ReceiverID,
                Message = n.Body,
                IsRead = n.IsRead,
                CreatedDate = n.CreatedAt
            }).OrderByDescending(n => n.CreatedDate).ToList();
        }

        public async Task<NotificationDto> CreateAsync(CreateNotificationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Message))
            {
                throw new ValidationException("Notification Message is required.");
            }

            string id = $"NOTIF-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
            var notification = new Notification
            {
                NotificationID = id,
                ReceiverID = dto.UserID,
                ReceiverRole = "Employee",
                Type = "SYSTEM_NOTIFICATION",
                Title = "System Update",
                Body = dto.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            await _notificationRepository.SaveAsync(notification);
            return new NotificationDto
            {
                NotificationID = notification.NotificationID,
                UserID = notification.ReceiverID,
                Message = notification.Body,
                IsRead = notification.IsRead,
                CreatedDate = notification.CreatedAt
            };
        }

        public async Task MarkAsReadAsync(string id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null) throw new NotFoundException($"Notification with ID {id} not found.");

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            await _notificationRepository.SaveAsync(notification);
        }
    }

    public class WhistleblowerService : IWhistleblowerService
    {
        private readonly IWhistleblowerRepository _whistleblowerRepository;

        public WhistleblowerService(IWhistleblowerRepository whistleblowerRepository)
        {
            _whistleblowerRepository = whistleblowerRepository;
        }

        public async Task<WhistleblowerReportDto> CreateAsync(CreateWhistleblowerReportDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Subject) || string.IsNullOrWhiteSpace(dto.Description) || string.IsNullOrWhiteSpace(dto.Category))
            {
                throw new ValidationException("Subject, Category, and Description are required for anonymous whistleblower reporting.");
            }

            string id = Guid.NewGuid().ToString();
            string refNum = $"WB-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper()}";

            var report = new WhistleblowerReport
            {
                ReportID = id,
                ReferenceNumber = refNum,
                Subject = dto.Subject,
                Description = dto.Description,
                Category = dto.Category,
                Status = Constants.PortalConstants.WhistleblowerStatus.Submitted,
                SubmittedDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            await _whistleblowerRepository.SaveAsync(report);
            return MapToDto(report);
        }

        public async Task<WhistleblowerReportDto> GetByReferenceNumberAsync(string referenceNumber)
        {
            var report = await _whistleblowerRepository.GetByReferenceNumberAsync(referenceNumber);
            if (report == null) throw new NotFoundException($"Whistleblower report with reference number {referenceNumber} not found.");
            return MapToDto(report);
        }

        public async Task<List<WhistleblowerReportDto>> GetAllAsync()
        {
            var reports = await _whistleblowerRepository.GetAllAsync();
            return reports.Select(MapToDto).ToList();
        }

        private static WhistleblowerReportDto MapToDto(WhistleblowerReport report)
        {
            return new WhistleblowerReportDto
            {
                ReportID = report.ReportID,
                ReferenceNumber = report.ReferenceNumber,
                Subject = report.Subject,
                Description = report.Description,
                Category = report.Category,
                Status = report.Status,
                SubmittedDate = report.SubmittedDate
            };
        }
    }

    public class CaseMessageService : ICaseMessageService
    {
        private readonly ICaseMessageRepository _messageRepository;

        public CaseMessageService(ICaseMessageRepository messageRepository)
        {
            _messageRepository = messageRepository;
        }

        public async Task<CaseMessage> GetByIdAsync(string messageId)
        {
            var msg = await _messageRepository.GetByIdAsync(messageId);
            if (msg == null) throw new NotFoundException($"Message with ID {messageId} not found.");
            return msg;
        }

        public async Task<List<CaseMessage>> GetByCaseIdAsync(int caseId)
        {
            // Backward compatibility
            return await _messageRepository.GetByCaseIdAsync(caseId.ToString());
        }

        public async Task<List<CaseMessage>> GetByCaseIdAsync(string caseId)
        {
            return await _messageRepository.GetByCaseIdAsync(caseId);
        }

        public async Task<CaseMessage> CreateAsync(CaseMessage message)
        {
            if (string.IsNullOrEmpty(message.MessageID))
            {
                message.MessageID = Guid.NewGuid().ToString();
            }
            if (string.IsNullOrEmpty(message.SentAt))
            {
                message.SentAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            }
            await _messageRepository.SaveAsync(message);
            return message;
        }

        public async Task DeleteAsync(string messageId)
        {
            await _messageRepository.DeleteAsync(messageId);
        }
    }

    public class CaseDocumentRequestService : ICaseDocumentRequestService
    {
        private readonly ICaseDocumentRequestRepository _requestRepository;

        public CaseDocumentRequestService(ICaseDocumentRequestRepository requestRepository)
        {
            _requestRepository = requestRepository;
        }

        public async Task<CaseDocumentRequest> GetByIdAsync(string requestId)
        {
            var req = await _requestRepository.GetByIdAsync(requestId);
            if (req == null) throw new NotFoundException($"Document request with ID {requestId} not found.");
            return req;
        }

        public async Task<List<CaseDocumentRequest>> GetByCaseIdAsync(int caseId)
        {
            // Backward compatibility
            return await _requestRepository.GetByCaseIdAsync(caseId.ToString());
        }

        public async Task<List<CaseDocumentRequest>> GetByCaseIdAsync(string caseId)
        {
            return await _requestRepository.GetByCaseIdAsync(caseId);
        }

        public async Task<CaseDocumentRequest> CreateAsync(CaseDocumentRequest request)
        {
            if (string.IsNullOrEmpty(request.RequestID))
            {
                request.RequestID = Guid.NewGuid().ToString();
            }
            await _requestRepository.SaveAsync(request);
            return request;
        }

        public async Task<CaseDocumentRequest> UpdateAsync(string requestId, CaseDocumentRequest request)
        {
            var existing = await _requestRepository.GetByIdAsync(requestId);
            if (existing == null) throw new NotFoundException($"Document request with ID {requestId} not found.");

            existing.FulfilledAt = request.FulfilledAt;
            existing.S3Key = request.S3Key;
            await _requestRepository.SaveAsync(existing);
            return existing;
        }

        public async Task DeleteAsync(string requestId)
        {
            await _requestRepository.DeleteAsync(requestId);
        }
    }

    public class SlaConfigService : ISlaConfigService
    {
        private readonly ISlaConfigRepository _slaConfigRepository;

        public SlaConfigService(ISlaConfigRepository slaConfigRepository)
        {
            _slaConfigRepository = slaConfigRepository;
        }

        public async Task<SlaConfig?> GetByConfigIdAsync(string configId)
        {
            return await _slaConfigRepository.GetByConfigIdAsync(configId);
        }

        public async Task<SlaConfig?> GetByCategoryIdAsync(string categoryId)
        {
            return await _slaConfigRepository.GetByCategoryIdAsync(categoryId);
        }

        public async Task<List<SlaConfig>> GetAllAsync()
        {
            return await _slaConfigRepository.GetAllAsync();
        }

        public async Task SaveAsync(SlaConfig config)
        {
            await _slaConfigRepository.SaveAsync(config);
        }

        public async Task DeleteAsync(string configId)
        {
            await _slaConfigRepository.DeleteAsync(configId);
        }
    }

    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;

        public AuditLogService(IAuditLogRepository auditLogRepository)
        {
            _auditLogRepository = auditLogRepository;
        }

        public async Task<AuditLog?> GetByIdAsync(string logId)
        {
            return await _auditLogRepository.GetByIdAsync(logId);
        }

        public async Task<List<AuditLog>> GetByActorIdAsync(string actorId)
        {
            return await _auditLogRepository.GetByActorIdAsync(actorId);
        }

        public async Task SaveAsync(AuditLog log)
        {
            if (string.IsNullOrEmpty(log.LogID))
            {
                log.LogID = Guid.NewGuid().ToString();
            }
            if (string.IsNullOrEmpty(log.Timestamp))
            {
                log.Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
            }
            await _auditLogRepository.SaveAsync(log);
        }
    }

    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public RefreshTokenService(IRefreshTokenRepository refreshTokenRepository)
        {
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
        {
            return await _refreshTokenRepository.GetByTokenHashAsync(tokenHash);
        }

        public async Task SaveAsync(RefreshToken token)
        {
            await _refreshTokenRepository.SaveAsync(token);
        }

        public async Task DeleteAsync(string tokenHash)
        {
            await _refreshTokenRepository.DeleteAsync(tokenHash);
        }
    }
}
