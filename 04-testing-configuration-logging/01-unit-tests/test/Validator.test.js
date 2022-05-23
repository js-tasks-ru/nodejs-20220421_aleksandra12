const Validator = require('../Validator');
const expect = require('chai').expect;

describe('testing-configuration-logging/unit-tests', () => {
  describe('Validator', () => {
    it('в конструктор валидатора переданы некорректные аргументы', () => {
      const arguments = [[], 0, 1, '', 'a', true, false, null, undefined];
      let errors = [];
      arguments.forEach(item => {
        const validator = new Validator(item);
        const vaildatorErrors = validator.validate({ name: 'Lalala' });
        vaildatorErrors.forEach(err => errors.push(err));
      });
      expect(errors).to.have.length(9);
      errors.every(err => expect(err).to.have.property('error').and.to.be.equal('Validator argument is not an object'));

      errors.splice(0, errors.length);

      const validatorEmpty = new Validator({});
      errors = validatorEmpty.validate({ name: 'Lalala' });
      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('error').and.to.be.equal('Validator argument is an empty object');

      errors.splice(0, errors.length);

      const validator = new Validator({ age: {}});
      validator.validate().forEach(item => errors.push(item));

      expect(errors).to.have.length(3);
      const errorsText = errors.map(err => err.error);

      const requiredKeys = ['type', 'min', 'max'];

      requiredKeys.forEach((item, index) => {
        expect(errors[index]).to.have.property('field').to.be.equal('age');
        expect(errorsText).to.include(`required key ${item} is not provided`);
      });
    });
    it('в конструктор валидатора переданы аргументы с некорректными значениями', () => {
      const typeValidator = new Validator({
          name: {
            type: 'boolean',
            min: 10,
            max: 20,
          },
        });
      const typeErrors = typeValidator.validate({ name: 'Lalala' });
      expect(typeErrors).to.have.length(1);
      expect(typeErrors[0]).to.have.property('field').and.to.be.equal('name');
      expect(typeErrors[0]).to.have.property('error').and.to.be.equal('unknown data type boolean');

      const minMaxValidator = new Validator({
        name: {
          min: 'f',
          max: true,
          type: 'number'
        }
      });
      const minMaxErrors = minMaxValidator.validate({ name: 0 });
      expect(minMaxErrors).to.have.length(2);
      expect(minMaxErrors[0]).to.have.property('field').and.to.be.equal('name');
      expect(minMaxErrors[1]).to.have.property('field').and.to.be.equal('name');

      const errorsText = minMaxErrors.map(item => item.error);
      expect(errorsText).to.include('name min should be a number');
      expect(errorsText).to.include('name max should be a number');

      const comparisonValidator = new Validator({
        age: {
          min: -2,
          max: -2,
          type: 'number'
        }
      });
      const comparisonErrors = comparisonValidator.validate({ age: 1 });
      expect(comparisonErrors).to.have.length(1);
      expect(comparisonErrors[0]).to.have.property('field').and.to.be.equal('age');
      expect(comparisonErrors[0]).to.have.property('error').and.to.be.equal('age min cannot be equal age max or less than 0');
    });
    it('валидатор проверяет наличие значений и соответсвие их типов', () => {
      let validator = new Validator({
        name: {
          type: 'string',
          min: 1,
          max: 6,
        },
        age: {
          type: 'number',
          min: 1,
          max: 6,
        },
      });
      let errors = validator.validate({ name: null, age: undefined });
      expect(errors).to.have.length(2);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal('name is required');
      expect(errors[1]).to.have.property('field').and.to.be.equal('age');
      expect(errors[1]).to.have.property('error').and.to.be.equal('age is required');

      validator = new Validator({
        name: {
          type: 'string',
          min: 1,
          max: 6,
        },
        age: {
          type: 'number',
          min: 1,
          max: 6,
        },
      });
      errors = validator.validate({ name: true, age: [] });
      expect(errors).to.have.length(2);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal('expect string, got boolean');
      expect(errors[1]).to.have.property('field').and.to.be.equal('age');
      expect(errors[1]).to.have.property('error').and.to.be.equal('expect number, got object');
    });
    it('валидатор проверяет строковые поля', () => {
      const typeValidator = new Validator({
        name: {
          type: 'string',
          min: -2,
          max: -1,
        },
      });
      const typeErrors = typeValidator.validate({ name: 'Lalala' });

      expect(typeErrors).to.have.length(2);
      expect(typeErrors[0]).to.have.property('field').and.to.be.equal('name');
      expect(typeErrors[1]).to.have.property('field').and.to.be.equal('name');

      const errorsText = typeErrors.map(item => item.error);
      expect(errorsText).to.include("name min cannot be less than 0, because it's type is a string");
      expect(errorsText).to.include("name min cannot be less than 0, because it's type is a string");

      let validator = new Validator({
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
      });

      let errors = validator.validate({ name: 'Lalala' });

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal('too short, expect 10, got 6');

      validator = new Validator({
        name: {
          type: 'string',
          min: 1,
          max: 5,
        },
      });

      errors = validator.validate({ name: 'Lalala' });

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal('too long, expect 5, got 6');
    });
    it('валидатор проверяет числовые поля', () => {
      const validator = new Validator({
        age: {
          type: 'number',
          min: -10,
          max: 10,
        },
      });

      let errors = validator.validate({ age: 15 });
      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('age');
      expect(errors[0]).to.have.property('error').and.to.be.equal('too big, value cannot be more than 10, got 15');

      errors = validator.validate({ age: -20 });
      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('age');
      expect(errors[0]).to.have.property('error').and.to.be.equal('too little, value cannot be less than -10, got -20');
    });
  });
});