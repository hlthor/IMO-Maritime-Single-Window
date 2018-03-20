
 
using System.Security.Claims;
using System.Threading.Tasks;
using IMOMaritimeSingleWindow.Auth;
using IMOMaritimeSingleWindow.Helpers;
using IMOMaritimeSingleWindow.Models;
using IMOMaritimeSingleWindow.Models.Entities;
using IMOMaritimeSingleWindow.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Result = Microsoft.AspNetCore.Identity.SignInResult;
using Microsoft.AspNetCore.Authorization;
 

namespace IMOMaritimeSingleWindow.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IJwtFactory _jwtFactory;
        private readonly JwtIssuerOptions _jwtOptions;
        private readonly ILogger<AuthController> _logger;

        public AuthController(UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            IJwtFactory jwtFactory,
            IOptions<JwtIssuerOptions> jwtOptions,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtFactory = jwtFactory;
            _jwtOptions = jwtOptions.Value;
            _logger = logger;
        }

        // POST api/auth/login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody]CredentialsViewModel credentials)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userName = credentials.UserName;
            var password = credentials.Password;

            int res = await VerifyCredentials(userName, password);
            switch (res)
            {
                case (int)Constants.LoginStates.OK:
                    _logger.LogDebug("Valid credentials");
                    break;
                case (int)Constants.LoginStates.InvalidCredentials:
                    _logger.LogDebug("Invalid credentials");
                    ModelState.AddModelError(string.Empty, "Invalid login attempt");
                    return BadRequest(Errors.AddErrorToModelState("login_failure", "Invalid username or password.", ModelState));
                case (int)Constants.LoginStates.LockedOut:
                    _logger.LogWarning("User account is locked out.");
                    var forbiddenRequestObject = BadRequest(ModelState);
                    forbiddenRequestObject.StatusCode = Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden;
                    return forbiddenRequestObject;
            }
            
            var identity = await GetClaimsIdentity(userName);
            if (identity == null)
            {
                return BadRequest(Errors.AddErrorToModelState("login_failure", "Invalid username or password.", ModelState));
            }

            var jwt = await Tokens.GenerateJwt(identity, _jwtFactory, credentials.UserName, _jwtOptions, new JsonSerializerSettings { Formatting = Formatting.Indented });
            _logger.LogDebug(jwt);
            return new OkObjectResult(jwt);
        }

        private async Task<int> VerifyCredentials(string userName, string password)
        {
            if (string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(password))
                return (int)Constants.LoginStates.InvalidCredentials;

            var _user = await _userManager.FindByNameAsync(userName);
            if (_user == null)
            {
                _logger.LogDebug("User is null");
                return (int)Constants.LoginStates.InvalidCredentials;
            }

            Microsoft.AspNetCore.Identity.SignInResult result = await _signInManager.CheckPasswordSignInAsync(_user, password, lockoutOnFailure: true);

            if (result.Succeeded)
            {
                // await _userManager.ResetAccessFailedCountAsync(_user);
                _logger.LogInformation("User logged in successfully");
                return (int)Constants.LoginStates.OK;
            }
            else if (result.IsLockedOut)
                return (int)Constants.LoginStates.LockedOut;
            else
            {
                // await _userManager.AccessFailedAsync(_user);
                var noFailed = await _userManager.GetAccessFailedCountAsync(_user);
                _logger.LogError($"Invalid login attempt\nNumber of invalid login attempts thus far: {noFailed}");
            }
            return (int)Constants.LoginStates.InvalidCredentials;
        }

        private async Task<ClaimsIdentity> GetClaimsIdentity(string userName)
        {
            var _user = await _userManager.FindByNameAsync(userName);
            _logger.LogInformation($"Generating JWT for user {_user.Id}");
            return await Task.FromResult(_jwtFactory.GenerateClaimsIdentity(userName, _user.Id));
        }
    }
}