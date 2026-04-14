using RetirementCalculator.Api.Models;

namespace RetirementCalculator.Api.Services;

public static class SequenceOfReturnsAnalyzer
{
    public static SequenceOfReturnsRisk Analyze(
        List<IterationResult> iterations,
        SimulationRequest request)
    {
        var failures = iterations.Where(i => i.Depleted).ToList();

        if (failures.Count == 0)
        {
            return new SequenceOfReturnsRisk();
        }

        int retirementStartIndex = request.RetirementAge - request.CurrentAge;
        double lifetimeThreshold = (double)(request.MarketReturn.Mean - request.MarketReturn.StandardDeviation);
        double firstDecadeThreshold = (double)(request.MarketReturn.Mean - 0.5m * request.MarketReturn.StandardDeviation);

        var adverseScenarios = new List<(IterationResult Iteration, double FirstDecadeAvg)>();

        foreach (var iteration in failures)
        {
            if (iteration.AverageLifetimeReturn < lifetimeThreshold)
                continue;

            int decadeEnd = Math.Min(
                retirementStartIndex + 10,
                iteration.YearlyReturns.Count);
            int decadeLength = decadeEnd - retirementStartIndex;

            if (decadeLength <= 0)
                continue;

            double firstDecadeAvg = iteration.YearlyReturns
                .Skip(retirementStartIndex)
                .Take(decadeLength)
                .Average();

            if (firstDecadeAvg < firstDecadeThreshold)
            {
                adverseScenarios.Add((iteration, firstDecadeAvg));
            }
        }

        if (adverseScenarios.Count == 0)
        {
            return new SequenceOfReturnsRisk();
        }

        var worstScenario = adverseScenarios.OrderBy(s => s.FirstDecadeAvg).First();

        return new SequenceOfReturnsRisk
        {
            AdverseScenarioCount = adverseScenarios.Count,
            AdverseScenarioRate = (double)adverseScenarios.Count / failures.Count,
            AverageDepletionAge = adverseScenarios
                .Where(s => s.Iteration.DepletionAge.HasValue)
                .Average(s => s.Iteration.DepletionAge!.Value),
            WorstCaseFirstDecadeReturn = worstScenario.FirstDecadeAvg,
            ExampleAdverseScenario = new AdverseScenarioExample
            {
                StartAge = request.RetirementAge,
                YearlyReturns = worstScenario.Iteration.YearlyReturns
                    .Skip(retirementStartIndex).ToList(),
                YearlyBalances = worstScenario.Iteration.YearlyBalances
                    .Skip(retirementStartIndex).ToList(),
            }
        };
    }
}
