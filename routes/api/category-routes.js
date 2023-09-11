const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint
router
  .route('/:id?')
  // find all categories
  // will also find one category by its `id` value
  .get(async (req, res) => {
    let categories;
    let associated = [{ model: Product }];
    let id = req.params ? req.params.id : undefined;
    try {
      if (id) {
        categories = await Category.findByPk(id, {
          include: associated
        });
      } else {
        categories = await Category.findAll({
          include: associated
        });
      }
      if (!categories) {
        return res
          .status(404)
          .json({ message: 'No category found with that id.' });
      }
      return res.status(200).json(categories);
    } catch (err) {
      if (err.parent && err.parent.code === 'ER_NO_SUCH_TABLE') {
        return res
          .status(404)
          .json({ message: 'No category table, data does not exist.' });
      }
      console.error(err);
      return res.status(500).json(err);
    }
  })
  // create a new category
  .post(async (req, res) => {
    try {
      let newCategory = await Category.create(req.body);
      return res.status(200).json(newCategory);
    } catch (err) {
      return res.status(400).json(err);
    }
  })
  // update a category by its `id` value
  .put(async (req, res) => {
    try {
      let updatedCategory = await Category.update(req.body, {
        where: {
          id: req.params.id
        },
        individualHooks: true
      });
      if (!updatedCategory.length) {
        return res.status(404).json({ message: 'No category with id.' });
      }
      return res.status(200).json([updatedCategory]);
    } catch (err) {
      return res.status(500).json(err);
    }
  })
  // delete a category by its `id` value
  .delete(async (req, res) => {
    try {
      let deletedCategory = await Category.destroy({
        where: {
          id: req.params.id
        }
      });
      if (!deletedCategory) {
        return res.status(404).json({ message: 'No category with id.' });
      }
      return res.status(200).json({ message: 'Category deleted.' });
    } catch (err) {
      return res.json(500).json(err);
    }
  });

module.exports = router;
