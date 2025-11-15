using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactServerApp.Server.Data;
using ReactServerApp.Server.Models;
using ReactServerApp.Server.Services;

namespace ReactServerApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Kullanıcı Girişi
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                return BadRequest("E-posta ve şifre gereklidir.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserEmail == request.Email && !u.IsDeleted);

            if (user == null)
                return Unauthorized("Geçersiz e-posta veya şifre.");

            // Şifre doğrulama (hash'lenmiş şifre ile karşılaştır)
            if (!PasswordHasher.VerifyPassword(request.Password, user.UserPassword))
                return Unauthorized("Geçersiz e-posta veya şifre.");

            // Şifreyi response'dan çıkar
            var responseUser = new
            {
                user.UserId,
                user.UserName,
                user.UserEmail,
                user.Role,
                user.StorageQuotaGB,
                files = new List<object>() // Dosyalar ayrı bir sistemde saklanıyor
            };

            return Ok(responseUser);
        }

        // Tüm Kullanıcıları Getir (Admin için) - Silinmemiş kullanıcılar
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Where(u => !u.IsDeleted)
                .ToListAsync();
            
            var safeUsers = users.Select(u => new
            {
                u.UserId,
                u.UserName,
                u.UserEmail,
                u.Role,
                u.StorageQuotaGB,
                files = new List<object>() // Dosyalar ayrı bir sistemde saklanıyor
            }).ToList();

            return Ok(safeUsers);
        }

        // Kullanıcı Getir (ID ile)
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);

            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            // Şifreyi kaldır
            var safeUser = new
            {
                user.UserId,
                user.UserName,
                user.UserEmail,
                user.Role,
                user.StorageQuotaGB,
                files = new List<object>() // Dosyalar ayrı bir sistemde saklanıyor
            };

            return Ok(safeUser);
        }

        // Kullanıcı Kayıt (Public - Herkes kayıt olabilir)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.UserEmail) || string.IsNullOrEmpty(request.UserPassword))
                return BadRequest("E-posta ve şifre gereklidir.");

            if (string.IsNullOrEmpty(request.UserName))
                return BadRequest("İsim gereklidir.");

            // E-posta kontrolü (sadece silinmemiş kullanıcılar için)
            if (await _context.Users.AnyAsync(u => u.UserEmail == request.UserEmail && !u.IsDeleted))
                return Conflict("Bu e-posta adresi zaten kullanılıyor.");

            // Yeni kullanıcı ID oluştur
            var userId = $"usr-{Guid.NewGuid().ToString("N")[..8]}";

            // Şifreyi hash'le
            var hashedPassword = PasswordHasher.HashPassword(request.UserPassword);

            var newUser = new User
            {
                UserId = userId,
                UserName = request.UserName,
                UserEmail = request.UserEmail,
                UserPassword = hashedPassword,
                Role = "user", // Kayıt olan kullanıcılar her zaman "user" rolünde
                StorageQuotaGB = 2, // Yeni kullanıcılar 2 GB ile başlar
                IsDeleted = false
            };

            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            // Şifreyi kaldır
            var safeUser = new
            {
                newUser.UserId,
                newUser.UserName,
                newUser.UserEmail,
                newUser.Role,
                newUser.StorageQuotaGB,
                files = new List<object>()
            };

            return CreatedAtAction(nameof(GetUser), new { userId = newUser.UserId }, safeUser);
        }

        // Kullanıcı Oluştur (Admin için)
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request, [FromQuery] string? currentUserId = null)
        {
            if (string.IsNullOrEmpty(request.UserEmail) || string.IsNullOrEmpty(request.UserPassword))
                return BadRequest("E-posta ve şifre gereklidir.");

            // E-posta kontrolü (sadece silinmemiş kullanıcılar için)
            if (await _context.Users.AnyAsync(u => u.UserEmail == request.UserEmail && !u.IsDeleted))
                return Conflict("Bu e-posta adresi zaten kullanılıyor.");

            // Rol kontrolü - Normal admin sadece user oluşturabilir
            var requestedRole = (request.Role ?? "user").ToLower();
            if (!string.IsNullOrEmpty(currentUserId))
            {
                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == currentUserId && !u.IsDeleted);
                if (currentUser != null)
                {
                    // Normal admin sadece user oluşturabilir
                    if (currentUser.Role == "admin" && requestedRole != "user")
                        return Forbid("Normal admin sadece kullanıcı oluşturabilir.");
                }
            }

            // Yeni kullanıcı ID oluştur
            var userId = string.IsNullOrEmpty(request.UserId) 
                ? $"usr-{Guid.NewGuid().ToString("N")[..8]}" 
                : request.UserId;

            // Şifreyi hash'le
            var hashedPassword = PasswordHasher.HashPassword(request.UserPassword);

            var newUser = new User
            {
                UserId = userId,
                UserName = request.UserName ?? "Kullanıcı",
                UserEmail = request.UserEmail,
                UserPassword = hashedPassword,
                Role = requestedRole,
                StorageQuotaGB = request.StorageQuotaGB ?? 1,
                IsDeleted = false
            };

            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            // Şifreyi kaldır
            var safeUser = new
            {
                newUser.UserId,
                newUser.UserName,
                newUser.UserEmail,
                newUser.Role,
                newUser.StorageQuotaGB,
                files = new List<object>()
            };

            return CreatedAtAction(nameof(GetUser), new { userId = newUser.UserId }, safeUser);
        }

        // Kullanıcı Güncelle
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserRequest request, [FromQuery] string? currentUserId = null)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);

            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            // Yetki kontrolü - Normal admin rol değiştiremez
            if (!string.IsNullOrEmpty(request.Role) && !string.IsNullOrEmpty(currentUserId))
            {
                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == currentUserId && !u.IsDeleted);
                if (currentUser != null)
                {
                    // Normal admin rol değiştiremez
                    if (currentUser.Role == "admin" && currentUser.Role != "superadmin")
                        return Forbid("Normal admin kullanıcı rollerini değiştiremez.");
                    
                    // Normal admin admin kullanıcıları güncelleyemez
                    if (currentUser.Role == "admin" && (user.Role == "admin" || user.Role == "superadmin"))
                        return Forbid("Normal admin admin kullanıcıları güncelleyemez.");
                }
            }

            // Güncellenebilir alanları güncelle
            if (!string.IsNullOrEmpty(request.UserName))
                user.UserName = request.UserName;

            if (!string.IsNullOrEmpty(request.UserEmail))
            {
                // E-posta değişikliği için kontrol (sadece silinmemiş kullanıcılar)
                if (await _context.Users.AnyAsync(u => u.UserEmail == request.UserEmail && u.UserId != userId && !u.IsDeleted))
                    return Conflict("Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.");
                user.UserEmail = request.UserEmail;
            }

            if (!string.IsNullOrEmpty(request.UserPassword))
            {
                // Şifreyi hash'le
                user.UserPassword = PasswordHasher.HashPassword(request.UserPassword);
            }

            if (!string.IsNullOrEmpty(request.Role))
            {
                // Super admin kontrolü
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == currentUserId && !u.IsDeleted);
                    if (currentUser?.Role == "superadmin")
                    {
                        // Superadmin kendi rolünü değiştiremez
                        if (user.UserId == currentUserId)
                            return Forbid("Kendi rolünüzü değiştiremezsiniz.");
                        
                        user.Role = request.Role.ToLower();
                    }
                }
                else
                {
                    user.Role = request.Role.ToLower();
                }
            }

            if (request.StorageQuotaGB.HasValue)
                user.StorageQuotaGB = request.StorageQuotaGB.Value;

            await _context.SaveChangesAsync();

            // Şifreyi kaldır
            var safeUser = new
            {
                user.UserId,
                user.UserName,
                user.UserEmail,
                user.Role,
                user.StorageQuotaGB,
                files = new List<object>()
            };

            return Ok(safeUser);
        }

        // Kullanıcı Sil (Soft Delete)
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(string userId, [FromQuery] string? currentUserId = null)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);

            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            // Yetki kontrolü
            if (!string.IsNullOrEmpty(currentUserId))
            {
                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == currentUserId && !u.IsDeleted);
                if (currentUser != null)
                {
                    // Super admin herkesi silebilir
                    if (currentUser.Role == "superadmin")
                    {
                        // Super admin herkesi silebilir
                    }
                    // Normal admin sadece user'ları silebilir
                    else if (currentUser.Role == "admin")
                    {
                        if (user.Role == "admin" || user.Role == "superadmin")
                            return Forbid("Normal admin admin kullanıcıları silemez.");
                    }
                    // User hiç kimseyi silemez
                    else
                    {
                        return Forbid("Kullanıcılar silme yetkisine sahip değildir.");
                    }
                }
            }

            // Soft delete - IsDeleted flag'ini true yap
            user.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class CreateUserRequest
    {
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string UserPassword { get; set; } = string.Empty;
        public string? Role { get; set; }
        public int? StorageQuotaGB { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public string? UserPassword { get; set; }
        public string? Role { get; set; }
        public int? StorageQuotaGB { get; set; }
    }

    public class RegisterRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string UserPassword { get; set; } = string.Empty;
    }
}
