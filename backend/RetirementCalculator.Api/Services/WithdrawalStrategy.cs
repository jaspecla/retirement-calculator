using RetirementCalculator.Api.Models;

namespace RetirementCalculator.Api.Services;

public class WithdrawalResult
{
    public decimal TaxableWithdrawal { get; set; }
    public decimal TraditionalWithdrawal { get; set; }
    public decimal RothWithdrawal { get; set; }
    public decimal RmdAmount { get; set; }
    public decimal TotalWithdrawn { get; set; }
    public decimal Shortfall { get; set; }
    public Dictionary<AccountType, decimal> RemainingBalances { get; set; } = new();
}

public static class WithdrawalStrategy
{
    private static readonly Dictionary<int, decimal> UniformLifetimeTable = new()
    {
        { 73, 26.5m }, { 74, 25.5m }, { 75, 24.6m }, { 76, 23.7m },
        { 77, 22.9m }, { 78, 22.0m }, { 79, 21.1m }, { 80, 20.2m },
        { 81, 19.4m }, { 82, 18.5m }, { 83, 17.7m }, { 84, 16.8m },
        { 85, 16.0m }, { 86, 15.2m }, { 87, 14.4m }, { 88, 13.7m },
        { 89, 12.9m }, { 90, 12.2m }, { 91, 11.5m }, { 92, 10.8m },
        { 93, 10.1m }, { 94, 9.5m },  { 95, 8.9m },  { 96, 8.4m },
        { 97, 7.8m },  { 98, 7.3m },  { 99, 6.8m },  { 100, 6.4m }
    };

    public static decimal CalculateRmd(decimal traditionalBalance, int age)
    {
        if (age < 73 || traditionalBalance <= 0)
            return 0m;

        decimal distributionPeriod = age >= 100
            ? UniformLifetimeTable[100]
            : UniformLifetimeTable[age];

        return traditionalBalance / distributionPeriod;
    }

    public static WithdrawalResult ExecuteWithdrawal(
        Dictionary<AccountType, decimal> balances,
        decimal amountNeeded,
        int age)
    {
        var remaining = new Dictionary<AccountType, decimal>(balances);
        var result = new WithdrawalResult();

        // Step 1: Take forced RMDs from traditional accounts
        decimal traditionalBalance =
            remaining.GetValueOrDefault(AccountType.Traditional401k) +
            remaining.GetValueOrDefault(AccountType.TraditionalIRA);

        decimal rmd = CalculateRmd(traditionalBalance, age);
        if (rmd > 0)
        {
            decimal rmdLeft = rmd;
            rmdLeft = WithdrawFrom(remaining, AccountType.Traditional401k, rmdLeft);
            rmdLeft = WithdrawFrom(remaining, AccountType.TraditionalIRA, rmdLeft);

            decimal actualRmd = rmd - rmdLeft;
            result.RmdAmount = actualRmd;
            result.TraditionalWithdrawal = actualRmd;
            amountNeeded -= actualRmd;
        }

        if (amountNeeded <= 0)
        {
            result.TotalWithdrawn = result.TraditionalWithdrawal;
            result.RemainingBalances = remaining;
            return result;
        }

        // Step 2: Draw from Taxable accounts
        decimal taxableDrawn = DrawFromAccount(remaining, AccountType.Taxable, ref amountNeeded);
        result.TaxableWithdrawal = taxableDrawn;

        // Step 3: Draw from Traditional accounts (beyond RMD)
        if (amountNeeded > 0)
        {
            decimal t401k = DrawFromAccount(remaining, AccountType.Traditional401k, ref amountNeeded);
            decimal tIra = DrawFromAccount(remaining, AccountType.TraditionalIRA, ref amountNeeded);
            result.TraditionalWithdrawal += t401k + tIra;
        }

        // Step 4: Draw from Roth accounts last
        if (amountNeeded > 0)
        {
            decimal roth401k = DrawFromAccount(remaining, AccountType.Roth401k, ref amountNeeded);
            decimal rothIra = DrawFromAccount(remaining, AccountType.RothIRA, ref amountNeeded);
            result.RothWithdrawal = roth401k + rothIra;
        }

        result.Shortfall = amountNeeded > 0 ? amountNeeded : 0;
        result.TotalWithdrawn = result.TaxableWithdrawal + result.TraditionalWithdrawal + result.RothWithdrawal;
        result.RemainingBalances = remaining;

        return result;
    }

    private static decimal DrawFromAccount(
        Dictionary<AccountType, decimal> balances,
        AccountType account,
        ref decimal amountNeeded)
    {
        decimal available = balances.GetValueOrDefault(account);
        if (available <= 0 || amountNeeded <= 0)
            return 0;

        decimal drawn = Math.Min(available, amountNeeded);
        balances[account] = available - drawn;
        amountNeeded -= drawn;
        return drawn;
    }

    private static decimal WithdrawFrom(
        Dictionary<AccountType, decimal> balances,
        AccountType account,
        decimal amount)
    {
        decimal available = balances.GetValueOrDefault(account);
        if (available <= 0 || amount <= 0)
            return amount;

        decimal drawn = Math.Min(available, amount);
        balances[account] = available - drawn;
        return amount - drawn;
    }
}
