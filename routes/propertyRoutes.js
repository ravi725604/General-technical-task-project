const express = require('express');
const Property = require('../models/property');
const router = express.Router();

// Create a new property
router.post('/', async (req, res) => {
  const property = new Property(req.body);
  await property.save();
  res.status(201).send(property);
});

// Get all properties
router.get('/', async (req, res) => {
  const properties = await Property.find();
  res.status(200).send(properties);
});

// Get a single property by ID
router.get('/:id', async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).send('Property not found');
  res.status(200).send(property);
});

// Update a property
router.put('/:id', async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!property) return res.status(404).send('Property not found');
  res.status(200).send(property);
});

// Delete a property
router.delete('/:id', async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) return res.status(404).send('Property not found');
  res.status(200).send({ message: 'Property deleted' });
});

module.exports = router;
