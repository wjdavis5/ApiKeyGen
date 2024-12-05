using System;

namespace ApiKeyManager.Api.Models;

public class ApiKey
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string HashedKey { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; }
} 