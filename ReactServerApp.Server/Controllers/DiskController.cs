using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;
using ReactServerApp.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace ReactServerApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiskController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DiskController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Tüm diskleri ve kullanım bilgilerini getir
        [HttpGet("info")]
        public IActionResult GetDiskInfo([FromQuery] string? currentUserId = null)
        {
            try
            {
                // Mevcut kullanıcıyı kontrol et
                var currentUser = _context.Users.FirstOrDefault(u => u.UserId == currentUserId && !u.IsDeleted);
                if (currentUser == null || (currentUser.Role != "admin" && currentUser.Role != "superadmin"))
                    return Forbid("Bu işlem için yetkiniz yok.");

                var disks = DriveInfo.GetDrives()
                    .Where(d => d.IsReady && d.DriveType == DriveType.Fixed)
                    .Select(drive =>
                    {
                        var totalBytes = drive.TotalSize;
                        var freeBytes = drive.AvailableFreeSpace;
                        var usedBytes = totalBytes - freeBytes;

                        return new
                        {
                            name = drive.Name,
                            label = drive.VolumeLabel ?? "Yerel Disk",
                            totalSize = totalBytes,
                            freeSpace = freeBytes,
                            usedSpace = usedBytes,
                            totalSizeGB = Math.Round(totalBytes / (1024.0 * 1024.0 * 1024.0), 2),
                            freeSpaceGB = Math.Round(freeBytes / (1024.0 * 1024.0 * 1024.0), 2),
                            usedSpaceGB = Math.Round(usedBytes / (1024.0 * 1024.0 * 1024.0), 2),
                            driveType = drive.DriveType.ToString()
                        };
                    })
                    .ToList();

                return Ok(disks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Disk bilgileri alınamadı: {ex.Message}");
            }
        }

        // Belirli bir diskteki kullanıcı kullanımlarını getir
        [HttpGet("usage/{driveName}")]
        public IActionResult GetDiskUsage(string driveName, [FromQuery] string? currentUserId = null)
        {
            try
            {
                // Mevcut kullanıcıyı kontrol et
                var currentUser = _context.Users.FirstOrDefault(u => u.UserId == currentUserId && !u.IsDeleted);
                if (currentUser == null || (currentUser.Role != "admin" && currentUser.Role != "superadmin"))
                    return Forbid("Bu işlem için yetkiniz yok.");

                // Drive name'i temizle (örn: "C:" -> "C")
                var cleanDriveName = driveName.Replace(":", "").Replace("\\", "").ToUpper();
                var basePath = $"{cleanDriveName}:\\CloudApp";

                if (!Directory.Exists(basePath))
                    return Ok(new List<object>());

                var users = _context.Users.Where(u => !u.IsDeleted).ToList();
                var userUsages = new List<object>();

                foreach (var user in users)
                {
                    var userFolder = Path.Combine(basePath, user.UserId);
                    if (!Directory.Exists(userFolder))
                        continue;

                    var files = Directory.GetFiles(userFolder, "*", SearchOption.AllDirectories);
                    var totalSize = files.Sum(f => new FileInfo(f).Length);

                    userUsages.Add(new
                    {
                        userId = user.UserId,
                        userName = user.UserName,
                        userEmail = user.UserEmail,
                        fileCount = files.Length,
                        totalSize = totalSize,
                        totalSizeGB = Math.Round(totalSize / (1024.0 * 1024.0 * 1024.0), 2),
                        totalSizeMB = Math.Round(totalSize / (1024.0 * 1024.0), 2)
                    });
                }

                return Ok(userUsages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Disk kullanım bilgileri alınamadı: {ex.Message}");
            }
        }

        // Belirli bir kullanıcının belirli bir diskteki dosyalarını getir (sansürlü/sansürsüz)
        [HttpGet("files/{driveName}/{userId}")]
        public IActionResult GetUserFiles(string driveName, string userId, [FromQuery] string? currentUserId = null)
        {
            try
            {
                // Mevcut kullanıcıyı kontrol et
                var currentUser = _context.Users.FirstOrDefault(u => u.UserId == currentUserId && !u.IsDeleted);
                if (currentUser == null || (currentUser.Role != "admin" && currentUser.Role != "superadmin"))
                    return Forbid("Bu işlem için yetkiniz yok.");

                // Drive name'i temizle
                var cleanDriveName = driveName.Replace(":", "").Replace("\\", "").ToUpper();
                var basePath = $"{cleanDriveName}:\\CloudApp";
                var userFolder = Path.Combine(basePath, userId);

                if (!Directory.Exists(userFolder))
                    return Ok(new List<object>());

                var files = Directory.GetFiles(userFolder, "*", SearchOption.AllDirectories)
                    .Select(filePath =>
                    {
                        var fileInfo = new FileInfo(filePath);
                        var fileName = Path.GetFileName(filePath);
                        var relativePath = Path.GetRelativePath(userFolder, filePath);

                        // Admin için sansürlü, superadmin için sansürsüz
                        var isSuperAdmin = currentUser.Role == "superadmin";
                        var displayName = isSuperAdmin ? fileName : SanitizeFileName(fileName);

                        return new
                        {
                            fileName = displayName,
                            originalFileName = fileName, // Superadmin için
                            relativePath = relativePath,
                            size = fileInfo.Length,
                            sizeGB = Math.Round(fileInfo.Length / (1024.0 * 1024.0 * 1024.0), 4),
                            sizeMB = Math.Round(fileInfo.Length / (1024.0 * 1024.0), 2),
                            lastModified = fileInfo.LastWriteTime,
                            fullPath = isSuperAdmin ? filePath : null // Sadece superadmin için
                        };
                    })
                    .OrderByDescending(f => f.size)
                    .ToList();

                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya listesi alınamadı: {ex.Message}");
            }
        }

        // Dosya indirme (sadece superadmin)
        [HttpGet("download/{driveName}/{userId}/{fileName}")]
        public IActionResult DownloadFile(string driveName, string userId, string fileName, [FromQuery] string? currentUserId = null)
        {
            try
            {
                // Mevcut kullanıcıyı kontrol et (sadece superadmin)
                var currentUser = _context.Users.FirstOrDefault(u => u.UserId == currentUserId && !u.IsDeleted);
                if (currentUser == null || currentUser.Role != "superadmin")
                    return Forbid("Bu işlem için superadmin yetkisi gereklidir.");

                // Drive name'i temizle
                var cleanDriveName = driveName.Replace(":", "").Replace("\\", "").ToUpper();
                var basePath = $"{cleanDriveName}:\\CloudApp";
                var userFolder = Path.Combine(basePath, userId);
                var filePath = Path.Combine(userFolder, fileName);

                if (!System.IO.File.Exists(filePath))
                    return NotFound("Dosya bulunamadı.");

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                return File(fileBytes, "application/octet-stream", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya indirme hatası: {ex.Message}");
            }
        }

        // Dosya adını sansürle (admin için)
        private string SanitizeFileName(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return "***";

            var extension = Path.GetExtension(fileName);
            var nameWithoutExt = Path.GetFileNameWithoutExtension(fileName);

            // İlk ve son karakteri göster, ortasını sansürle
            if (nameWithoutExt.Length <= 2)
                return "***" + extension;

            var firstChar = nameWithoutExt[0];
            var lastChar = nameWithoutExt[nameWithoutExt.Length - 1];
            var masked = $"{firstChar}***{lastChar}";

            return masked + extension;
        }
    }
}

