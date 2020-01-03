using Microsoft.AspNetCore.Mvc;

namespace Yearparty.Controllers
{
    [Route("")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        public void index()
        {
            Response.Redirect("index.html");
        }
    }
}
