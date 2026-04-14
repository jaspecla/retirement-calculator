namespace RetirementCalculator.Api.Models;

public enum FilingStatus { Single, MarriedFilingJointly }
public enum AccountType { Taxable, Traditional401k, TraditionalIRA, RothIRA, Roth401k }

public class SimulationRequest
{
    public FilingStatus FilingStatus { get; set; } = FilingStatus.Single;
    
    // Person 1 (always required)
    public int CurrentAge { get; set; }
    public int RetirementAge { get; set; }
    public int LifeExpectancy { get; set; } = 90;
    public decimal AnnualIncome { get; set; }
    
    // Person 2 (for married filing jointly)
    public int? SpouseCurrentAge { get; set; }
    public int? SpouseRetirementAge { get; set; }
    public int? SpouseLifeExpectancy { get; set; }
    public decimal? SpouseAnnualIncome { get; set; }
    
    public decimal AnnualExpenses { get; set; } // Post-retirement, today's dollars
    
    public List<AccountInfo> Accounts { get; set; } = new();
    
    public SocialSecurityInfo SocialSecurity { get; set; } = new();
    public SocialSecurityInfo? SpouseSocialSecurity { get; set; }
    
    public HealthInsuranceInfo HealthInsurance { get; set; } = new();
    
    public decimal InflationRate { get; set; } = 0.025m; // 2.5%
    
    public MarketReturnInfo MarketReturn { get; set; } = new();
    
    public int SimulationIterations { get; set; } = 5000;
}

public class AccountInfo
{
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public decimal Balance { get; set; }
    public decimal AnnualContribution { get; set; }
}

public class SocialSecurityInfo
{
    public int ClaimingAge { get; set; } = 67; // Full retirement age
    public decimal EstimatedMonthlyBenefit { get; set; } // At FRA
}

public class HealthInsuranceInfo
{
    public decimal MonthlyPremiumPreMedicare { get; set; } = 600m;
    public decimal ExpectedAnnualIncrease { get; set; } = 0.05m; // 5%
}

public class MarketReturnInfo
{
    public decimal Mean { get; set; } = 0.10m; // 10% nominal
    public decimal StandardDeviation { get; set; } = 0.15m; // 15%
}
