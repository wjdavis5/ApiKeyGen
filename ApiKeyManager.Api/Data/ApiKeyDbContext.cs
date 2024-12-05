using Microsoft.EntityFrameworkCore;
using ApiKeyManager.Api.Models;

namespace ApiKeyManager.Api.Data;

public class ApiKeyDbContext : DbContext
{
    public ApiKeyDbContext(DbContextOptions<ApiKeyDbContext> options)
        : base(options)
    {
    }

    public DbSet<ApiKey> ApiKeys { get; set; }
    public DbSet<OneTimeLink> OneTimeLinks { get; set; }
} 