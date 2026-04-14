using RetirementCalculator.Api.Models;

namespace RetirementCalculator.Api.Services;

public class IterationResult
{
    public List<double> YearlyReturns { get; set; } = new();
    public List<decimal> YearlyBalances { get; set; } = new();
    public bool Depleted { get; set; }
    public int? DepletionAge { get; set; }
    public double AverageLifetimeReturn { get; set; }

    // Internal fields for tax rate aggregation
    internal decimal _totalTaxes;
    internal decimal _totalIncome;
}

public static class MonteCarloEngine
{
    [ThreadStatic]
    private static Random? t_random;

    public static SimulationResponse Run(SimulationRequest request)
    {
        var (response, iterations) = RunWithDetails(request);
        response.SequenceOfReturnsRisk = SequenceOfReturnsAnalyzer.Analyze(iterations, request);
        return response;
    }

    public static (SimulationResponse Response, List<IterationResult> Iterations) RunWithDetails(SimulationRequest request)
    {
        int totalYears = request.LifeExpectancy - request.CurrentAge + 1;
        int retirementYear = request.RetirementAge - request.CurrentAge;
        int iterations = request.SimulationIterations;
        bool isMarried = request.FilingStatus == FilingStatus.MarriedFilingJointly;

        var iterationResults = new IterationResult[iterations];
        // Per-iteration, per-age portfolio values for percentile calculation
        var portfolioValues = new decimal[iterations][];

        Parallel.For(0, iterations, () => GetThreadLocalRandom(), (i, state, rng) =>
        {
            iterationResults[i] = RunSingleIteration(request, rng, totalYears, retirementYear, isMarried, out var balancesByAge);
            portfolioValues[i] = balancesByAge;
            return rng;
        },
        _ => { });

        // Build response
        var response = new SimulationResponse();

        // Percentiles: for each age, gather values across iterations
        int retirementPhaseLength = request.LifeExpectancy - request.RetirementAge + 1;
        var p10 = new List<YearlyValue>(retirementPhaseLength);
        var p25 = new List<YearlyValue>(retirementPhaseLength);
        var p50 = new List<YearlyValue>(retirementPhaseLength);
        var p75 = new List<YearlyValue>(retirementPhaseLength);
        var p90 = new List<YearlyValue>(retirementPhaseLength);

        var sortBuffer = new decimal[iterations];

        for (int yearIdx = retirementYear; yearIdx < totalYears; yearIdx++)
        {
            int age = request.CurrentAge + yearIdx;
            for (int i = 0; i < iterations; i++)
                sortBuffer[i] = portfolioValues[i][yearIdx];

            Array.Sort(sortBuffer);

            p10.Add(new YearlyValue { Age = age, PortfolioValue = Percentile(sortBuffer, 0.10) });
            p25.Add(new YearlyValue { Age = age, PortfolioValue = Percentile(sortBuffer, 0.25) });
            p50.Add(new YearlyValue { Age = age, PortfolioValue = Percentile(sortBuffer, 0.50) });
            p75.Add(new YearlyValue { Age = age, PortfolioValue = Percentile(sortBuffer, 0.75) });
            p90.Add(new YearlyValue { Age = age, PortfolioValue = Percentile(sortBuffer, 0.90) });
        }

        response.Percentiles = new PercentileData { P10 = p10, P25 = p25, P50 = p50, P75 = p75, P90 = p90 };

        // Success rate
        int successCount = 0;
        for (int i = 0; i < iterations; i++)
            if (!iterationResults[i].Depleted) successCount++;
        response.SuccessRate = (double)successCount / iterations;

        // Median ending balance (across successful iterations, 0 if none)
        var endingBalances = new List<decimal>();
        int lastIdx = totalYears - 1;
        for (int i = 0; i < iterations; i++)
            if (!iterationResults[i].Depleted)
                endingBalances.Add(portfolioValues[i][lastIdx]);

        if (endingBalances.Count > 0)
        {
            endingBalances.Sort();
            response.MedianEndingBalance = Percentile(endingBalances, 0.50);
        }

        // Average effective tax rate: computed inside iterations, aggregate here
        // We stored total taxes and total income in the iteration result's YearlyReturns/YearlyBalances,
        // but to keep IterationResult clean, we compute from a parallel structure.
        // For simplicity, re-derive from one deterministic pass for SS breakdown and compute avg tax from iterations.
        // Actually, let's compute tax data in the iteration and store it separately.
        // We'll use a separate parallel array for tax data.
        // Re-run is expensive, so let's collect tax info during the iteration.
        // We already ran — need a different approach. Use a concurrent collection.
        // Let's fix this by collecting tax info during RunSingleIteration via out params.

        // For now, compute average effective tax rate from the parallel run we already did.
        // We need to refactor RunSingleIteration to also return tax info.
        // See below — RunSingleIteration returns totalTaxes and totalIncome via IterationResult extension.

        // Social Security breakdown (deterministic — same for all iterations)
        var ssBreakdown = new List<YearlySocialSecurity>();
        for (int yearIdx = retirementYear; yearIdx < totalYears; yearIdx++)
        {
            int age = request.CurrentAge + yearIdx;
            int yearsFromRetirement = yearIdx - retirementYear;

            decimal ssIncome = SocialSecurityCalculator.CalculateAnnualBenefit(
                request.SocialSecurity.EstimatedMonthlyBenefit,
                request.SocialSecurity.ClaimingAge,
                age,
                request.InflationRate,
                request.RetirementAge);

            if (isMarried && request.SpouseSocialSecurity != null && request.SpouseCurrentAge.HasValue)
            {
                int spouseAge = request.SpouseCurrentAge.Value + (age - request.CurrentAge);
                ssIncome += SocialSecurityCalculator.CalculateAnnualBenefit(
                    request.SpouseSocialSecurity.EstimatedMonthlyBenefit,
                    request.SpouseSocialSecurity.ClaimingAge,
                    spouseAge,
                    request.InflationRate,
                    request.SpouseRetirementAge ?? request.RetirementAge);
            }

            ssBreakdown.Add(new YearlySocialSecurity { Age = age, AnnualBenefit = ssIncome });
        }
        response.SocialSecurityBreakdown = ssBreakdown;

        // Average effective tax rate from tax data collected during iterations
        response.AverageEffectiveTaxRate = ComputeAverageEffectiveTaxRate(iterationResults);

        var iterationList = new List<IterationResult>(iterationResults);
        return (response, iterationList);
    }

