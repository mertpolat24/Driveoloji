using System.ComponentModel.DataAnnotations;

namespace ReactServerApp.Server.Models
{
    public class User
    {
        [Key]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string UserEmail { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string UserPassword { get; set; } = string.Empty; // Hash'lenmiş şifre

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = "user"; // superadmin, admin, user

        [Required]
        public int StorageQuotaGB { get; set; } = 1;

        [Required]
        public bool IsDeleted { get; set; } = false; // Soft delete flag
    }
}

