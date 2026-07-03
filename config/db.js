const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // በ .env ፋይል ውስጥ ያለውን MONGO_URI ጥቅምና ካልተገኘ ደግሞ በ local እንዲሰራ ያደርጋል
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bingo_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(💾 MongoDB Connected: ${conn.connection.host});
  } catch (error) {
    console.error(❌ Database Connection Error: ${error.message});
    process.exit(1); // ስህተት ካለ ፕሮግራሙን ያቆመዋል
  }
};

module.exports = connectDB;