    private static IterationResult RunSingleIteration(
        SimulationRequest request,
        Random rng,
        int totalYears,
        int retirementYear,
        bool isMarried,
        out decimal[] balancesByAge)
    {
        var result = new IterationResult();
        balancesByAge = new decimal[totalYears];

        // Initialize account balances aggregated by type
        var balances = new Dictionary<AccountType, decimal>();
        var contributions = new Dictionary<AccountType, decimal>();
        foreach (var account in request.Accounts)
        {
            if (balances.ContainsKey(account.Type))
            {
                balances[account.Type] += account.Balance;
                contributions[account.Type] += account.AnnualContribution;
            }
            else
            {
                balances[account.Type] = account.Balance;
                contributions[account.Type] = account.AnnualContribution;
            }
        }

        double mean = (double)request.MarketReturn.Mean;
        double stdDev = (double)request.MarketReturn.StandardDeviation;

        decimal totalTaxesPaid = 0m;
        decimal totalIncomeReceived = 0m;

        // Pre-retirement phase
        for (int yearIdx = 0; yearIdx < retirementYear; yearIdx++)
        {
            double marketReturn = SampleNormalReturn(rng, mean, stdDev);
            result.YearlyReturns.Add(marketReturn);

            ApplyMarketReturn(balances, marketReturn);
            ApplyContributions(balances, contributions);

            decimal total = TotalBalance(balances);
            balancesByAge[yearIdx] = total;
            result.YearlyBalances.Add(total);
        }

        // Retirement phase
        for (int yearIdx = retirementYear; yearIdx < totalYears; yearIdx++)
        {
            int age = request.CurrentAge + yearIdx;
            int yearsFromRetirement = yearIdx - retirementYear;
            int? spouseAge = isMarried && request.SpouseCurrentAge.HasValue
                ? request.SpouseCurrentAge.Value + (age - request.CurrentAge)
                : null;

            // Inflation-adjusted expenses
            decimal inflationFactor = (decimal)Math.Pow((double)(1m + request.InflationRate), yearsFromRetirement);
            decimal adjustedExpenses = request.AnnualExpenses * inflationFactor;

            // Health insurance
            decimal healthCost = HealthInsuranceCalculator.CalculateAnnualCost(
                request.CurrentAge,
                request.RetirementAge,
                request.HealthInsurance.MonthlyPremiumPreMedicare,
                request.HealthInsurance.ExpectedAnnualIncrease,
                yearsFromRetirement);

            // Social Security income
            decimal ssIncome = SocialSecurityCalculator.CalculateAnnualBenefit(
                request.SocialSecurity.EstimatedMonthlyBenefit,
                request.SocialSecurity.ClaimingAge,
                age,
                request.InflationRate,
                request.RetirementAge);

            if (isMarried && request.SpouseSocialSecurity != null && spouseAge.HasValue)
            {
                ssIncome += SocialSecurityCalculator.CalculateAnnualBenefit(
                    request.SpouseSocialSecurity.EstimatedMonthlyBenefit,
                    request.SpouseSocialSecurity.ClaimingAge,
                    spouseAge.Value,
                    request.InflationRate,
                    request.SpouseRetirementAge ?? request.RetirementAge);
            }

            // Net withdrawal needed
            decimal netNeeded = adjustedExpenses + healthCost - ssIncome;

            WithdrawalResult withdrawal;
            if (netNeeded > 0)
            {
                withdrawal = WithdrawalStrategy.ExecuteWithdrawal(balances, netNeeded, age);
                balances = withdrawal.RemainingBalances;
            }
            else
            {
                withdrawal = new WithdrawalResult
                {
                    TaxableWithdrawal = 0m,
                    TraditionalWithdrawal = 0m,
                    RothWithdrawal = 0m,
                    RmdAmount = 0m,
                    TotalWithdrawn = 0m,
                    Shortfall = 0m,
                    RemainingBalances = new Dictionary<AccountType, decimal>(balances)
                };
            }

            // Calculate taxes
            decimal capitalGains = withdrawal.TaxableWithdrawal * 0.5m;
            decimal taxes = TaxCalculator.CalculateTotalTax(
                withdrawal.TraditionalWithdrawal,
                ssIncome,
                capitalGains,
                request.FilingStatus,
                age,
                spouseAge);

            // Withdraw to cover taxes
            if (taxes > 0)
            {
                var taxWithdrawal = WithdrawalStrategy.ExecuteWithdrawal(balances, taxes, age);
                balances = taxWithdrawal.RemainingBalances;

                if (taxWithdrawal.Shortfall > 0 && withdrawal.Shortfall == 0)
                    withdrawal.Shortfall = taxWithdrawal.Shortfall;
            }

            totalTaxesPaid += taxes;
            totalIncomeReceived += withdrawal.TotalWithdrawn + ssIncome;

            // Apply market return
            double yearReturn = SampleNormalReturn(rng, mean, stdDev);
            result.YearlyReturns.Add(yearReturn);
            ApplyMarketReturn(balances, yearReturn);

            decimal total = TotalBalance(balances);
            balancesByAge[yearIdx] = total;
            result.YearlyBalances.Add(total);

            // Check for depletion
            if (withdrawal.Shortfall > 0)
            {
                result.Depleted = true;
                result.DepletionAge ??= age;
            }
        }

        // Store tax data for aggregation using a convention:
        // We'll abuse AverageLifetimeReturn to also encode tax info.
        // Actually, let's store it properly. We use AverageLifetimeReturn for returns.
        if (result.YearlyReturns.Count > 0)
            result.AverageLifetimeReturn = result.YearlyReturns.Average();

        // Store tax ratio in a thread-safe way — we use a simple field on IterationResult.
        // Since IterationResult doesn't have a tax field, we embed it:
        // totalIncomeReceived can be 0 if no withdrawals; guard against division by zero.
        result._totalTaxes = totalTaxesPaid;
        result._totalIncome = totalIncomeReceived;

        return result;
    }

