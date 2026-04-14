# Retirement Calculator

A Monte Carlo retirement planning tool for US-based retirement scenarios. Built with React + ASP.NET Core.

## Features

- **Monte Carlo Simulation** — 5,000 iterations (configurable) modeling market uncertainty
- **Account Types** — Taxable brokerage, Traditional 401(k)/IRA, Roth IRA/401(k)
- **Social Security** — Claiming ages 62–70 with early/late adjustments and spousal benefits
- **Federal Taxes** — 2024 brackets, standard deduction, Social Security taxation, capital gains
- **Health Insurance** — Pre-Medicare premiums and post-65 Medicare/Medigap estimates
- **Withdrawal Strategy** — Taxable → Traditional → Roth ordering with RMDs at age 73
- **Sequence of Returns Risk** — Identifies scenarios where poor early-retirement returns cause failure
- **Scenario Comparison** — Save and compare up to 3 scenarios side by side
- **Filing Status** — Supports Single and Married Filing Jointly

## Prerequisites

- [.NET 8+ SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)

## Getting Started

### Backend

```bash
cd backend/RetirementCalculator.Api
dotnet run
```

The API starts at `http://localhost:5127`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`. API requests are proxied to the backend.

### Run Tests

```bash
cd backend/RetirementCalculator.Tests
dotnet test
```

## Architecture

```
Frontend (React + TypeScript)     →  POST /api/simulate  →  Backend (ASP.NET Core)
├── Input Form                                              ├── MonteCarloEngine
├── Fan Chart (P10–P90)                                     ├── TaxCalculator
├── SoR Risk Panel                                          ├── SocialSecurityCalculator
├── Summary Stats                                           ├── HealthInsuranceCalculator
└── Scenario Comparison                                     ├── WithdrawalStrategy
                                                            └── SequenceOfReturnsAnalyzer
```

## Limitations

- **Federal tax only** — state taxes are not modeled
- **No pension income** modeling
- **Simplified withdrawal ordering** — does not optimize for tax efficiency
- **Normal distribution** for market returns (no fat tails)
- **Educational purposes only** — not financial advice
