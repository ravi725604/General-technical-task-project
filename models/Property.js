const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  categories:{
    type:String,
    enum:['commercial','residential', "luxury"],
  },
  purpose:{
    type:String,
    enum:['sale','rent'],
  },
  bedrooms: Number,
  propertyType:{
    type:String,
    enum:['house','apartment','condo','villa','penthouse'],
  },
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
