using RetirementCalculator.Api.Models;
using RetirementCalculator.Api.Services;

namespace RetirementCalculator.Tests;

public class MonteCarloEngineTests
{
    private static SimulationRequest CreateDefaultRequest() => new()
    {
        FilingStatus = FilingStatus.Single,
        CurrentAge = 35,
        RetirementAge = 65,
        LifeExpectancy = 90,
        AnnualIncome = 100_000,
        AnnualExpenses = 50_000,
        Accounts = new List<AccountInfo>
        {
            new() { Name = "401k", Type = AccountType.Traditional401k, Balance = 200_000, AnnualContribution = 20_000 },
            new() { Name = "Roth", Type = AccountType.RothIRA, Balance = 50_000, AnnualContribution = 7_000 }
        },
        SocialSecurity = new() { ClaimingAge = 67, EstimatedMonthlyBenefit = 2_500 },
        HealthInsurance = new() { MonthlyPremiumPreMedicare = 600, ExpectedAnnualIncrease = 0.05m },
        InflationRate = 0.025m,
        MarketReturn = new() { Mean = 0.10m, StandardDeviation = 0.15m },
        SimulationIterations = 500
    };

    [Fact]
    public void Run_ReturnsValidResponse_WithAllPercentilesPopulated()
    {
        var request = CreateDefaultRequest();
        var response = MonteCarloEngine.Run(request);

        Assert.NotNull(response.Percentiles);
        Assert.NotEmpty(response.Percentiles.P10);
        Assert.NotEmpty(response.Percentiles.P25);
        Assert.NotEmpty(response.Percentiles.P50);
        Assert.NotEmpty(response.Percentiles.P75);
        Assert.NotEmpty(response.Percentiles.P90);

        // All percentile arrays should have same length
        int expectedLength = response.Percentiles.P10.Count;
        Assert.Equal(expectedLength, response.Percentiles.P25.Count);
        Assert.Equal(expectedLength, response.Percentiles.P50.Count);
        Assert.Equal(expectedLength, response.Percentiles.P75.Count);
        Assert.Equal(expectedLength, response.Percentiles.P90.Count);
    }

    [Fact]
    public void Run_SuccessRate_IsBetweenZeroAndOne()
    {
        var request = CreateDefaultRequest();
        var response = MonteCarloEngine.Run(request);

        Assert.InRange(response.SuccessRate, 0.0, 1.0);
    }

    [Fact]
    public void Run_PercentileOrdering_P10_LessThanOrEqual_P90()
    {
        var request = CreateDefaultRequest();
        var response = MonteCarloEngine.Run(request);

        var p = response.Percentiles;
        for (int i = 0; i < p.P10.Count; i++)
        {
            Assert.True(p.P10[i].PortfolioValue <= p.P25[i].PortfolioValue,
                $"P10 > P25 at age {p.P10[i].Age}");
            Assert.True(p.P25[i].PortfolioValue <= p.P50[i].PortfolioValue,
                $"P25 > P50 at age {p.P25[i].Age}");
            Assert.True(p.P50[i].PortfolioValue <= p.P75[i].PortfolioValue,
                $"P50 > P75 at age {p.P50[i].Age}");
            Assert.True(p.P75[i].PortfolioValue <= p.P90[i].PortfolioValue,
                $"P75 > P90 at age {p.P75[i].Age}");
        }
    }

    [Fact]
    public void Run_HighSavingsLowExpenses_SuccessRateNearOne()
    {
        var request = CreateDefaultRequest();
        request.Accounts = new List<AccountInfo>
        {
            new() { Name = "401k", Type = AccountType.Traditional401k, Balance = 5_000_000, AnnualContribution = 50_000 },
            new() { Name = "Roth", Type = AccountType.RothIRA, Balance = 2_000_000, AnnualContribution = 7_000 }
        };
        request.AnnualExpenses = 30_000;

        var response = MonteCarloEngine.Run(request);
        Assert.True(response.SuccessRate >= 0.95, $"Expected high success rate, got {response.SuccessRate}");
    }

    [Fact]
    public void Run_LowSavingsHighExpenses_SuccessRateIsLow()
    {
        var request = CreateDefaultRequest();
        request.Accounts = new List<AccountInfo>
        {
            new() { Name = "401k", Type = AccountType.Traditional401k, Balance = 10_000, AnnualContribution = 1_000 }
        };
        request.AnnualExpenses = 200_000;

        var response = MonteCarloEngine.Run(request);
        Assert.True(response.SuccessRate <= 0.5, $"Expected low success rate, got {response.SuccessRate}");
    }
}
