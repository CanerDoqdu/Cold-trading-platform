import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
  coinId: { type: String, required: true }, // CoinGecko coin ID (e.g., "bitcoin")
  symbol: { type: String, required: true }, // Coin symbol (e.g., "BTC")
  name: { type: String, required: true }, // Coin name (e.g., "Bitcoin")
  amount: { type: Number, required: true }, // Amount of coins
  buyPrice: { type: Number, required: true }, // Price per coin when bought
  buyDate: { type: Date, default: Date.now }, // Date of purchase
  notes: { type: String, default: "" }, // Optional notes
});

const portfolioSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true 
  },
  holdings: [holdingSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
portfolioSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

const Portfolio = mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
