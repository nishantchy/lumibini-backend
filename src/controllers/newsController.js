const News = require("../models/News");

exports.getAllNews = async (req, res) => {
  const news = await News.find();
  res.json(news);
};

exports.getNewsById = async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return res.status(404).json({ message: "News not found" });
  res.json(news);
};

exports.createNews = async (req, res) => {
  const news = new News({ ...req.body, user: req.user });
  await news.save();
  res.status(201).json(news);
};

exports.updateNews = async (req, res) => {
  const news = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!news) return res.status(404).json({ message: "News not found" });
  res.json(news);
};

exports.deleteNews = async (req, res) => {
  const news = await News.findByIdAndDelete(req.params.id);
  if (!news) return res.status(404).json({ message: "News not found" });
  res.json({ message: "News deleted" });
};
