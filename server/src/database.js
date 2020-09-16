const auth = require('./auth');

const knex = require('knex')({
  client: 'sqlite3',
  connection: () => {
    if (!process.env.DB_PATH) {
      console.error('No database specified.');
      process.exit(1);
    }
    return {
      filename: process.env.DB_PATH,
    };
  },
  useNullAsDefault: true,
});

async function checkConnection() {
  return await knex
    .raw('select 1')
    .then(() => true)
    .catch((err) => {
      console.error(err);
      return false;
    });
}

function destroy() {
  knex.destroy();
}

async function initialize() {
  try {
    await knex.schema.dropTable('meta');
    await knex.schema.dropTable('users');
    await knex.schema.dropTable('pages');
    await knex.schema.dropTable('pages_archive');
  } catch (_err) {
    // console.error(err);
  }
  await knex.schema.createTable('meta', (table) => {
    table.integer('id').primary().unique();
    table.string('wikiname');
    table.string('basepath');
  });
  await knex('meta').insert({ id: 0, wikiname: 'Epoche', basepath: '/' });
  await knex.schema
    .createTable('users', (table) => {
      table.string('userid').primary().unique();
      table.string('password');
    })
    .createTable('pages', (table) => {
      table.string('pageid').primary().unique();
      table.string('title');
      table.text('content');
      table.timestamp('timestamp');
      table.string('author');
    })
    .createTable('pages_archive', (table) => {
      table.primary(['pageid', 'timestamp']);
      table.string('pageid');
      table.string('title');
      table.text('content');
      table.timestamp('timestamp');
      table.string('author');
    })
    .catch((err) => {
      console.error(err);
    });
}

async function setWikiname(wikiname) {
  await knex('meta')
    .where('id', 0)
    .update({
      wikiname: wikiname,
    })
    .catch((err) => {
      console.error(err);
    });
}

async function setBasepath(basepath) {
  await knex('meta')
    .where('id', 0)
    .update({
      basepath: basepath,
    })
    .catch((err) => {
      console.error(err);
    });
}

async function getMeta() {
  return await knex('meta')
    .select()
    .where('id', 0)
    .first()
    .catch((err) => {
      console.error(err);
      return null;
    });
}

async function addUser(userid, password) {
  let saltedHash = auth.hashPassword(password);
  await knex
    .insert({
      userid,
      password: saltedHash,
    })
    .into('users')
    .catch((err) => {
      console.error(err);
    });
}

async function deleteUser(userid) {
  await knex('users')
    .where('userid', userid)
    .del()
    .catch((err) => {
      console.error(err);
    });
}

async function getUser(userid) {
  let user = await knex('users')
    .select()
    .where('userid', userid)
    .first()
    .catch((err) => {
      console.error(err);
    });
  return user;
}

async function upsertPage(pageid, title, content, isSubstantial, author) {
  let rows = [];

  try {
    await knex.transaction(async (trx) => {
      if (!isSubstantial) {
        rows = await knex
          .raw(
            'insert into pages (`pageid`, `title`, `content`, `author`) values (:pageid, :title, :content, :author)' +
              ' on conflict (`pageid`) do update set `title` = :title, `content` = :content',
            {
              pageid,
              title,
              content,
              author,
            },
          )
          .transacting(trx);
      } else {
        rows = await knex
          .raw(
            'replace into pages values (:pageid, :title, :content, :timestamp, :author)',
            {
              pageid,
              title,
              content,
              timestamp: Date.now(),
              author,
            },
          )
          .transacting(trx);
        await knex
          .insert(knex('pages').select().where('pageid', pageid))
          .into('pages_archive')
          .transacting(trx);
      }
    });
  } catch (err) {
    console.error(err);
  }
  return rows.length > 0 ? rows[0] : {};
}

async function getPage(pageid) {
  const rows = await knex
    .select()
    .from('pages')
    .where('pageid', pageid)
    .orderBy('timestamp', 'desc')
    .catch((err) => {
      console.error(err);
    });
  return rows.length > 0 ? rows[0] : {};
}

async function getPageHistory(pageid, offset, limit) {
  offset = offset || 0;
  limit = !!limit && limit <= 50 ? limit : 10;
  const rows = await knex
    .select()
    .from('pages_archive')
    .where('pageid', pageid)
    .limit(limit)
    .offset(offset)
    .orderBy('timestamp', 'desc')
    .catch((err) => {
      console.error(err);
    });
  return rows;
}

async function search(q, offset, limit, order) {
  offset = offset || 0;
  limit = !!limit && limit <= 50 ? limit : 10;
  order = order || 'updated';

  let orderBy = ['timestamp', 'desc'];
  if (order === 'updated') {
    orderBy = ['timestamp', 'desc'];
  } else if (order === 'alphabetical') {
    orderBy = ['pageid', 'asc'];
  }

  if (q === '*') {
    const rows = await knex
      .select()
      .from('pages')
      .limit(limit)
      .offset(offset)
      .orderBy(...orderBy)
      .catch((err) => {
        console.error(err);
      });
    return rows;
  } else {
    const rows = await knex
      .select()
      .from('pages')
      .where('title', 'like', `%${q}%`)
      .where('pageid', 'like', `%${q}%`)
      .orWhere('content', 'like', `%${q}%`)
      .limit(limit)
      .offset(offset)
      .orderBy(...orderBy)
      .catch((err) => {
        console.error(err);
      });
    return rows;
  }
}

module.exports = {
  checkConnection,
  destroy,
  initialize,
  setWikiname,
  setBasepath,
  getMeta,
  addUser,
  deleteUser,
  getUser,
  upsertPage,
  getPage,
  getPageHistory,
  search,
};
