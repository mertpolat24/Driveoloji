using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.RegularExpressions;

namespace ReactServerApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController : ControllerBase
    {
        private readonly string _baseFolder = @"C:\CloudApp";

        public FileController()
        {
            // Base klasörü oluştur
            if (!Directory.Exists(_baseFolder))
                Directory.CreateDirectory(_baseFolder);
        }

        // Kullanıcı klasörünü al veya oluştur
        private string GetUserFolder(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("Kullanıcı ID'si gereklidir.");

            // Güvenli klasör adı oluştur
            var safeUserId = Regex.Replace(userId, @"[^a-zA-Z0-9_-]", "_");
            
            // C:\CloudApp\{userId} klasör yolu oluştur
            var userFolder = Path.Combine(_baseFolder, safeUserId);

            // Klasör yoksa oluştur
            if (!Directory.Exists(userFolder))
            {
                Directory.CreateDirectory(userFolder);
                Console.WriteLine($"[FileController] Kullanıcı klasörü oluşturuldu: {userFolder}");
            }

            return userFolder;
        }

        // Dosya Upload
        [HttpPost("upload")]
        [RequestSizeLimit(5L * 1024 * 1024 * 1024)] // Max 5GB
        public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string userId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya bulunamadı.");

            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı ID'si gereklidir.");

            try
            {
                var userFolder = GetUserFolder(userId);
                Console.WriteLine($"[FileController] Upload - Kullanıcı klasörü: {userFolder}");

                // Dosya adını değiştirme, sadece güvenli hale getir
                var fileName = Regex.Replace(file.FileName, @"[^a-zA-Z0-9_\.-]", "_");
                var filePath = Path.Combine(userFolder, fileName);
                Console.WriteLine($"[FileController] Upload - Dosya yolu: {filePath}");

                // Aynı isimde dosya varsa üzerine yazma, yeni isim oluştur
                if (System.IO.File.Exists(filePath))
                {
                    var nameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                    var extension = Path.GetExtension(fileName);
                    var counter = 1;
                    do
                    {
                        fileName = $"{nameWithoutExt}_{counter}{extension}";
                        filePath = Path.Combine(userFolder, fileName);
                        counter++;
                    } while (System.IO.File.Exists(filePath) && counter < 1000);
                }

                using var stream = System.IO.File.Create(filePath);
                await file.CopyToAsync(stream);

                return Ok(new { message = "Dosya başarıyla yüklendi", fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya yükleme hatası: {ex.Message}");
            }
        }

        // Dosya Download
        [HttpGet("download/{fileName}")]
        public IActionResult Download(string fileName, [FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı ID'si gereklidir.");

            try
            {
                // Güvenli isim kontrolü
                fileName = Regex.Replace(fileName, @"[^a-zA-Z0-9_\.-]", "_");
                var userFolder = GetUserFolder(userId);
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

        // Dosya Listesi (Dosya adı ve boyut bilgisi ile)
        [HttpGet("list")]
        public IActionResult List([FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı ID'si gereklidir.");

            try
            {
                var userFolder = GetUserFolder(userId);

                if (!Directory.Exists(userFolder))
                    return Ok(new List<object>());


                var files = Directory.GetFiles(userFolder)
                                     .Select(filePath =>
                                     {
                                         var fileInfo = new FileInfo(filePath);
                                         return new
                                         {
                                             fileName = Path.GetFileName(filePath),
                                             size = fileInfo.Length, // bytes
                                             lastModified = fileInfo.LastWriteTime
                                         };
                                     })
                                     .ToList();
                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya listesi alınamadı: {ex.Message}");
            }
        }

        // Dosya Silme
        [HttpDelete("delete/{fileName}")]
        public IActionResult Delete(string fileName, [FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Kullanıcı ID'si gereklidir.");

            try
            {
                // Güvenli isim kontrolü
                fileName = Regex.Replace(fileName, @"[^a-zA-Z0-9_\.-]", "_");
                var userFolder = GetUserFolder(userId);
                var filePath = Path.Combine(userFolder, fileName);

                if (!System.IO.File.Exists(filePath))
                    return NotFound("Dosya bulunamadı.");

                System.IO.File.Delete(filePath);
                Console.WriteLine($"[FileController] Dosya silindi: {filePath}");

                return Ok(new { message = "Dosya başarıyla silindi", fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya silme hatası: {ex.Message}");
            }
        }
    }
}
