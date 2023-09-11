const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint
router
  .route('/:id?')
  // find all products or a single product by its `id`
  // be sure to include its associated Category and Tag data
  .get(async (req, res) => {
    let products;
    let associated = [{ model: Category }, { model: Tag }];
    let id = req.params ? req.params.id : undefined;
    try {
      if (id) {
        products = await Product.findByPk(id, {
          include: associated
        });
      } else {
        products = await Product.findAll({
          include: associated
        });
      }
      if (!products || !Object.keys(products).length) {
        return res
          .status(404)
          .json({ message: 'No product found with that id.' });
      }
      return res.status(200).json(products);
    } catch (err) {
      if (err.parent && err.parent.code === 'ER_NO_SUCH_TABLE') {
        return res
          .status(404)
          .json({ message: 'No product table, data does not exist.' });
      }
      console.error(err);
      return res.status(500).json(err);
    }
  })
  // create new product
  .post(async (req, res) => {
    try {
      let newProduct = await Product.create(req.body);
      let jsonResponse = newProduct;
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return { product_id: newProduct.id, tag_id };
        });
        let productTagIds = await ProductTag.bulkCreate(productTagIdArr);
        jsonResponse['tag_ids'] = productTagIds;
      }
      // if no product tags, just respond
      return res.status(200).json(jsonResponse);
    } catch (err) {
      console.error(err);
      res.status(400).json(err);
    }
  })
  // update product
  .put(async (req, res) => {
    try {
      if (!req.params.id) {
        return res.status(404).json({ message: 'No product id specified.' });
      }
      let updatedProduct = await Product.update(req.body, {
        where: { id: req.params.id }
      });
      let jsonResponse = updatedProduct;
      if (req.body.tagIds && req.body.tagIds.length) {
        let productTags = await ProductTag.findAll({
          where: { product_id: req.params.id }
        });
        // create filtered list of new tag_ids
        let productTagIds = productTags.map(({ tag_id }) => tag_id);
        let newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return { product_id: req.params.id, tag_id };
          });
        // figure out which ones to remove
        let productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
        let removedTags = await ProductTag.destroy({
          where: { id: productTagsToRemove }
        });
        let newTags = await ProductTag.bulkCreate(newProductTags);
        jsonResponse['removed_tags'] = removedTags;
        jsonResponse['newProduct_tags'] = newTags;
      }

      return res.status(200).json(jsonResponse);
    } catch (err) {
      console.error(err);
      return res.status(400).json(err);
    }
  })
  // delete one product by its `id` value
  .delete(async (req, res) => {
    if (!req.params.id) {
      return res.status(404).json({ message: 'No product id specified.' });
    }
    try {
      let deletedProduct = await Product.destroy({
        where: {
          id: req.params.id
        }
      });
      if (!deletedProduct) {
        return res.status(404).json({ message: 'No product with id.' });
      }
      return res.status(200).json({ message: 'Product deleted.' });
    } catch (err) {
      return res.json(500).json(err);
    }
  });

module.exports = router;
