#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const promptly = require('promptly');
const fs = require('fs').promises;
const path = require('path');

const db = require('./server/src/database');

const DB_DEFAULT = 'epoche.db';

const fixture1 = [
    'MainPage',
    'MainPage',
    'Welcome to your wiki\n\n* [Sample](/Sample)\n',
    true,
    'system',
  ],
  fixture2 = [
    'Sample',
    'Sample page',
    'This page is a **sample** page.',
    true,
    'system',
  ];

program
  .command('start')
  .requiredOption('--db <filename>', 'load database at <filename>')
  .option('--port <num>', 'use port <num>', parseInt)
  .description('start wiki')
  .action(async (cmdObj) => {
    process.env.DB_PATH = cmdObj.db;
    process.env.PORT = cmdObj.port ? cmdObj.port : '';
    const meta = await db.getMeta();
    process.env.WIKINAME = meta.wikiname;
    process.env.BASEPATH = meta.basepath;
    require('./server/src/server');
  });

program
  .command('init <dir_or_filename>')
  .description(
    'initialize database at <dir_or_filename> (default filename: `epoche.db`)',
  )
  .action(async (dir_or_filename) => {
    try {
      const isDir = await fs
        .lstat(dir_or_filename)
        .then((stat) => stat.isDirectory())
        .catch((_err) => {
          /* No file or else */
        });
      process.env.DB_PATH = isDir
        ? path.join(dir_or_filename, DB_DEFAULT)
        : dir_or_filename;
      await db.initialize();
      const wikiname = await promptly.prompt(
        'Wiki name (default: `Epoche`): ',
        {
          default: 'Epoche',
        },
      );
      await db.setWikiname(wikiname);
      const basepath = await promptly.prompt(
        'Wiki base path (default: `/`): ',
        {
          default: '/',
        },
      );
      await db.setBasepath(basepath);
      const userid = await promptly.prompt('Default username: ');
      const password = await promptly.prompt('Default password: ', {
        silent: true,
      });
      await db.addUser(userid, password);
      await db.upsertPage(...fixture1);
      await db.upsertPage(...fixture2);
      db.destroy();
      console.log(
        `Done! To start, run: epoche start --db ${process.env.DB_PATH}`,
      );
    } catch (_) {
      // TODO: Clean up if a new file is created
      process.exit(-1);
    }
  });

program
  .command('add-user <userid> [password]')
  .requiredOption('--db <filename>', 'load database at <filename>')
  .description('add user')
  .action(async (userid, password, cmdObj) => {
    process.env.DB_PATH = cmdObj.db;
    password =
      password || (await promptly.prompt('Password: ', { silent: true }));
    await db.addUser(userid, password);
    db.destroy();
  });

program
  .command('delete-user <userid>')
  .requiredOption('--db <filename>', 'load database at <filename>')
  .description('delete user')
  .action(async (userid, cmdObj) => {
    process.env.DB_PATH = cmdObj.db;
    await db.deleteUser(userid);
    db.destroy();
  });

const config = program.command('config').description('configure wiki');

config
  .command('set-wikiname <name>')
  .requiredOption('--db <filename>', 'load database at <filename>')
  .description('set wiki name')
  .action(async (name, cmdObj) => {
    process.env.DB_PATH = cmdObj.db;
    await db.setWikiname(name);
    db.destroy();
  });

config
  .command('set-basepath <path_in_url>')
  .requiredOption('--db <filename>', 'load database at <filename>')
  .description('set basepath (default: `/`)')
  .action(async (path_in_url, cmdObj) => {
    process.env.DB_PATH = cmdObj.db;
    await db.setBasepath(path_in_url);
    db.destroy();
  });

program.parse(process.argv);
