using Microsoft.AspNetCore.Mvc;
using RetirementCalculator.Api.Models;
using RetirementCalculator.Api.Services;

namespace RetirementCalculator.Api.Controllers;

[ApiController]
[Route("api")]
public class SimulationController : ControllerBase
{
    [HttpPost("simulate")]
    public ActionResult<SimulationResponse> Simulate([FromBody] SimulationRequest request)
    {
        if (request.CurrentAge >= request.RetirementAge)
            return BadRequest("Current age must be less than retirement age.");

        if (request.RetirementAge >= request.LifeExpectancy)
            return BadRequest("Retirement age must be less than life expectancy.");

        if (request.Accounts.Count == 0)
            return BadRequest("At least one account is required.");

        if (request.SimulationIterations < 100 || request.SimulationIterations > 50000)
            return BadRequest("Simulation iterations must be between 100 and 50,000.");

        if (request.FilingStatus == FilingStatus.MarriedFilingJointly)
        {
            if (!request.SpouseCurrentAge.HasValue || !request.SpouseRetirementAge.HasValue)
                return BadRequest("Spouse age information is required for married filing jointly.");
        }

        var response = MonteCarloEngine.Run(request);
        return Ok(response);
    }
}
