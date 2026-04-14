namespace RetirementCalculator.Api.Services;

public static class HealthInsuranceCalculator
{
    private const decimal MedicarePartBMonthly = 174.70m;
    private const decimal MedigapSupplementMonthly = 200.00m;
    private const decimal MedicareEscalationRate = 0.05m;
    private const int MedicareEligibilityAge = 65;

    /// <summary>
    /// Calculates the annual health insurance cost for a given year from retirement.
    /// Pre-Medicare: user-provided premium escalated by expectedAnnualIncrease each year.
    /// Post-Medicare (age 65+): Medicare Part B + Medigap supplement, each escalated at 5% annually.
    /// </summary>
    public static decimal CalculateAnnualCost(
        int currentAge,
        int retirementStartAge,
        decimal monthlyPremiumPreMedicare,
        decimal expectedAnnualIncrease,
        int yearsFromRetirement)
    {
        int ageInYear = retirementStartAge + yearsFromRetirement;

        if (ageInYear < MedicareEligibilityAge)
        {
            decimal escalatedMonthly = monthlyPremiumPreMedicare
                * (decimal)Math.Pow((double)(1m + expectedAnnualIncrease), yearsFromRetirement);
            return escalatedMonthly * 12m;
        }

        // Post-Medicare: escalate from year 1 (not year 0)
        int medicareYears = ageInYear - MedicareEligibilityAge;
        decimal partB = MedicarePartBMonthly
            * (decimal)Math.Pow((double)(1m + MedicareEscalationRate), medicareYears);
        decimal medigap = MedigapSupplementMonthly
            * (decimal)Math.Pow((double)(1m + MedicareEscalationRate), medicareYears);

        return (partB + medigap) * 12m;
    }
}
