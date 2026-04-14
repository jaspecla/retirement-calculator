using RetirementCalculator.Api.Services;

namespace RetirementCalculator.Tests;

public class SocialSecurityCalculatorTests
{
    private const decimal MonthlyBenefitAtFRA = 2_500m;

    [Fact]
    public void ClaimingAtFRA_ReturnsFullBenefit()
    {
        decimal benefit = SocialSecurityCalculator.CalculateAdjustedBenefit(MonthlyBenefitAtFRA, claimingAge: 67);
        Assert.Equal(MonthlyBenefitAtFRA, benefit);
    }

    [Fact]
    public void ClaimingAt62_Applies30PercentReduction()
    {
        // 60 months early: first 36 months at 5/9% = 20%, next 24 months at 5/12% = 10%
        // Total reduction = 30%
        decimal benefit = SocialSecurityCalculator.CalculateAdjustedBenefit(MonthlyBenefitAtFRA, claimingAge: 62);
        decimal expectedReduction = 0.30m;
        decimal expected = MonthlyBenefitAtFRA * (1m - expectedReduction);
        Assert.InRange(benefit, expected - 1m, expected + 1m);
    }

    [Fact]
    public void ClaimingAt70_Applies24PercentIncrease()
    {
        // 36 months late: 8%/yr * 3 years = 24% increase
        decimal benefit = SocialSecurityCalculator.CalculateAdjustedBenefit(MonthlyBenefitAtFRA, claimingAge: 70);
        decimal expected = MonthlyBenefitAtFRA * 1.24m;
        Assert.InRange(benefit, expected - 1m, expected + 1m);
    }

    [Fact]
    public void AnnualBenefit_ReturnsZero_BeforeClaimingAge()
    {
        decimal benefit = SocialSecurityCalculator.CalculateAnnualBenefit(
            MonthlyBenefitAtFRA, claimingAge: 67, currentAge: 65, inflationRate: 0.025m, retirementStartAge: 65);
        Assert.Equal(0m, benefit);
    }

    [Fact]
    public void AnnualBenefit_AppliesCOLA_OverMultipleYears()
    {
        decimal benefitYear0 = SocialSecurityCalculator.CalculateAnnualBenefit(
            MonthlyBenefitAtFRA, claimingAge: 67, currentAge: 67, inflationRate: 0.025m, retirementStartAge: 65);

        decimal benefitYear3 = SocialSecurityCalculator.CalculateAnnualBenefit(
            MonthlyBenefitAtFRA, claimingAge: 67, currentAge: 70, inflationRate: 0.025m, retirementStartAge: 65);

        // After 3 years of 2.5% COLA, benefit should be higher
        Assert.True(benefitYear3 > benefitYear0, "Benefit should increase with COLA");

        // Expected COLA factor = (1.025)^3 ≈ 1.0769
        decimal expectedFactor = (decimal)Math.Pow(1.025, 3);
        Assert.InRange(benefitYear3, benefitYear0 * expectedFactor - 1m, benefitYear0 * expectedFactor + 1m);
    }

    [Fact]
    public void SpousalBenefit_ReturnsZero_WhenOwnBenefitExceeds50Percent()
    {
        // Worker benefit = $2,000, 50% = $1,000
        // Spouse's own benefit = $1,500 > $1,000, so excess = 0
        decimal spousal = SocialSecurityCalculator.CalculateSpousalBenefit(
            workerMonthlyBenefit: 2_000m,
            spouseOwnBenefit: 1_500m,
            spouseClaimingAge: 67);
        Assert.Equal(0m, spousal);
    }

    [Fact]
    public void SpousalBenefit_ReturnsPositiveExcess_WhenWorkerBenefitHigher()
    {
        // Worker benefit = $3,000, 50% = $1,500
        // Spouse's own benefit = $800
        // Excess = $1,500 - $800 = $700 (at FRA, no reduction)
        decimal spousal = SocialSecurityCalculator.CalculateSpousalBenefit(
            workerMonthlyBenefit: 3_000m,
            spouseOwnBenefit: 800m,
            spouseClaimingAge: 67);
        Assert.Equal(700m, spousal);
    }
}
