export function addCondition(query, condition, operator = "&&") {
  if (!condition) return query;  // Nothing to add
  return query ? `${query} ${operator} ${condition}` : condition;
}
  
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


  /**
 * Builds the sort option for PocketBase's getList() call.
 * Allows sorting by posted_date, price, or area in ascending (asc) or descending (desc) order.
 */
export function buildSortOption(req,) {
    // Default sort
    let sortOption = '-created'; // fallback if none specified
  
    const { sort_by, sort_direction } = req.query;
    if (!sort_by) {
      return sortOption;
    }
  
    // Valid fields that can be sorted
    const validFields = ['posted_date', 'price', 'area', 'bed','launch_price','delivery_date'];
  
    // Check if requested field is valid
    if (!validFields.includes(sort_by)) {
      return sortOption;
    }
  
    // Determine prefix: '' for ascending, '-' for descending
    let prefix = '-';
    if (sort_direction && sort_direction.toLowerCase() === 'asc') {
      prefix = '';
    }
  
    // Map the sort_by parameter to the actual field in the database
    switch (sort_by) {
      case 'posted_date':
        // If your DB field is posted_date
        sortOption = `${prefix}posted_date`;
        break;
      case 'price':
        // If your DB field is price
        sortOption = `${prefix}price`;
        break;
      case 'delivery_date':
          // If your DB field is price
          sortOption = `${prefix}expected_completion_date`;
          break;
      case 'launch_price':
          // If your DB field is price
        sortOption = `${prefix}launch_price`;
        break;
      case 'area':
        // If your DB field is living_space.area
        sortOption = `${prefix}living_space.area`;
        break;
      case 'bed':
        // If your DB field is living_space.bedrooms
        sortOption = `${prefix}living_space.bedrooms`;
        break;
      default:
        // fallback
        break;
    }
  
    return sortOption;
  }