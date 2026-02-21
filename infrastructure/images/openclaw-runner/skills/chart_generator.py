import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('chart_generator_skill')

class ChartGeneratorSkill:
    """
    Transforms analyzed data into JSON structures compatible with 
    Frontend Charting Libraries (Tremor for Next.js or Appsmith Charts).
    """

    @staticmethod
    def generate_appsmith_chart_data(data_json: str, chart_title: str = "Chart") -> str:
        """
        Takes data like [{"label": "Jan", "value": 100}] and wraps it for Appsmith ECharts.
        """
        try:
            data = json.loads(data_json)
            xAxisData = [item['label'] for item in data]
            seriesData = [item['value'] for item in data]
            
            appsmith_echart_config = {
                "title": { "text": chart_title },
                "tooltip": { "trigger": "axis" },
                "xAxis": { "type": "category", "data": xAxisData },
                "yAxis": { "type": "value" },
                "series": [
                    {
                        "data": seriesData,
                        "type": "bar", # can be parameterized
                        "smooth": True
                    }
                ]
            }
            return json.dumps(appsmith_echart_config, indent=2)
        except Exception as e:
            logger.error(f"Error generating Appsmith JSON: {e}")
            return "{}"

    @staticmethod
    def generate_tremor_data(data_json: str, x_axis_key: str = "label", category_key: str = "value") -> str:
        """
        Transforms data into the array of objects expected by Tremor's BarChart/AreaChart.
        Example: {"label": "Jan", "Sales": 100}
        """
        try:
            data = json.loads(data_json)
            # Tremor is usually quite flexible and can take the flat array directly,
            # but we ensure keys align with what the React component expects.
            
            tremor_data = []
            for item in data:
                tremor_data.append({
                    x_axis_key: item.get('label', ''),
                    category_key: item.get('value', 0)
                })
            
            return json.dumps(tremor_data, indent=2)
        except Exception as e:
            logger.error(f"Error generating Tremor JSON: {e}")
            return "[]"

if __name__ == "__main__":
    sample_json = '[{"label": "2026-01", "value": 350.0}, {"label": "2026-02", "value": 150.0}]'
    generator = ChartGeneratorSkill()
    print("Appsmith format:")
    print(generator.generate_appsmith_chart_data(sample_json, "Revenue by Month"))
