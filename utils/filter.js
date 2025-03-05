  export function buildMultiSelectFilter(paramValue, fieldName, operator = "||") {
    if (!paramValue) return null;
    const items = paramValue.split(',');
    // Example: property_type_id = "type1" || property_type_id = "type2"
    const conditions = items.map(item => `${fieldName} = "${item}"`).join(` ${operator} `);
    return `(${conditions})`;
  }
  
  export function buildMultiSelectJSONFilter(paramValue, fieldName, operator = "&&") {
    if (!paramValue) return null;
    const items = paramValue.split(',');
    // Example: amenities ?~ "Pool" && amenities ?~ "Garden"
    const conditions = items.map(item => `${fieldName} ?~ "${item}"`).join(` ${operator} `);
    return `(${conditions})`;
  }

  export function buildExactMatch(paramValue, fieldName) {
    if (!paramValue) return null;
    return `${fieldName} = "${paramValue}"`;
  }
  
  export function buildBooleanMatch(paramValue, fieldName) {
    // If paramValue is "true" or "false"
    if (paramValue === undefined) return null;
    return `${fieldName} = ${paramValue}`;
  }
  
  export function buildNumericRange(minValue, maxValue, fieldName) {
    let condition = "";
    if (minValue) condition = addCondition(condition, `${fieldName} >= ${minValue}`);
    if (maxValue) condition = addCondition(condition, `${fieldName} <= ${maxValue}`);
    return condition || null;
  }


  export function buildMultiSelectNumberFilter(paramValue,fieldName) {
    if (!paramValue) return null;
    const items = paramValue.split(',');
    // Example: living_space.bedrooms = 3 || living_space.bedrooms = 4
    const conditions = items.map(b => `${fieldName} = ${b}`).join(' || ');
    return `(${conditions})`;
  }
  


  export function buildKeywordSearch(keywords, lang) {
    if (!keywords) return null;
    // Example: description_en ~ "luxury"
    return `description_${lang} ~ "${keywords}"`;
  }