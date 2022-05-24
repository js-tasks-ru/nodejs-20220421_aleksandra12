const mongoose = require('mongoose');
const connection = require('../libs/connection');

const subCategorySchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
});

const categorySchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	// почему такой формат записи связи проваливает тесты? На уроке именно такой вид разбирали
	// subcategories: [{
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: 'SubCategory',
	// }],
	subcategories: [subCategorySchema]
});

module.exports = connection.model('Category', categorySchema);
