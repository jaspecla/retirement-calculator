namespace RetirementCalculator.Api.Models;

public class SimulationResponse
{
    public PercentileData Percentiles { get; set; } = new();
    public double SuccessRate { get; set; } // 0.0 to 1.0
    public decimal MedianEndingBalance { get; set; }
    public List<YearlySocialSecurity> SocialSecurityBreakdown { get; set; } = new();
    public double AverageEffectiveTaxRate { get; set; }
    public SequenceOfReturnsRisk SequenceOfReturnsRisk { get; set; } = new();
}

public class PercentileData
{
    public List<YearlyValue> P10 { get; set; } = new();
    public List<YearlyValue> P25 { get; set; } = new();
    public List<YearlyValue> P50 { get; set; } = new();
    public List<YearlyValue> P75 { get; set; } = new();
    public List<YearlyValue> P90 { get; set; } = new();
}

public class YearlyValue
{
    public int Age { get; set; }
    public decimal PortfolioValue { get; set; }
}

public class YearlySocialSecurity
{
    public int Age { get; set; }
    public decimal AnnualBenefit { get; set; }
}

public class SequenceOfReturnsRisk
{
    public int AdverseScenarioCount { get; set; }
    public double AdverseScenarioRate { get; set; } // fraction of failures that are SoR-driven
    public double AverageDepletionAge { get; set; }
    public double WorstCaseFirstDecadeReturn { get; set; }
    public AdverseScenarioExample? ExampleAdverseScenario { get; set; }
}

public class AdverseScenarioExample
{
    public List<double> YearlyReturns { get; set; } = new();
    public List<decimal> YearlyBalances { get; set; } = new();
    public int StartAge { get; set; }
}
