using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiKeyManager.Api.Data;
using ApiKeyManager.Api.Models;
using ApiKeyManager.Api.Services;
using System.Security.Cryptography;
using System.Text;

namespace ApiKeyManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApiKeyController : ControllerBase
{
    private readonly ApiKeyDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ApiKeyController> _logger;

    public ApiKeyController(
        ApiKeyDbContext context,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<ApiKeyController> logger)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("request-link")]
    public async Task<IActionResult> RequestOneTimeLink([FromBody] string email)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest("Email is required");

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var link = new OneTimeLink
        {
            Email = email,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        _context.OneTimeLinks.Add(link);
        await _context.SaveChangesAsync();

        var linkUrl = $"{_configuration["FrontendUrl"]}/generate-key?token={token}";
        await _emailService.SendOneTimeLink(email, linkUrl);

        return Ok(linkUrl);
    }

    [HttpPost("verify-link")]
    public async Task<IActionResult> VerifyLink([FromBody] string token)
    {
        var link = await _context.OneTimeLinks
            .FirstOrDefaultAsync(l => l.Token == token && !l.IsUsed && l.ExpiresAt > DateTime.UtcNow);

        if (link == null)
            return NotFound("Invalid or expired link");

        return Ok(new { email = link.Email });
    }

    [HttpPost("store-key")]
    public async Task<IActionResult> StoreKey([FromBody] StoreKeyRequest request)
    {
        var link = await _context.OneTimeLinks
            .FirstOrDefaultAsync(l => l.Token == request.Token && !l.IsUsed && l.ExpiresAt > DateTime.UtcNow);

        if (link == null)
            return NotFound("Invalid or expired link");

        // Hash the API key with the email as salt
        using var sha256 = SHA256.Create();
        var saltedKey = $"{request.HashedKey}{link.Email}";
        var keyBytes = Encoding.UTF8.GetBytes(saltedKey);
        var hash = sha256.ComputeHash(keyBytes);
        var hashedKey = Convert.ToBase64String(hash);

        var apiKey = new ApiKey
        {
            Email = link.Email,
            HashedKey = hashedKey
        };

        link.IsUsed = true;
        _context.ApiKeys.Add(apiKey);
        await _context.SaveChangesAsync();

        return Ok();
    }
}

public class StoreKeyRequest
{
    public string Token { get; set; } = string.Empty;
    public string HashedKey { get; set; } = string.Empty;
} 