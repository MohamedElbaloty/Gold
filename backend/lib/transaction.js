const mongoose = require('mongoose');

/**
 * Run a callback with an optional MongoDB transaction.
 * If the server is not a replica set member, transactions are not supported;
 * we run the same callback with session = null (no transaction, no atomicity).
 * @param {function(session: ClientSession | null): Promise<any>} fn - Async function receiving session (or null)
 * @returns {Promise<any>} - Result of fn
 */
async function withOptionalTransaction(fn) {
  let session = null;
  try {
    session = await mongoose.startSession();
    await session.startTransaction();
  } catch (err) {
    // Standalone MongoDB (or any session/transaction failure): run without transaction
    if (session) {
      try { await session.endSession(); } catch (_) {}
      session = null;
    }
    const msg = (err && (err.message || err.errmsg || String(err))) || '';
    if (!/transaction numbers|transactions.*replica|replica set|replication|mongos|not supported|only allowed/i.test(msg)) {
      console.warn('MongoDB session/transaction failed, running without transaction:', msg);
    }
  }

  try {
    const result = await fn(session);
    if (session) await session.commitTransaction();
    return result;
  } catch (err) {
    if (session) try { await session.abortTransaction(); } catch (_) {}
    throw err;
  } finally {
    if (session) try { session.endSession(); } catch (_) {}
  }
}

/** Options object for writes: { session } when session exists, {} otherwise */
function sessionOpts(session) {
  return session ? { session } : {};
}

/** Chain .session(session) only when session exists (avoids errors on standalone MongoDB) */
function withSession(query, session) {
  return session ? query.session(session) : query;
}

module.exports = { withOptionalTransaction, sessionOpts, withSession };
