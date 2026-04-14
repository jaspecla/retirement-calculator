namespace RetirementCalculator.Api.Services;

public static class SocialSecurityCalculator
{
    private const int MinClaimingAge = 62;
    private const int MaxClaimingAge = 70;
    private const int DefaultFra = 67;

    /// <summary>
    /// Calculates the adjusted monthly benefit based on claiming age relative to FRA.
    /// Early: 5/9 of 1% per month for first 36 months, then 5/12 of 1% for additional months.
    /// Late: 2/3 of 1% per month (8% per year) up to age 70.
    /// </summary>
    public static decimal CalculateAdjustedBenefit(decimal monthlyBenefitAtFRA, int claimingAge, int fra = DefaultFra)
    {
        if (claimingAge < MinClaimingAge || claimingAge > MaxClaimingAge)
            throw new ArgumentOutOfRangeException(nameof(claimingAge), "Claiming age must be between 62 and 70.");

        int monthsDifference = (claimingAge - fra) * 12;

        if (monthsDifference == 0)
            return monthlyBenefitAtFRA;

        if (monthsDifference < 0)
        {
            int monthsEarly = Math.Abs(monthsDifference);
            int firstTierMonths = Math.Min(monthsEarly, 36);
            int secondTierMonths = monthsEarly - firstTierMonths;

            decimal reductionRate = (firstTierMonths * (5m / 9m / 100m))
                                  + (secondTierMonths * (5m / 12m / 100m));

            return monthlyBenefitAtFRA * (1m - reductionRate);
        }

        // Delayed retirement credits capped at age 70
        int monthsLate = Math.Min(monthsDifference, (MaxClaimingAge - fra) * 12);
        decimal increaseRate = monthsLate * (2m / 3m / 100m);

        return monthlyBenefitAtFRA * (1m + increaseRate);
    }

    /// <summary>
    /// Calculates the annual benefit for a given year, with COLA adjustments compounding
    /// from the first year of claiming. Returns 0 if currentAge is less than claimingAge.
    /// </summary>
    public static decimal CalculateAnnualBenefit(
        decimal monthlyBenefitAtFRA,
        int claimingAge,
        int currentAge,
        decimal inflationRate,
        int retirementStartAge)
    {
        if (currentAge < claimingAge)
            return 0m;

        decimal adjustedMonthly = CalculateAdjustedBenefit(monthlyBenefitAtFRA, claimingAge);

        int yearsReceiving = currentAge - claimingAge;
        decimal colaFactor = (decimal)Math.Pow((double)(1m + inflationRate), yearsReceiving);

        return adjustedMonthly * colaFactor * 12m;
    }

    /// <summary>
    /// Calculates the excess spousal benefit on top of the spouse's own benefit.
    /// Spousal benefit is up to 50% of the worker's PIA, reduced if claiming early.
    /// Returns the additional amount above the spouse's own benefit, or 0 if own benefit is higher.
    /// </summary>
    public static decimal CalculateSpousalBenefit(
        decimal workerMonthlyBenefit,
        decimal spouseOwnBenefit,
        int spouseClaimingAge,
        int fra = DefaultFra)
    {
        decimal maxSpousalBenefit = workerMonthlyBenefit * 0.5m;

        if (spouseOwnBenefit >= maxSpousalBenefit)
            return 0m;

        decimal spousalTop = maxSpousalBenefit - spouseOwnBenefit;

        // Apply early claiming reduction to the spousal portion
        if (spouseClaimingAge < fra)
        {
            int monthsEarly = (fra - spouseClaimingAge) * 12;
            int firstTierMonths = Math.Min(monthsEarly, 36);
            int secondTierMonths = monthsEarly - firstTierMonths;

            decimal reductionRate = (firstTierMonths * (25m / 36m / 100m))
                                  + (secondTierMonths * (5m / 12m / 100m));

            spousalTop *= (1m - reductionRate);
        }

        return Math.Max(spousalTop, 0m);
    }
}
