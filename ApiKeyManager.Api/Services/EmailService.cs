using ApiKeyManager.Api.Services;

public class EmailService: IEmailService {
    public Task SendOneTimeLink(string email, string link)
    {
        // Send email
        return Task.CompletedTask;
    }
}