const router = require('express').Router();
const { Tag, Product } = require('../../models');

// The `/api/tags` endpoint
router
  .route('/:id?')
  // find all tags or a single tag by its `id`
  // be sure to include its associated Product data
  .get(async (req, res) => {
    let tags;
    let associated = [{ model: Product }];
    let id = req.params ? req.params.id : undefined;
    try {
      if (id) {
        tags = await Tag.findByPk(id, {
          include: associated
        });
      } else {
        tags = await Tag.findAll({
          include: associated
        });
      }
      if (!tags) {
        return res
          .status(404)
          .json({ message: 'No tag associated with that id.' });
      }
      return res.status(200).json(tags);
    } catch (err) {
      if (err.parent && err.parent.code === 'ER_NO_SUCH_TABLE') {
        return res
          .status(404)
          .json({ message: 'No tag table, data does not exist.' });
      }
      console.error(err);
      return res.status(500).json(err);
    }
  })
  // create a new tag
  .post(async (req, res) => {
    try {
      let newTag = await Tag.create(req.body);
      return res.status(200).json(newTag);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  })
  // update a tag's name by its `id` value
  .put(async (req, res) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'No tag id specified.' });
      }
      let updatedTag = await Tag.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true
      });
      if (updatedTag.length && updatedTag[0] === 0) {
        return res.status(404).json({ message: 'No tag updated' });
      }
      return res.status(200).json({ message: 'Tag Updated' });
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  })
  // delete on tag by its `id` value
  .delete(async (req, res) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: 'No tag id specified.' });
      }
      let deletedTag = await Tag.destroy({
        where: {
          id: req.params.id
        }
      });
      if (!deletedTag) {
        return res.status(404).json({ message: 'No tag with id deleted.' });
      }
      return res.status(200).json({ message: 'Tag deleted.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });

module.exports = router;
