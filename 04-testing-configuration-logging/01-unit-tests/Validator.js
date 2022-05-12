module.exports = class Validator {
  constructor(rules) {
    this.rules = rules;
  }

  validate(obj) {
    const errors = [];

    if (typeof this.rules !== 'object' || Array.isArray(this.rules) || this.rules === null) {
      errors.push({error: 'Validator argument is not an object'});
      return errors;
    }

    if (Object.keys(this.rules).length === 0) {
      errors.push({error: 'Validator argument is an empty object'});
      return errors;
    }

    for (const field of Object.keys(this.rules)) {
      const rules = this.rules[field];

      if (typeof rules != 'object') {
        errors.push({field, error: `expect ${field} value to be an object`});
        return errors;
      }

      const requiredKeys = ['type', 'min', 'max'];

      let check = false;
      
      requiredKeys.forEach(key => {
        if (!rules[key] && (rules[key] !== 0)) {
          errors.push({field, error: `required key ${key} is not provided`});
          check = true;
        }
      });
      if (check) continue;

      const requiredType = rules.type;
      const availableTypes = ['number', 'string'];

      if (!availableTypes.find(type => type === requiredType)) {
        errors.push({field, error: `unknown data type ${requiredType}`});
        return errors;
      }

      if (typeof rules.min != 'number' || typeof rules.max != 'number') {
        if (typeof rules.min != 'number') {
          errors.push({field, error: `${field} min should be a number`});
        }
        if (typeof rules.max != 'number') {
          errors.push({field, error: `${field} max should be a number`});
        }
        return errors;
      }

      if ((rules.max - rules.min) < 1) {
          errors.push({field, error: `${field} min cannot be equal ${field} max or less than 0`});
          return errors;
      }

      const value = obj[field];
      const type = typeof value;

      check = false;

      if (!value && (value !== 0) && (value !== '')) {
        errors.push({field, error: `${field} is required`});
        check = true;
      }
      if (check) continue;

      check = false;

      if (type !== rules.type) {
        errors.push({field, error: `expect ${rules.type}, got ${type}`});
        check = true;
      }
      if (check) continue;

      switch (type) {
        case 'string':
          if (rules.min < 0 || rules.max < 0) {
            if (rules.min < 0) {
              errors.push({field, error: `${field} min cannot be less than 0, because it's type is a string`});
            }
            if (rules.max < 0) {
              errors.push({field, error: `${field} max cannot be less than 0, because it's type is a string`});
            }
            return errors;
          }
          if (value.length < rules.min) {
            errors.push({field, error: `too short, expect ${rules.min}, got ${value.length}`});
          }
          if (value.length > rules.max) {
            errors.push({field, error: `too long, expect ${rules.max}, got ${value.length}`});
          }
          break;
        case 'number':
          if (value < rules.min) {
            errors.push({field, error: `too little, value cannot be less than ${rules.min}, got ${value}`});
          }
          if (value > rules.max) {
            errors.push({field, error: `too big, value cannot be more than ${rules.max}, got ${value}`});
          }
          break;
      }
    }

    return errors;
  }
};
