use crate::error::{AppError, AppResult};
use crate::models::{
    Transaction, Category, Budget, FinancialInsight, SpendingAnalysis,
    CategorySpending, InsightType, InsightImpact, TrendDirection
};
use chrono::{Utc, DateTime, Duration, Datelike};
use rust_decimal::Decimal;
use rust_decimal::prelude::{ToPrimitive, FromPrimitive};
use std::collections::HashMap;

pub struct AIInsightEngine {
    // In a real implementation, this would connect to Claude API or other AI service
}

impl AIInsightEngine {
    pub fn new() -> Self {
        Self {}
    }

    /// Calculate square root of a Decimal using float conversion
    fn decimal_sqrt(value: Decimal) -> Decimal {
        let f_val = value.to_f64().unwrap_or(0.0);
        if f_val < 0.0 {
            Decimal::ZERO
        } else {
            Decimal::from_f64(f_val.sqrt()).unwrap_or(Decimal::ZERO)
        }
    }

    pub async fn generate_spending_insights(
        &self,
        transactions: &[Transaction],
        categories: &[Category],
        budgets: &[Budget],
    ) -> AppResult<Vec<FinancialInsight>> {
        let mut insights = Vec::new();

        // Analyze spending patterns
        insights.extend(self.analyze_spending_patterns(transactions, categories)?);

        // Analyze budget utilization
        insights.extend(self.analyze_budget_performance(transactions, categories, budgets)?);

        // Detect unusual spending
        insights.extend(self.detect_unusual_spending(transactions)?);

        // Suggest budget optimizations
        insights.extend(self.suggest_budget_optimizations(transactions, categories, budgets)?);

        Ok(insights)
    }

    pub async fn analyze_spending_trends(
        &self,
        transactions: &[Transaction],
        period_days: u32,
    ) -> AppResult<SpendingAnalysis> {
        let now = Utc::now();
        let period_start = now - Duration::days(period_days as i64);

        let period_transactions: Vec<&Transaction> = transactions
            .iter()
            .filter(|t| t.date >= period_start && t.date <= now)
            .collect();

        let total_income: Decimal = period_transactions
            .iter()
            .filter(|t| t.transaction_type == "credit")
            .map(|t| t.amount)
            .sum();

        let total_expenses: Decimal = period_transactions
            .iter()
            .filter(|t| t.transaction_type == "debit")
            .map(|t| t.amount)
            .sum();

        let net_savings = total_income - total_expenses;
        let average_daily_spending = if period_days > 0 {
            total_expenses / Decimal::from(period_days)
        } else {
            Decimal::ZERO
        };

        // Calculate spending trend (compare with previous period)
        let previous_period_start = period_start - Duration::days(period_days as i64);
        let previous_transactions: Vec<&Transaction> = transactions
            .iter()
            .filter(|t| t.date >= previous_period_start && t.date < period_start)
            .collect();

        let previous_expenses: Decimal = previous_transactions
            .iter()
            .filter(|t| t.transaction_type == "debit")
            .map(|t| t.amount)
            .sum();

        let spending_trend = if total_expenses > previous_expenses {
            TrendDirection::Increasing
        } else if total_expenses < previous_expenses {
            TrendDirection::Decreasing
        } else {
            TrendDirection::Stable
        };

        // Analyze category spending
        let mut category_spending: HashMap<String, (Decimal, u32)> = HashMap::new();
        let mut total_spending = Decimal::ZERO;

        for transaction in &period_transactions {
            if transaction.transaction_type == "debit" {
                let category_id = transaction.category_id.clone()
                    .unwrap_or_else(|| "uncategorized".to_string());

                let entry = category_spending
                    .entry(category_id.clone())
                    .or_insert((Decimal::ZERO, 0));
                entry.0 += transaction.amount;
                entry.1 += 1;
                total_spending += transaction.amount;
            }
        }

        let top_categories: Vec<CategorySpending> = category_spending
            .into_iter()
            .map(|(category_id, (amount, count))| {
                let percentage = if total_spending > Decimal::ZERO {
                    (amount / total_spending * Decimal::from(100)).to_f32().unwrap_or(0.0) as f64
                } else {
                    0.0
                };

                CategorySpending {
                    category_id,
                    category_name: "Category".to_string(), // Would be resolved from categories
                    amount,
                    transaction_count: count,
                    percentage,
                }
            })
            .collect::<Vec<_>>()
            .into_iter()
            .take(10)
            .collect();

        Ok(SpendingAnalysis {
            total_spending,
            total_income,
            net_savings,
            top_categories,
            average_daily_spending,
            spending_trend,
            period_start: period_start.into(),
            period_end: now.into(),
        })
    }

