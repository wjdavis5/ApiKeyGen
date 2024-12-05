namespace ApiKeyManager.Api.Services;

public interface IEmailService
{
    Task SendOneTimeLink(string email, string link);
} 