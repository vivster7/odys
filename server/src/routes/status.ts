import express from 'express';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send({ response: 'I am alive' }).status(200);
});

module.exports = router;
