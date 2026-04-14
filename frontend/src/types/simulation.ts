export type FilingStatus = 'Single' | 'MarriedFilingJointly';
export type AccountType = 'Taxable' | 'Traditional401k' | 'TraditionalIRA' | 'RothIRA' | 'Roth401k';

export interface AccountInfo {
  name: string;
  type: AccountType;
  balance: number;
  annualContribution: number;
}

export interface SocialSecurityInfo {
  claimingAge: number;
  estimatedMonthlyBenefit: number;
}

export interface HealthInsuranceInfo {
  monthlyPremiumPreMedicare: number;
  expectedAnnualIncrease: number;
}

export interface MarketReturnInfo {
  mean: number;
  standardDeviation: number;
}

export interface SimulationRequest {
  filingStatus: FilingStatus;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  annualIncome: number;
  spouseCurrentAge?: number;
  spouseRetirementAge?: number;
  spouseLifeExpectancy?: number;
  spouseAnnualIncome?: number;
  annualExpenses: number;
  accounts: AccountInfo[];
  socialSecurity: SocialSecurityInfo;
  spouseSocialSecurity?: SocialSecurityInfo;
  healthInsurance: HealthInsuranceInfo;
  inflationRate: number;
  marketReturn: MarketReturnInfo;
  simulationIterations: number;
}

export interface YearlyValue {
  age: number;
  portfolioValue: number;
}

export interface PercentileData {
  p10: YearlyValue[];
  p25: YearlyValue[];
  p50: YearlyValue[];
  p75: YearlyValue[];
  p90: YearlyValue[];
}

export interface YearlySocialSecurity {
  age: number;
  annualBenefit: number;
}

export interface AdverseScenarioExample {
  yearlyReturns: number[];
  yearlyBalances: number[];
  startAge: number;
}

export interface SequenceOfReturnsRisk {
  adverseScenarioCount: number;
  adverseScenarioRate: number;
  averageDepletionAge: number;
  worstCaseFirstDecadeReturn: number;
  exampleAdverseScenario?: AdverseScenarioExample;
}

export interface SimulationResponse {
  percentiles: PercentileData;
  successRate: number;
  medianEndingBalance: number;
  socialSecurityBreakdown: YearlySocialSecurity[];
  averageEffectiveTaxRate: number;
  sequenceOfReturnsRisk: SequenceOfReturnsRisk;
}

export const DEFAULT_REQUEST: SimulationRequest = {
  filingStatus: 'Single',
  currentAge: 35,
  retirementAge: 65,
  lifeExpectancy: 90,
  annualIncome: 100000,
  annualExpenses: 60000,
  accounts: [
    { name: '401(k)', type: 'Traditional401k', balance: 150000, annualContribution: 20000 },
    { name: 'Roth IRA', type: 'RothIRA', balance: 30000, annualContribution: 7000 },
    { name: 'Brokerage', type: 'Taxable', balance: 50000, annualContribution: 10000 },
  ],
  socialSecurity: { claimingAge: 67, estimatedMonthlyBenefit: 2500 },
  healthInsurance: { monthlyPremiumPreMedicare: 600, expectedAnnualIncrease: 0.05 },
  inflationRate: 0.025,
  marketReturn: { mean: 0.10, standardDeviation: 0.15 },
  simulationIterations: 5000,
};
