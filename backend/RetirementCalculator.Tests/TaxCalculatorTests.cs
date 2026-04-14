using RetirementCalculator.Api.Models;
using RetirementCalculator.Api.Services;

namespace RetirementCalculator.Tests;

public class TaxCalculatorTests
{
    [Fact]
    public void SingleFiler_IncomeBelowStandardDeduction_PaysZeroTax()
    {
        decimal tax = TaxCalculator.CalculateIncomeTax(10_000m, FilingStatus.Single, 30);
        Assert.Equal(0m, tax);
    }

    [Fact]
    public void SingleFiler_With50kIncome_CalculatesCorrectTax()
    {
        // Standard deduction = $14,600, so taxable = $35,400
        // 10% on first $11,600 = $1,160
        // 12% on ($35,400 - $11,600) = 12% on $23,800 = $2,856
        // Total = $4,016
        decimal tax = TaxCalculator.CalculateIncomeTax(50_000m, FilingStatus.Single, 30);
        Assert.InRange(tax, 4_015m, 4_017m);
    }

    [Fact]
    public void MFJ_With100kIncome_CalculatesCorrectTax()
    {
        // MFJ standard deduction = $29,200, so taxable = $70,800
        // 10% on first $23,200 = $2,320
        // 12% on ($70,800 - $23,200) = 12% on $47,600 = $5,712
        // Total = $8,032
        decimal tax = TaxCalculator.CalculateIncomeTax(100_000m, FilingStatus.MarriedFilingJointly, 50);
        Assert.InRange(tax, 8_031m, 8_033m);
    }

    [Fact]
    public void Age65Plus_GetsAdditionalStandardDeduction()
    {
        // Single age 65+: deduction = $14,600 + $1,950 = $16,550
        // Taxable on $50,000 = $33,450
        decimal taxUnder65 = TaxCalculator.CalculateIncomeTax(50_000m, FilingStatus.Single, 30);
        decimal taxOver65 = TaxCalculator.CalculateIncomeTax(50_000m, FilingStatus.Single, 65);
        Assert.True(taxOver65 < taxUnder65, "Tax at 65+ should be lower due to additional deduction");
        // Difference should be roughly $1,950 * marginal rate (12%) = $234
        Assert.InRange(taxUnder65 - taxOver65, 233m, 235m);
    }

    [Fact]
    public void CapitalGains_ZeroBracket_ForLowIncome()
    {
        // Single: 0% bracket up to $47,025 of taxable income
        // With $0 ordinary income and $10,000 cap gains, all gains in 0% bracket
        decimal tax = TaxCalculator.CalculateCapitalGainsTax(10_000m, 0m, FilingStatus.Single);
        Assert.Equal(0m, tax);
    }

    [Fact]
    public void CapitalGains_15Percent_ForModerateIncome()
    {
        // Single: 0% bracket up to $47,025
        // Ordinary income of $50,000 fills past the 0% bracket
        // All $20,000 of cap gains taxed at 15%
        decimal tax = TaxCalculator.CalculateCapitalGainsTax(20_000m, 50_000m, FilingStatus.Single);
        Assert.Equal(3_000m, tax);
    }

    [Fact]
    public void SocialSecurity_ZeroTaxable_WhenBelowThreshold()
    {
        // Single threshold = $25,000
        // SS = $15,000, other income = $10,000
        // Provisional = $10,000 + $7,500 = $17,500 < $25,000
        decimal taxable = TaxCalculator.CalculateTaxableSocialSecurity(15_000m, 10_000m, FilingStatus.Single);
        Assert.Equal(0m, taxable);
    }

    [Fact]
    public void SocialSecurity_85Percent_WhenAboveUpperThreshold()
    {
        // Single upper threshold = $34,000
        // SS = $30,000, other income = $50,000
        // Provisional = $50,000 + $15,000 = $65,000 >> $34,000
        // 50% portion = 0.50 * ($34,000 - $25,000) = $4,500
        // 85% portion = 0.85 * ($65,000 - $34,000) = $26,350
        // Sum = $30,850, cap at 85% * $30,000 = $25,500
        decimal taxable = TaxCalculator.CalculateTaxableSocialSecurity(30_000m, 50_000m, FilingStatus.Single);
        Assert.Equal(25_500m, taxable);
    }

    [Fact]
    public void CalculateTotalTax_CombinesAllSourcesCorrectly()
    {
        decimal totalTax = TaxCalculator.CalculateTotalTax(
            traditionalWithdrawals: 40_000m,
            socialSecurityIncome: 20_000m,
            capitalGains: 10_000m,
            filingStatus: FilingStatus.Single,
            age: 68);

        // Should be positive and combine income tax + cap gains tax
        Assert.True(totalTax > 0m, "Total tax should be positive with these inputs");

        // Verify it's a reasonable amount (not astronomical or negative)
        Assert.InRange(totalTax, 1m, 20_000m);

        // Verify components add up: compute each piece separately
        decimal taxableSs = TaxCalculator.CalculateTaxableSocialSecurity(20_000m, 40_000m, FilingStatus.Single);
        decimal ordinaryIncome = 40_000m + taxableSs;
        decimal incomeTax = TaxCalculator.CalculateIncomeTax(ordinaryIncome, FilingStatus.Single, 68);

        // Cap gains bracket placement uses taxable ordinary (after deduction)
        // Age 68: deduction = $14,600 + $1,950 = $16,550
        decimal deduction = 14_600m + 1_950m;
        decimal taxableOrdinary = Math.Max(0, ordinaryIncome - deduction);
        decimal capGainsTax = TaxCalculator.CalculateCapitalGainsTax(10_000m, taxableOrdinary, FilingStatus.Single);

        Assert.InRange(totalTax, incomeTax + capGainsTax - 1m, incomeTax + capGainsTax + 1m);
    }
}