    fn analyze_spending_patterns(
        &self,
        transactions: &[Transaction],
        _categories: &[Category],
    ) -> AppResult<Vec<FinancialInsight>> {
        let mut insights = Vec::new();

        // Group transactions by day of week
        let mut day_spending: HashMap<u32, Decimal> = HashMap::new();

        for transaction in transactions {
            if transaction.transaction_type == "debit" {
                let day_of_week = transaction.date.weekday().num_days_from_monday();
                *day_spending.entry(day_of_week).or_insert(Decimal::ZERO) += transaction.amount;
            }
        }

        // Find highest spending day
        if let Some((&highest_day, &amount)) = day_spending.iter().max_by(|a, b| a.1.cmp(b.1)) {
            let day_names = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
            let total_weekly: Decimal = day_spending.values().sum();

            if total_weekly > Decimal::ZERO {
                let percentage = (amount / total_weekly * Decimal::from(100)).to_f32().unwrap_or(0.0);

                if percentage > 30.0 { // More than 30% of weekly spending on one day
                    insights.push(FinancialInsight {
                        id: uuid::Uuid::new_v4().to_string(),
                        insight_type: "spending_pattern".to_string(),
                        title: format!("Hoog uitgavenpatroon op {}", day_names[highest_day as usize]),
                        description: format!(
                            "U geeft {:.1}% van uw wekelijkse uitgaven uit op {} (€{}).",
                            percentage, day_names[highest_day as usize], amount
                        ),
                        impact: if percentage > 50.0 { "high".to_string() } else { "medium".to_string() },
                        actionable: true,
                        action_suggestions: serde_json::to_string(&vec![
                            "Bekijk welke aankopen dit veroorzaken".to_string(),
                            "Overweeg een budget in te stellen voor deze dag".to_string(),
                            "Plan grote aankopen op andere dagen".to_string(),
                        ]).unwrap_or_default(),
                        confidence_score: 0.8,
                        created_at: Utc::now(),
                    });
                }
            }
        }

        Ok(insights)
    }

    fn analyze_budget_performance(
        &self,
        transactions: &[Transaction],
        _categories: &[Category],
        budgets: &[Budget],
    ) -> AppResult<Vec<FinancialInsight>> {
        let mut insights = Vec::new();

        for budget in budgets {
            if !budget.is_active {
                continue;
            }

            // Calculate current spending for this budget category
            let current_spending: Decimal = transactions
                .iter()
                .filter(|t| {
                    t.transaction_type == "debit" &&
                    t.category_id == budget.category_id &&
                    t.date >= budget.start_date &&
                    budget.end_date.map_or(true, |end| t.date <= end)
                })
                .map(|t| t.amount)
                .sum();

            let utilization_percentage = if budget.amount > Decimal::ZERO {
                (current_spending / budget.amount * Decimal::from(100)).to_f32().unwrap_or(0.0)
            } else {
                0.0
            };

            // Generate insights based on budget utilization
            if utilization_percentage > 90.0 {
                insights.push(FinancialInsight {
                    id: uuid::Uuid::new_v4().to_string(),
                    insight_type: "budget_optimization".to_string(),
                    title: format!("Budget bijna bereikt: {}", budget.name),
                    description: format!(
                        "U heeft {:.1}% van uw budget voor {} gebruikt (€{} van €{}).",
                        utilization_percentage, budget.name, current_spending, budget.amount
                    ),
                    impact: "high".to_string(),
                    actionable: true,
                    action_suggestions: serde_json::to_string(&vec![
                        "Beperk verdere uitgaven in deze categorie".to_string(),
                        "Overweeg het budget te verhogen indien nodig".to_string(),
                        "Zoek naar manieren om te besparen in deze categorie".to_string(),
                    ]).unwrap_or_default(),
                    confidence_score: 0.9,
                    created_at: Utc::now(),
                });
            }
        }

        Ok(insights)
    }

