const mongoose = require("mongoose");
function withTransaction(fn) {
  return async function (...args) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await fn(session, ...args);
      await session.commitTransaction();
      console.log("Transaction committed successfully.");
    } catch (error) {
      console.error("Transaction failed:", error);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  };
}

module.exports = {
  withTransaction,
};
