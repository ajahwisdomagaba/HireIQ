export interface SalaryBreakdown {
  annualGross: number;
  monthlyGross: number;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  employeePension: number;
  employerPension: number;
  nhf: number;
  cra: number;
  taxableIncome: number;
  annualTax: number;
  monthlyTax: number;
  monthlyNetSalary: number;
}

/**
 * Computes Nigerian statutory deductions according to:
 * - Pension Reform Act 2014 (8% employee, 10% employer)
 * - National Housing Fund (NHF Act) (2.5% of basic)
 * - Personal Income Tax Act (PITA / LIRS Consolidated Relief Allowance & 6 Tax Brackets)
 */
export function calculateNigerianPayroll(annualGross: number): SalaryBreakdown {
  const monthlyGross = Math.round(annualGross / 12);

  // Standard Nigerian BHT breakdown: 50% Basic, 30% Housing, 20% Transport
  const basicSalary = Math.round(annualGross * 0.50);
  const housingAllowance = Math.round(annualGross * 0.30);
  const transportAllowance = Math.round(annualGross * 0.20);
  const otherAllowances = annualGross - (basicSalary + housingAllowance + transportAllowance);

  // Pension Reform Act 2014 (calculated on monthly gross / BHT)
  const employeePensionMonthly = Math.round(monthlyGross * 0.08);
  const employerPensionMonthly = Math.round(monthlyGross * 0.10);
  const employeePensionAnnual = employeePensionMonthly * 12;

  // NHF: 2.5% of basic annual
  const nhfAnnual = Math.round(basicSalary * 0.025);
  const nhfMonthly = Math.round(nhfAnnual / 12);

  // Consolidated Relief Allowance (CRA):
  // Higher of ₦200,000 or 1% of Gross, plus 20% of Gross
  const baseRelief = Math.max(200000, annualGross * 0.01);
  const cra = Math.round(baseRelief + annualGross * 0.20);

  // Total Tax Reliefs
  const totalReliefs = cra + employeePensionAnnual + nhfAnnual;
  const taxableIncome = Math.max(0, annualGross - totalReliefs);

  // Progressive Tax Calculation (6 Brackets)
  let remaining = taxableIncome;
  let annualTax = 0;

  const brackets = [
    { limit: 300000, rate: 0.07 },
    { limit: 300000, rate: 0.11 },
    { limit: 500000, rate: 0.15 },
    { limit: 500000, rate: 0.19 },
    { limit: 1600000, rate: 0.21 },
    { limit: Infinity, rate: 0.24 },
  ];

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.limit);
    annualTax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  // Minimum tax rule: 1% of Gross if calculated tax is less than 1%
  const minimumTax = Math.round(annualGross * 0.01);
  annualTax = Math.max(Math.round(annualTax), minimumTax);

  const monthlyTax = Math.round(annualTax / 12);
  const monthlyNetSalary = monthlyGross - (employeePensionMonthly + monthlyTax + nhfMonthly);

  return {
    annualGross,
    monthlyGross,
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
    employeePension: employeePensionMonthly,
    employerPension: employerPensionMonthly,
    nhf: nhfMonthly,
    cra,
    taxableIncome,
    annualTax,
    monthlyTax,
    monthlyNetSalary,
  };
}