    fn detect_unusual_spending(&self, transactions: &[Transaction]) -> AppResult<Vec<FinancialInsight>> {
        let mut insights = Vec::new();

        // Look for unusually large transactions
        let amounts: Vec<Decimal> = transactions
            .iter()
            .filter(|t| t.transaction_type == "debit")
            .map(|t| t.amount)
            .collect();

        if !amounts.is_empty() {
            let mean = amounts.iter().sum::<Decimal>() / Decimal::from(amounts.len() as u32);
            let variance = amounts.iter()
                .map(|&x| {
                    let diff = x - mean;
                    let diff_f64 = diff.to_f64().unwrap_or(0.0);
                    Decimal::from_f64(diff_f64 * diff_f64).unwrap_or(Decimal::ZERO)
                })
                .sum::<Decimal>() / Decimal::from(amounts.len() as u32 - 1);
            let std_dev = Self::decimal_sqrt(variance);

            // Flag transactions more than 2 standard deviations from mean
            for transaction in transactions {
                if transaction.transaction_type == "debit" {
                    let z_score = (transaction.amount - mean) / std_dev;

                    if z_score > Decimal::from_f64(2.0).unwrap_or(Decimal::ZERO) {
                        insights.push(FinancialInsight {
                            id: uuid::Uuid::new_v4().to_string(),
                            insight_type: "unusual_activity".to_string(),
                            title: "Ongebruikelijk hoge uitgave gedetecteerd".to_string(),
                            description: format!(
                                "De transactie '{}' (€{}) is significant hoger dan uw gemiddelde uitgaven.",
                                transaction.description, transaction.amount
                            ),
                            impact: "medium".to_string(),
                            actionable: true,
                            action_suggestions: serde_json::to_string(&vec![
                                "Controleer of deze uitgave correct is".to_string(),
                                "Overweeg om dit soort uitgaven in de toekomst te plannen".to_string(),
                            ]).unwrap_or_default(),
                            confidence_score: 0.7,
                            created_at: Utc::now(),
                        });
                    }
                }
            }
        }

        Ok(insights)
    }

    fn suggest_budget_optimizations(
        &self,
        transactions: &[Transaction],
        _categories: &[Category],
        _budgets: &[Budget],
    ) -> AppResult<Vec<FinancialInsight>> {
        let mut insights = Vec::new();

        // Look for recurring transactions that could be optimized
        let mut recurring_patterns: HashMap<String, (Vec<Decimal>, u32)> = HashMap::new();

        for transaction in transactions {
            if transaction.transaction_type == "debit" {
                let key = format!("{}-{}",
                    transaction.description.to_lowercase(),
                    transaction.amount.to_string()
                );

                let entry = recurring_patterns.entry(key)
                    .or_insert((Vec::new(), 0));
                entry.0.push(transaction.amount);
                entry.1 += 1;
            }
        }

        // Identify patterns that occur frequently
        for (pattern, (amounts, count)) in recurring_patterns {
            if count >= 3 { // Occurs at least 3 times
                let total_amount: Decimal = amounts.iter().sum();
                let average_amount = total_amount / Decimal::from(count);

                insights.push(FinancialInsight {
                    id: uuid::Uuid::new_v4().to_string(),
                    insight_type: "recurring_expense".to_string(),
                    title: "Vaste uitgavepatroon gedetecteerd".to_string(),
                    description: format!(
                        "U heeft een patroon van {} uitgaven van gemiddeld €{} gedetecteerd.",
                        count, average_amount
                    ),
                    impact: "low".to_string(),
                    actionable: true,
                    action_suggestions: serde_json::to_string(&vec![
                        "Overweeg om dit als een vaste last in te stellen".to_string(),
                        "Zoek naar goedkopere alternatieven indien mogelijk".to_string(),
                    ]).unwrap_or_default(),
                    confidence_score: 0.8,
                    created_at: Utc::now(),
                });
            }
        }

        Ok(insights)
    }
}

impl Default for AIInsightEngine {
    fn default() -> Self {
        Self::new()
    }
}

// Helper extension trait for Decimal
trait DecimalExt {
    fn sqrt(self) -> Self;
}

impl DecimalExt for Decimal {
    fn sqrt(self) -> Self {
        // Simple square root approximation
        // In a real implementation, use a proper math library
        let f_val = self.to_f64().unwrap_or(0.0);
        Decimal::from_f64(f_val.sqrt()).unwrap_or(Decimal::ZERO)
    }
}