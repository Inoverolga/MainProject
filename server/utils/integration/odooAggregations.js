import _ from "lodash";

export const calculateAggregations = (items, fieldConfigs) => {
  const fieldConfigMap = _.keyBy(fieldConfigs, "targetField");

  const fields_aggregation = {};

  for (const type of ["Int", "String", "Bool", "Text"]) {
    for (let i = 1; i <= 3; i++) {
      const fieldName = `custom${type}${i}`;
      const config = fieldConfigMap[fieldName];

      if (!config?.isVisibleInTable) continue;

      const values = items.map((item) => item[fieldName]).filter(Boolean);
      if (values.length === 0) continue;

      fields_aggregation[config.name] = calculateFieldAggregation(
        values,
        type.toLowerCase()
      );
    }
  }

  return {
    total_count: items.length,
    fields_aggregation,
  };
};

const calculateFieldAggregation = (values, type) => {
  const aggregators = {
    number: (vals) => ({
      type: "number",
      count: vals.length,
      sum: _.sum(vals),
      avg: _.mean(vals),
      min: _.min(vals),
      max: _.max(vals),
    }),

    string: (vals) => {
      const counts = _.countBy(vals);

      const topValues = _.chain(counts)
        .map((count, value) => ({
          value,
          count,
          percentage: ((count / vals.length) * 100).toFixed(1),
        }))
        .orderBy("count", "desc")
        .take(5)
        .value();

      return {
        type: "string",
        count: vals.length,
        unique_count: _.keys(counts).length,
        top_values: topValues,
      };
    },

    boolean: (vals) => {
      const counts = _.countBy(vals);

      return {
        type: "boolean",
        count: vals.length,
        true_count: counts.true || 0,
        false_count: counts.false || 0,
        true_percentage: (((counts.true || 0) / vals.length) * 100).toFixed(1),
        false_percentage: (((counts.false || 0) / vals.length) * 100).toFixed(
          1
        ),
      };
    },

    text: (vals) => ({
      type: "text",
      count: vals.length,
      avg_length: _.mean(_.map(vals, "length")).toFixed(1),
      total_length: _.sum(_.map(vals, "length")),
    }),
  };

  return aggregators[type]?.(values) || { type, count: values.length };
};
