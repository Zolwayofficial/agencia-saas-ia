import pandas as pd
import numpy as np
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('data_analyzer_skill')

class DataAnalyzerSkill:
    """
    Skill for analyzing raw data extracted from PostgreSQL (or other sources)
    and computing metrics for dashboards.
    """
    
    @staticmethod
    def calculate_ltv(data: list) -> float:
        """
        Calculates the Average Life Time Value from a list of customer transactions.
        Assumes data is a list of dicts with 'customer_id' and 'amount_spent'.
        """
        logger.info("Computing LTV metric...")
        try:
            df = pd.DataFrame(data)
            if df.empty or 'customer_id' not in df.columns or 'amount_spent' not in df.columns:
                return 0.0
            
            ltv_per_customer = df.groupby('customer_id')['amount_spent'].sum()
            return float(ltv_per_customer.mean())
        except Exception as e:
            logger.error(f"Failed to calculate LTV: {e}")
            return 0.0

    @staticmethod
    def aggregate_revenue_by_month(data: list, date_col='date', amount_col='amount') -> str:
        """
        Groups transactions by month and sums the revenue.
        Returns a JSON string of the aggregated data.
        """
        logger.info("Aggregating revenue by month...")
        try:
            df = pd.DataFrame(data)
            if df.empty or date_col not in df.columns or amount_col not in df.columns:
                return "[]"
                
            df[date_col] = pd.to_datetime(df[date_col])
            df.set_index(date_col, inplace=True)
            
            # Resample by month (end of month)
            monthly_revenue = df[amount_col].resample('M').sum().reset_index()
            # Format date to YYYY-MM
            monthly_revenue[date_col] = monthly_revenue[date_col].dt.strftime('%Y-%m')
            
            # Rename columns to standard 'label' and 'value' for charts
            monthly_revenue.rename(columns={date_col: 'label', amount_col: 'value'}, inplace=True)
            
            return monthly_revenue.to_json(orient='records')
        except Exception as e:
            logger.error(f"Failed to aggregate revenue: {e}")
            return "[]"

    @staticmethod
    def compute_churn_rate(active_customers_start: int, customers_lost: int) -> float:
        """
        Simple churn rate calculation.
        """
        if active_customers_start <= 0:
            return 0.0
        return float(customers_lost / active_customers_start) * 100

# Example usage available for the Agent
if __name__ == "__main__":
    sample_data = [
        {"customer_id": 1, "amount_spent": 50, "date": "2026-01-15"},
        {"customer_id": 1, "amount_spent": 150, "date": "2026-02-10"},
        {"customer_id": 2, "amount_spent": 300, "date": "2026-01-20"}
    ]
    analyzer = DataAnalyzerSkill()
    print("Aggregate:", analyzer.aggregate_revenue_by_month(sample_data, date_col='date', amount_col='amount_spent'))
    print("LTV:", analyzer.calculate_ltv(sample_data))