    private static double ComputeAverageEffectiveTaxRate(IterationResult[] results)
    {
        double sumRates = 0;
        int count = 0;
        for (int i = 0; i < results.Length; i++)
        {
            if (results[i]._totalIncome > 0)
            {
                sumRates += (double)(results[i]._totalTaxes / results[i]._totalIncome);
                count++;
            }
        }
        return count > 0 ? sumRates / count : 0;
    }

    private static decimal Percentile(decimal[] sorted, double p)
    {
        int index = (int)(sorted.Length * p);
        index = Math.Clamp(index, 0, sorted.Length - 1);
        return sorted[index];
    }

    private static decimal Percentile(List<decimal> sorted, double p)
    {
        int index = (int)(sorted.Count * p);
        index = Math.Clamp(index, 0, sorted.Count - 1);
        return sorted[index];
    }

    private static double SampleNormalReturn(Random rng, double mean, double stdDev)
    {
        // Box-Muller transform
        double u1 = 1.0 - rng.NextDouble();
        double u2 = rng.NextDouble();
        double z = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
        return mean + stdDev * z;
    }

    private static void ApplyMarketReturn(Dictionary<AccountType, decimal> balances, double marketReturn)
    {
        decimal factor = 1m + (decimal)marketReturn;
        foreach (var key in balances.Keys.ToList())
        {
            balances[key] = Math.Max(0, balances[key] * factor);
        }
    }

    private static void ApplyContributions(Dictionary<AccountType, decimal> balances, Dictionary<AccountType, decimal> contributions)
    {
        foreach (var (type, amount) in contributions)
        {
            if (balances.ContainsKey(type))
                balances[type] += amount;
            else
                balances[type] = amount;
        }
    }

    private static decimal TotalBalance(Dictionary<AccountType, decimal> balances)
    {
        decimal total = 0;
        foreach (var val in balances.Values)
            total += val;
        return total;
    }

    private static Random GetThreadLocalRandom()
    {
        t_random ??= new Random(Guid.NewGuid().GetHashCode());
        return t_random;
    }
}
