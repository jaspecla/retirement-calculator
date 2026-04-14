using RetirementCalculator.Api.Models;

namespace RetirementCalculator.Api.Services;

public static class TaxCalculator
{
    // 2024 federal income tax brackets: (upper bound, marginal rate)
    private static readonly (decimal Limit, decimal Rate)[] SingleBrackets =
    [
        (11_600m, 0.10m),
        (47_150m, 0.12m),
        (100_525m, 0.22m),
        (191_950m, 0.24m),
        (243_725m, 0.32m),
        (609_350m, 0.35m),
        (decimal.MaxValue, 0.37m)
    ];

    private static readonly (decimal Limit, decimal Rate)[] MfjBrackets =
    [
        (23_200m, 0.10m),
        (94_300m, 0.12m),
        (201_050m, 0.22m),
        (383_900m, 0.24m),
        (487_450m, 0.32m),
        (731_200m, 0.35m),
        (decimal.MaxValue, 0.37m)
    ];

    // 2024 long-term capital gains brackets: (upper bound of taxable income, rate)
    private static readonly (decimal Limit, decimal Rate)[] SingleCapGainsBrackets =
    [
        (47_025m, 0.00m),
        (518_900m, 0.15m),
        (decimal.MaxValue, 0.20m)
    ];

    private static readonly (decimal Limit, decimal Rate)[] MfjCapGainsBrackets =
    [
        (94_050m, 0.00m),
        (583_750m, 0.15m),
        (decimal.MaxValue, 0.20m)
    ];

    // Standard deduction amounts
    private const decimal SingleStandardDeduction = 14_600m;
    private const decimal MfjStandardDeduction = 29_200m;
    private const decimal SingleAdditionalDeduction65 = 1_950m;
    private const decimal MfjAdditionalDeduction65 = 1_550m;
    private const int Age65Threshold = 65;

    // Social Security provisional income thresholds
    private const decimal SingleSsLowerThreshold = 25_000m;
    private const decimal SingleSsUpperThreshold = 34_000m;
    private const decimal MfjSsLowerThreshold = 32_000m;
    private const decimal MfjSsUpperThreshold = 44_000m;

    /// <summary>
    /// Calculates federal income tax on ordinary income after applying the standard deduction.
    /// </summary>
    public static decimal CalculateIncomeTax(
        decimal ordinaryIncome,
        FilingStatus filingStatus,
        int age,
        int? spouseAge = null)
    {
        var deduction = GetStandardDeduction(filingStatus, age, spouseAge);
        var taxableIncome = Math.Max(0, ordinaryIncome - deduction);
        var brackets = filingStatus == FilingStatus.Single ? SingleBrackets : MfjBrackets;

        return ApplyBrackets(taxableIncome, brackets);
    }

    /// <summary>
    /// Calculates long-term capital gains tax using the 0%/15%/20% bracket structure.
    /// The capital gains are stacked on top of ordinary income to determine the applicable rates.
    /// </summary>
    public static decimal CalculateCapitalGainsTax(
        decimal capitalGains,
        decimal ordinaryIncome,
        FilingStatus filingStatus)
    {
        if (capitalGains <= 0) return 0m;

        var brackets = filingStatus == FilingStatus.Single
            ? SingleCapGainsBrackets
            : MfjCapGainsBrackets;

        // Capital gains stack on top of ordinary (taxable) income
        var baseIncome = Math.Max(0, ordinaryIncome);
        decimal tax = 0m;
        decimal remaining = capitalGains;
        decimal filled = baseIncome;

        foreach (var (limit, rate) in brackets)
        {
            if (remaining <= 0) break;

            if (filled >= limit) continue;

            var room = limit - filled;
            var taxable = Math.Min(remaining, room);
            tax += taxable * rate;
            remaining -= taxable;
            filled += taxable;
        }

        return tax;
    }

    /// <summary>
    /// Determines the taxable portion of Social Security benefits based on provisional income.
    /// </summary>
    public static decimal CalculateTaxableSocialSecurity(
        decimal socialSecurityIncome,
        decimal otherIncome,
        FilingStatus filingStatus)
    {
        if (socialSecurityIncome <= 0) return 0m;

        var provisionalIncome = otherIncome + socialSecurityIncome * 0.5m;

        var (lowerThreshold, upperThreshold) = filingStatus == FilingStatus.Single
            ? (SingleSsLowerThreshold, SingleSsUpperThreshold)
            : (MfjSsLowerThreshold, MfjSsUpperThreshold);

        decimal taxableSs;

        if (provisionalIncome <= lowerThreshold)
        {
            taxableSs = 0m;
        }
        else if (provisionalIncome <= upperThreshold)
        {
            // Up to 50% of SS is taxable
            taxableSs = Math.Min(
                0.50m * socialSecurityIncome,
                0.50m * (provisionalIncome - lowerThreshold));
        }
        else
        {
            // Up to 85% of SS is taxable
            var fiftyPercentPortion = 0.50m * (upperThreshold - lowerThreshold);
            var eightyFivePercentPortion = 0.85m * (provisionalIncome - upperThreshold);
            taxableSs = Math.Min(
                0.85m * socialSecurityIncome,
                fiftyPercentPortion + eightyFivePercentPortion);
        }

        return Math.Max(0, taxableSs);
    }

    /// <summary>
    /// Comprehensive tax calculation combining ordinary income, Social Security, and capital gains.
    /// </summary>
    public static decimal CalculateTotalTax(
        decimal traditionalWithdrawals,
        decimal socialSecurityIncome,
        decimal capitalGains,
        FilingStatus filingStatus,
        int age,
        int? spouseAge = null)
    {
        var taxableSs = CalculateTaxableSocialSecurity(
            socialSecurityIncome, traditionalWithdrawals, filingStatus);

        var ordinaryIncome = traditionalWithdrawals + taxableSs;
        var incomeTax = CalculateIncomeTax(ordinaryIncome, filingStatus, age, spouseAge);

        // For capital gains bracket placement, use taxable ordinary income (after deduction)
        var deduction = GetStandardDeduction(filingStatus, age, spouseAge);
        var taxableOrdinary = Math.Max(0, ordinaryIncome - deduction);
        var capGainsTax = CalculateCapitalGainsTax(capitalGains, taxableOrdinary, filingStatus);

        return incomeTax + capGainsTax;
    }

    private static decimal GetStandardDeduction(FilingStatus filingStatus, int age, int? spouseAge)
    {
        var deduction = filingStatus == FilingStatus.Single
            ? SingleStandardDeduction
            : MfjStandardDeduction;

        if (age >= Age65Threshold)
        {
            deduction += filingStatus == FilingStatus.Single
                ? SingleAdditionalDeduction65
                : MfjAdditionalDeduction65;
        }

        if (filingStatus == FilingStatus.MarriedFilingJointly && spouseAge.HasValue && spouseAge.Value >= Age65Threshold)
        {
            deduction += MfjAdditionalDeduction65;
        }

        return deduction;
    }

    private static decimal ApplyBrackets(decimal taxableIncome, (decimal Limit, decimal Rate)[] brackets)
    {
        decimal tax = 0m;
        decimal previousLimit = 0m;

        foreach (var (limit, rate) in brackets)
        {
            if (taxableIncome <= previousLimit) break;

            var taxableInBracket = Math.Min(taxableIncome, limit) - previousLimit;
            tax += taxableInBracket * rate;
            previousLimit = limit;
        }

        return tax;
    }
}
